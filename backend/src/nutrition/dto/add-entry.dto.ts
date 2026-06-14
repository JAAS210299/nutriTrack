import { IsNumber, IsEnum, Min } from 'class-validator';
import { MealType } from '../entities/log-entry.entity';

export class AddEntryDto {
  @IsNumber()
  foodId: number;

  @IsEnum(MealType)
  mealType: MealType;

  @IsNumber()
  @Min(1)
  quantityG: number;
}
