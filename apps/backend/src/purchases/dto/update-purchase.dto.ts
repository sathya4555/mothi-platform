import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseDto } from './create-purchase.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { PurchaseStatus } from '../../entities/purchase.entity';

export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) {
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @IsOptional()
  invoiceNumber?: string;

  @IsOptional()
  uniqueId?: string;

  @IsOptional()
  totalAmount?: number;

  @IsOptional()
  gstAmount?: number;

  @IsOptional()
  finalAmount?: number;
}
 