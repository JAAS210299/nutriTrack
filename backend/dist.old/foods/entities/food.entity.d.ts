import { User } from '../../users/entities/user.entity';
import { LogEntry } from '../../nutrition/entities/log-entry.entity';
export declare class Food {
    id: number;
    name: string;
    caloriesPer100g: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    isCustom: boolean;
    createdBy: User;
    logEntries: LogEntry[];
    createdAt: Date;
}
