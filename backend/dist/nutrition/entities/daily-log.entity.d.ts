import { User } from '../../users/entities/user.entity';
import { LogEntry } from './log-entry.entity';
export declare class DailyLog {
    id: number;
    user: User;
    logDate: string;
    totalCalories: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    entries: LogEntry[];
    createdAt: Date;
}
