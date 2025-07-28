import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
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
    const purchaseItems = createPurchaseDto.items.map((item) =>
      this.purchaseItemRepository.create({
        ...item,
        purchaseId: savedPurchase.id,
      }),
    );

    await this.purchaseItemRepository.save(purchaseItems);

    return this.findOne(savedPurchase.id, agentId, 'agent');
  }

  async findAll(
    userId: number,
    userRole: string,
    filters?: any,
  ): Promise<Purchase[]> {
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

    return query.getMany();
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

    // Generate invoice number (you can customize this logic)
    const invoiceNumber = `INV-${Date.now()}-${purchase.id}`;
    purchase.invoiceNumber = invoiceNumber;

    return this.purchaseRepository.save(purchase);
  }

  // Dashboard analytics methods
  async getDashboardStats(userId: number, userRole: string) {
    const baseQuery = this.purchaseRepository
      .createQueryBuilder('purchase')
      .where(userRole === 'agent' ? 'purchase.agentId = :userId' : '1=1', {
        userId,
      });

    const [
      totalPurchases,
      pendingPayment,
      confirmationPending,
      processing,
      totalSalesValue,
      salesByType,
    ] = await Promise.all([
      baseQuery.getCount(),
      baseQuery
        .andWhere('purchase.status = :status', {
          status: PurchaseStatus.PAYMENT_PENDING,
        })
        .getCount(),
      baseQuery
        .andWhere('purchase.status = :status', {
          status: PurchaseStatus.CONFIRMATION_PENDING,
        })
        .getCount(),
      baseQuery
        .andWhere('purchase.status = :status', {
          status: PurchaseStatus.PROCESSING,
        })
        .getCount(),
      baseQuery.select('SUM(purchase.finalAmount)', 'total').getRawOne(),
      baseQuery
        .select('purchase.salesType', 'salesType')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(purchase.finalAmount)', 'total')
        .groupBy('purchase.salesType')
        .getRawMany(),
    ]);

    return {
      totalPurchases,
      pendingPayment,
      confirmationPending,
      processing,
      totalSalesValue: totalSalesValue?.total || 0,
      salesByType,
    };
  }

  async getOverduePurchases(
    userId: number,
    userRole: string,
  ): Promise<Purchase[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let query = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.agent', 'agent')
      .leftJoinAndSelect('purchase.party', 'party')
      .where('purchase.invoiceDate < :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('purchase.status != :completed', {
        completed: PurchaseStatus.COMPLETED,
      })
      .orderBy('purchase.invoiceDate', 'ASC');

    if (userRole === 'agent') {
      query = query.andWhere('purchase.agentId = :userId', { userId });
    }

    return query.getMany();
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
