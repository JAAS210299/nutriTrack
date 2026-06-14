import { UserProfile } from './user-profile.entity';
import { DailyLog } from '../../nutrition/entities/daily-log.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { Food } from '../../foods/entities/food.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare class User {
    id: number;
    email: string;
    password: string;
    role: UserRole;
    isVerified: boolean;
    verificationToken: string | null;
    resetToken: string | null;
    resetTokenExpires: Date | null;
    createdAt: Date;
    profile: UserProfile;
    dailyLogs: DailyLog[];
    goals: Goal[];
    foods: Food[];
}
