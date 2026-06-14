import { IsString, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  caloriesPer100g: number;

  @IsNumber()
  @Min(0)
  proteinG: number;

  @IsNumber()
  @Min(0)
  carbsG: number;

  @IsNumber()
  @Min(0)
  fatG: number;

  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;
}
