import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Party } from './party.entity';
import { PurchaseItem } from './purchase-item.entity';
import { Document } from './document.entity';
import { QuantityType } from './quantity-type.enum';

export enum SalesType {
  SMALL = 'small',
  BIG = 'big',
  KING = 'king',
}

export enum PurchaseStatus {
  CONFIRMATION_PENDING = 'confirmation_pending',
  PROCESSING = 'processing',
  PAYMENT_PENDING = 'payment_pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  agentId: number;

  @Column({ type: 'int' })
  partyId: number;

  @Column({
    type: 'enum',
    enum: SalesType,
    default: SalesType.SMALL,
  })
  salesType: SalesType;

  @Column({ type: 'varchar', length: 100, unique: true })
  uniqueId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destination: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transport: string;

  @Column({ type: 'timestamp' })
  invoiceDate: Date;

  @Column({ type: 'timestamp' })
  orderPlacedDate: Date;

  @Column({ type: 'timestamp' })
  orderApprovalDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gstAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.CONFIRMATION_PENDING,
  })
  status: PurchaseStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  invoiceNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.purchases)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ManyToOne(() => Party, (party) => party.purchases)
  @JoinColumn({ name: 'partyId' })
  party: Party;

  @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.purchase)
  purchaseItems: PurchaseItem[];

  @OneToMany(() => Document, (document) => document.purchase)
  documents: Document[];
}
