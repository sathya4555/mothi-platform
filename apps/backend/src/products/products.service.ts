import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Subcategory, SubcategoryCategory } from '../entities/subcategory.entity';
import { CreateProductDto, CreateSubcategoryDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
  ) {}

  // Product methods
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      price: createProductDto.price || 0,
    });
    return this.productRepository.save(product);
  }

  async findAllProducts(): Promise<Product[]> {
    return this.productRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOneProduct(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Product> {
    const product = await this.findOneProduct(id);

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: updateProductDto.name },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this name already exists');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async removeProduct(id: number): Promise<void> {
    const product = await this.findOneProduct(id);
    await this.productRepository.remove(product);
  }

  // Subcategory methods
  async createSubcategory(
    createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<Subcategory> {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: createSubcategoryDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const subcategory = this.subcategoryRepository.create({
      ...createSubcategoryDto,
      pieceValue: createSubcategoryDto.pieceValue || 0,
      isActive: createSubcategoryDto.isActive ?? true,
    });
    return this.subcategoryRepository.save(subcategory);
  }

  async findAllSubcategories(): Promise<Subcategory[]> {
    return this.subcategoryRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findSubcategoriesByCategory(category: SubcategoryCategory): Promise<Subcategory[]> {
    return this.subcategoryRepository.find({
      where: { category, isActive: true },
      order: { value: 'ASC' },
    });
  }

  async findActiveSubcategories(): Promise<Subcategory[]> {
    return this.subcategoryRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', value: 'ASC' },
    });
  }

  async findOneSubcategory(id: number): Promise<Subcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    return subcategory;
  }

  async updateSubcategory(
    id: number,
    updateSubcategoryDto: Partial<CreateSubcategoryDto>,
  ): Promise<Subcategory> {
    const subcategory = await this.findOneSubcategory(id);
    Object.assign(subcategory, updateSubcategoryDto);
    return this.subcategoryRepository.save(subcategory);
  }

  async removeSubcategory(id: number): Promise<void> {
    const subcategory = await this.findOneSubcategory(id);
    await this.subcategoryRepository.remove(subcategory);
  }

  // Get all categories (White, Print, Color)
  async getCategories(): Promise<string[]> {
    const categories = await this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .select('DISTINCT subcategory.category', 'category')
      .getRawMany();

    return categories.map((cat) => cat.category);
  }
}
