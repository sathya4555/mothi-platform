import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SalesType, PurchaseStatus } from '../../entities/purchase.entity';
import { QuantityType } from '../../entities/quantity-type.enum';

export class CreatePurchaseItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsOptional()
  subcategoryId?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsEnum(QuantityType)
  @IsNotEmpty()
  quantityType: QuantityType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discount?: number;
}

export class CreatePurchaseDto {
  @IsNumber()
  @IsNotEmpty()
  partyId: number;

  @IsEnum(SalesType)
  @IsNotEmpty()
  salesType: SalesType;

  @IsString()
  @IsNotEmpty()
  uniqueId: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  transport?: string;

  @IsDateString()
  @IsNotEmpty()
  invoiceDate: Date;

  @IsDateString()
  @IsNotEmpty()
  orderPlacedDate: Date;

  @IsDateString()
  @IsNotEmpty()
  orderApprovalDate: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
