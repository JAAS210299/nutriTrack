import { User } from '../../users/entities/user.entity';
export declare class Goal {
    id: number;
    user: User;
    targetCalories: number;
    targetProteinG: number;
    deficitSurplusKcal: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}
