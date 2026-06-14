import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { MealType } from '../entities/log-entry.entity';

export class UpdateEntryDto {
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantityG?: number;
}
