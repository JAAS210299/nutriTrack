import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DailyLog } from './daily-log.entity';
import { Food } from '../../foods/entities/food.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

@Entity('log_entries')
export class LogEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DailyLog, log => log.entries)
  @JoinColumn()
  dailyLog: DailyLog;

  @ManyToOne(() => Food, food => food.logEntries)
  @JoinColumn()
  food: Food;

  @Column({ type: 'enum', enum: MealType })
  mealType: MealType;

  @Column({ type: 'float' })
  quantityG: number;

  @Column({ type: 'float' })
  calories: number;

  @Column({ type: 'float' })
  proteinG: number;

  @Column({ type: 'float' })
  carbsG: number;

  @Column({ type: 'float' })
  fatG: number;
}
