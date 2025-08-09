import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { PurchaseItem } from './purchase-item.entity';

export enum SubcategoryCategory {
  SMALL = 'small',
  BIG = 'big',
  KING = 'king',
}

@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  activationDate: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pieceValue: number;

  @Column({
    type: 'enum',
    enum: SubcategoryCategory,
    default: SubcategoryCategory.SMALL,
  })
  category: SubcategoryCategory;

  // Relationships
  @ManyToOne(() => Product, (product) => product.subcategories)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.subcategory)
  purchaseItems: PurchaseItem[];
}
