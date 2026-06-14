import { DailyLog } from './daily-log.entity';
import { Food } from '../../foods/entities/food.entity';
export declare enum MealType {
    BREAKFAST = "breakfast",
    LUNCH = "lunch",
    DINNER = "dinner",
    SNACK = "snack"
}
export declare class LogEntry {
    id: number;
    dailyLog: DailyLog;
    food: Food;
    mealType: MealType;
    quantityG: number;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
}
