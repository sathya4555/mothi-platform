import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';

export enum DocumentType {
  BILL = 'bill',
  LR = 'lr',
  COURIER_DOC = 'courier_doc',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  purchaseId: number;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @CreateDateColumn()
  uploadedAt: Date;

  // Relationships
  @ManyToOne(() => Purchase, (purchase) => purchase.documents)
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;
}
