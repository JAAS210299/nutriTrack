import { ActivityLevel, Objective, Sex } from '../entities/user-profile.entity';
export declare class UpdateProfileDto {
    weightKg?: number;
    heightCm?: number;
    age?: number;
    sex?: Sex;
    activityLevel?: ActivityLevel;
    objective?: Objective;
    bmr?: number;
    tdee?: number;
    targetCalories?: number;
    targetProteinG?: number;
}
