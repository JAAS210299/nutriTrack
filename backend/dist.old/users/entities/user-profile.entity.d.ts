import { User } from './user.entity';
export declare enum Sex {
    MALE = "male",
    FEMALE = "female"
}
export declare enum ActivityLevel {
    SEDENTARY = "sedentary",
    LIGHT = "light",
    MODERATE = "moderate",
    ACTIVE = "active",
    VERY_ACTIVE = "very_active"
}
export declare enum Objective {
    DEFICIT = "deficit",
    MAINTENANCE = "maintenance",
    SURPLUS = "surplus"
}
export declare class UserProfile {
    id: number;
    user: User;
    weightKg: number;
    heightCm: number;
    age: number;
    sex: Sex;
    activityLevel: ActivityLevel;
    objective: Objective;
    bmr: number;
    tdee: number;
    targetCalories: number;
    targetProteinG: number;
    updatedAt: Date;
}
