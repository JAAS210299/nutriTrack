import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ActivityLevel, Objective, Sex } from '../entities/user-profile.entity';

export class UpdateProfileDto {
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsEnum(Objective)
  objective?: Objective;

  @IsOptional()
  @IsNumber()
  bmr?: number;

  @IsOptional()
  @IsNumber()
  tdee?: number;

  @IsOptional()
  @IsNumber()
  targetCalories?: number;

  @IsOptional()
  @IsNumber()
  targetProteinG?: number;
}
