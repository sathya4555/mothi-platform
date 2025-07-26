import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';
import { Product } from './product.entity';
import { Subcategory } from './subcategory.entity';
import { QuantityType } from './quantity-type.enum';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  purchaseId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int', nullable: true })
  subcategoryId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: QuantityType,
    default: QuantityType.PIECE,
  })
  quantityType: QuantityType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  // Relationships
  @ManyToOne(() => Purchase, (purchase) => purchase.purchaseItems)
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;

  @ManyToOne(() => Product, (product) => product.purchaseItems)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.purchaseItems)
  @JoinColumn({ name: 'subcategoryId' })
  subcategory: Subcategory;
}
