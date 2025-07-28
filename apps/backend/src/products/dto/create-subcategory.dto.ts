import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { SubcategoryCategory } from '../../entities/subcategory.entity';

export class CreateSubcategoryDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @IsDateString()
  @IsOptional()
  activationDate?: Date;

  @IsNumber()
  @IsOptional()
  pieceValue?: number;

  @IsEnum(SubcategoryCategory)
  @IsNotEmpty()
  category: SubcategoryCategory;
}
