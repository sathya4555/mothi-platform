import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import {
  Purchase,
  SalesType,
  PurchaseStatus,
} from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';
import { Party } from '../entities/party.entity';
import { Subcategory } from '../entities/subcategory.entity';
import { User } from '../entities/user.entity';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
    @InjectRepository(Party)
    private partyRepository: Repository<Party>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(
    createPurchaseDto: CreatePurchaseDto,
    agentId: number,
  ): Promise<Purchase> {
    // Check if unique ID already exists
    const existingPurchase = await this.purchaseRepository.findOne({
      where: { uniqueId: createPurchaseDto.uniqueId },
    });

    if (existingPurchase) {
      throw new ConflictException(
        'Purchase with this Unique ID already exists',
      );
    }

    // Verify party exists
    const party = await this.partyRepository.findOne({
      where: { id: createPurchaseDto.partyId },
    });

    if (!party) {
      throw new NotFoundException('Party not found');
    }

    // Verify agent owns the party
    const agent = await this.userRepository.findOne({
      where: { id: agentId },
    });

    if (agent.role === 'agent' && party.createdBy !== agentId) {
      throw new ForbiddenException(
        'You can only create purchases for parties you own',
      );
    }

    // Calculate totals
    const { totalAmount, gstAmount, finalAmount } =
      this.calculatePurchaseTotals(createPurchaseDto);

    // Create purchase
    const purchase = this.purchaseRepository.create({
      ...createPurchaseDto,
      agentId,
      totalAmount,
      gstAmount,
      finalAmount,
      status: PurchaseStatus.CONFIRMATION_PENDING,
    });

    const savedPurchase = await this.purchaseRepository.save(purchase);

    // Create purchase items
    const purchaseItems = await Promise.all(
      createPurchaseDto.items.map(async (item) => {
        // Verify product exists
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        // Verify subcategory if provided
        if (item.subcategoryId) {
          const subcategory = await this.subcategoryRepository.findOne({
            where: { id: item.subcategoryId, productId: item.productId },
          });

          if (!subcategory) {
            throw new NotFoundException(
              `Subcategory with ID ${item.subcategoryId} not found for product ${item.productId}`,
            );
          }
        }

        const itemTotal = item.quantity * item.unitPrice;
        const itemDiscount = item.discount
          ? (itemTotal * item.discount) / 100
          : 0;
        const totalPrice = itemTotal - itemDiscount;

        return this.purchaseItemRepository.create({
          ...item,
          purchaseId: savedPurchase.id,
          totalPrice,
        });
      }),
    );

    await this.purchaseItemRepository.save(purchaseItems);

    return this.findOne(savedPurchase.id, agentId, 'agent');
  }

  async findAll(
    userId: number,
    userRole: string,
    filters?: any,
  ): Promise<{
    items: Purchase[];
    total: number;
    page: number;
    limit: number;
  }> {
    let query = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.agent', 'agent')
      .leftJoinAndSelect('purchase.party', 'party')
      .leftJoinAndSelect('purchase.purchaseItems', 'purchaseItems')
      .leftJoinAndSelect('purchaseItems.subcategory', 'subcategory')
      .orderBy('purchase.createdAt', 'DESC');

    // Apply role-based filtering
    if (userRole === 'agent') {
      query = query.where('purchase.agentId = :userId', { userId });
    }

    // Apply filters
    if (filters) {
      if (filters.dateFrom && filters.dateTo) {
        query = query.andWhere(
          'purchase.invoiceDate BETWEEN :dateFrom AND :dateTo',
          {
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
          },
        );
      }

      if (filters.partyName) {
        query = query.andWhere('party.name ILIKE :partyName', {
          partyName: `%${filters.partyName}%`,
        });
      }

      if (filters.status) {
        query = query.andWhere('purchase.status = :status', {
          status: filters.status,
        });
      }

      if (filters.salesType) {
        query = query.andWhere('purchase.salesType = :salesType', {
          salesType: filters.salesType,
        });
      }

      if (
        filters.agentId &&
        (userRole === 'admin' || userRole === 'coordinator')
      ) {
        query = query.andWhere('purchase.agentId = :agentId', {
          agentId: filters.agentId,
        });
      }
    }

    const page = Math.max(parseInt(filters?.page as any) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(filters?.limit as any) || 10, 1),
      100,
    );
    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<Purchase> {
    let query = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.agent', 'agent')
      .leftJoinAndSelect('purchase.party', 'party')
      .leftJoinAndSelect('purchase.purchaseItems', 'purchaseItems')
      .leftJoinAndSelect('purchaseItems.subcategory', 'subcategory')
      .where('purchase.id = :id', { id });

    if (userRole === 'agent') {
      query = query.andWhere('purchase.agentId = :userId', { userId });
    }

    const purchase = await query.getOne();

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  async update(
    id: number,
    updatePurchaseDto: UpdatePurchaseDto,
    userId: number,
    userRole: string,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id, userId, userRole);

    // Check if unique ID is being changed and if it already exists
    if (
      updatePurchaseDto.uniqueId &&
      updatePurchaseDto.uniqueId !== purchase.uniqueId
    ) {
      const existingPurchase = await this.purchaseRepository.findOne({
        where: { uniqueId: updatePurchaseDto.uniqueId },
      });

      if (existingPurchase) {
        throw new ConflictException(
          'Purchase with this Unique ID already exists',
        );
      }
    }

    // Recalculate totals if items are being updated
    if (updatePurchaseDto.items) {
      const { totalAmount, gstAmount, finalAmount } =
        this.calculatePurchaseTotals({
          ...purchase,
          ...updatePurchaseDto,
        });
      updatePurchaseDto.totalAmount = totalAmount;
      updatePurchaseDto.gstAmount = gstAmount;
      updatePurchaseDto.finalAmount = finalAmount;
    }

    Object.assign(purchase, updatePurchaseDto);
    return this.purchaseRepository.save(purchase);
  }

  async remove(id: number, userId: number, userRole: string): Promise<void> {
    const purchase = await this.findOne(id, userId, userRole);
    await this.purchaseRepository.remove(purchase);
  }

  async updateStatus(
    id: number,
    status: PurchaseStatus,
    userId: number,
    userRole: string,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id, userId, userRole);

    // Auto-generate invoice number when status changes to completed
    if (status === PurchaseStatus.COMPLETED && !purchase.invoiceNumber) {
      return this.generateInvoiceNumber(id, userId, userRole);
    }

    purchase.status = status;
    return this.purchaseRepository.save(purchase);
  }

  async generateInvoiceNumber(
    id: number,
    userId: number,
    userRole: string,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id, userId, userRole);

    if (purchase.invoiceNumber) {
      throw new BadRequestException('Invoice number already exists');
    }

    // Get current date components
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Get the latest invoice number for this month
    const latestInvoice = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .where('purchase.invoiceNumber LIKE :pattern', {
        pattern: `INV-${year}${month}-%`,
      })
      .orderBy('purchase.invoiceNumber', 'DESC')
      .getOne();

    // Generate sequence number
    let sequence = 1;
    if (latestInvoice && latestInvoice.invoiceNumber) {
      const lastSequence = parseInt(latestInvoice.invoiceNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    // Format: INV-YYYYMM-XXXX (e.g., INV-202508-0001)
    const invoiceNumber = `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
    purchase.invoiceNumber = invoiceNumber;

    return this.purchaseRepository.save(purchase);
  }

  // Dashboard analytics methods
  async getDashboardStats(userId: number, userRole: string) {
    const baseQuery = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.party', 'party')
      .leftJoinAndSelect('purchase.purchaseItems', 'items')
      .where(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
        userId,
      });

    const [
      totalPurchases,
      pendingPayment,
      confirmationPending,
      processing,
      completed,
      totalSalesValue,
      salesByType,
      recentPurchases,
      uniqueParties,
    ] = await Promise.all([
      // Total purchases
      baseQuery.getCount(),

      // Pending payment count
      baseQuery
        .andWhere('purchase.status = :status', {
          status: PurchaseStatus.PAYMENT_PENDING,
        })
        .getCount(),

      // Confirmation pending count
      baseQuery
        .andWhere('purchase.status = :status', {
          status: PurchaseStatus.CONFIRMATION_PENDING,
        })
        .getCount(),

      // Processing count
      baseQuery
        .andWhere('purchase.status = :status', {
          status: PurchaseStatus.PROCESSING,
        })
        .getCount(),

      // Completed count
      baseQuery
        .andWhere('purchase.status = :status', {
          status: PurchaseStatus.COMPLETED,
        })
        .getCount(),

      // Total sales value
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('COALESCE(SUM(purchase.finalAmount), 0)', 'total')
        .where(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
          userId,
        })
        .getRawOne(),

      // Sales by type with amount
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('purchase.salesType', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(purchase.finalAmount), 0)', 'amount')
        .where(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
          userId,
        })
        .groupBy('purchase.salesType')
        .getRawMany(),

      // Recent purchases (last 5)
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .leftJoinAndSelect('purchase.party', 'party')
        .where(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
          userId,
        })
        .orderBy('purchase.createdAt', 'DESC')
        .take(5)
        .getMany(),

      // Unique parties count
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('COUNT(DISTINCT purchase.partyId)', 'count')
        .where(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
          userId,
        })
        .getRawOne(),
    ]);

    // Calculate average order value
    const avgOrderValue =
      totalPurchases > 0 ? totalSalesValue.total / totalPurchases : 0;

    return {
      summary: {
        totalPurchases,
        pendingPayment,
        confirmationPending,
        processing,
        completed,
      },
      sales: {
        totalValue: Number(totalSalesValue.total) || 0,
        averageOrderValue: Number(avgOrderValue.toFixed(2)),
        byType: salesByType.map((item) => ({
          type: item.type,
          count: Number(item.count),
          amount: Number(item.amount),
        })),
      },
      parties: {
        uniqueCount: Number(uniqueParties.count),
      },
      recentActivity: recentPurchases.map((purchase) => ({
        id: purchase.id,
        uniqueId: purchase.uniqueId,
        partyName: purchase.party.name,
        amount: purchase.finalAmount,
        status: purchase.status,
        date: purchase.createdAt,
      })),
    };
  }

  async getOverduePurchases(
    userId: number,
    userRole: string,
  ): Promise<{ overdue: any[]; summary: any }> {
    // For testing, use 1 minute ago instead of 7 days
    const oneMinuteAgo = new Date(new Date().getTime() - 60000);

    const baseQuery = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.agent', 'agent')
      .leftJoinAndSelect('purchase.party', 'party')
      .leftJoinAndSelect('purchase.purchaseItems', 'items')
      .where('purchase.createdAt < :oneMinuteAgo', { oneMinuteAgo })
      .andWhere('purchase.status != :completed', {
        completed: PurchaseStatus.COMPLETED,
      });

    if (userRole === 'agent') {
      baseQuery.andWhere('purchase.agentId = :userId', { userId });
    }

    // Get overdue purchases
    const overduePurchases = await baseQuery
      .orderBy('purchase.createdAt', 'ASC')
      .getMany();

    // Calculate summary statistics
    const [totalAmount, statusCounts] = await Promise.all([
      // Total overdue amount
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('COALESCE(SUM(purchase.finalAmount), 0)', 'total')
        .where('purchase.createdAt < :oneMinuteAgo', { oneMinuteAgo })
        .andWhere('purchase.status != :completed', {
          completed: PurchaseStatus.COMPLETED,
        })
        .andWhere(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
          userId,
        })
        .getRawOne(),

      // Count by status
      this.purchaseRepository
        .createQueryBuilder('purchase')
        .select('purchase.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('purchase.createdAt < :oneMinuteAgo', { oneMinuteAgo })
        .andWhere('purchase.status != :completed', {
          completed: PurchaseStatus.COMPLETED,
        })
        .andWhere(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
          userId,
        })
        .groupBy('purchase.status')
        .getRawMany(),
    ]);

    // Format overdue purchases
    const formattedOverdue = overduePurchases.map((purchase) => {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(purchase.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        id: purchase.id,
        uniqueId: purchase.uniqueId,
        partyName: purchase.party.name,
        partyId: purchase.partyId,
        agentName: purchase.agent.name,
        agentId: purchase.agentId,
        amount: purchase.finalAmount,
        status: purchase.status,
        createdAt: purchase.createdAt,
        daysOverdue,
        itemCount: purchase.purchaseItems.length,
      };
    });

    // Format status counts
    const statusCountMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = Number(curr.count);
      return acc;
    }, {});

    return {
      overdue: formattedOverdue,
      summary: {
        totalCount: formattedOverdue.length,
        totalAmount: Number(totalAmount.total) || 0,
        byStatus: statusCountMap,
      },
    };
  }

  private calculatePurchaseTotals(purchaseData: any) {
    let totalAmount = 0;

    // Calculate total from items
    purchaseData.items.forEach((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount
        ? (itemTotal * item.discount) / 100
        : 0;
      totalAmount += itemTotal - itemDiscount;
    });

    // Apply overall discount
    if (purchaseData.discount) {
      totalAmount = totalAmount - (totalAmount * purchaseData.discount) / 100;
    }

    // Calculate GST (5%)
    const gstAmount = totalAmount * 0.05;
    const finalAmount = totalAmount + gstAmount;

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
    };
  }
}
