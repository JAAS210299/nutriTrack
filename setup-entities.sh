#!/bin/bash
# NutriTrack — crea todas las entidades TypeORM y actualiza app.module.ts
set -e

mkdir -p backend/src/users/entities
mkdir -p backend/src/foods/entities
mkdir -p backend/src/nutrition/entities
mkdir -p backend/src/goals/entities

# ── 1. User entity ────────────────────────────────────────────────────────────
cat > backend/src/users/entities/user.entity.ts << 'ENDOFFILE'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { DailyLog } from '../../nutrition/entities/daily-log.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { Food } from '../../foods/entities/food.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToMany(() => DailyLog, log => log.user)
  dailyLogs: DailyLog[];

  @OneToMany(() => Goal, goal => goal.user)
  goals: Goal[];

  @OneToMany(() => Food, food => food.createdBy)
  foods: Food[];
}
ENDOFFILE

# ── 2. UserProfile entity ─────────────────────────────────────────────────────
cat > backend/src/users/entities/user-profile.entity.ts << 'ENDOFFILE'
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active',
}

export enum Objective {
  DEFICIT = 'deficit',
  MAINTENANCE = 'maintenance',
  SURPLUS = 'surplus',
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;

  @Column({ type: 'float', nullable: true })
  weightKg: number;

  @Column({ type: 'float', nullable: true })
  heightCm: number;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'enum', enum: Sex, nullable: true })
  sex: Sex;

  @Column({ type: 'enum', enum: ActivityLevel, default: ActivityLevel.SEDENTARY })
  activityLevel: ActivityLevel;

  @Column({ type: 'enum', enum: Objective, default: Objective.MAINTENANCE })
  objective: Objective;

  @Column({ type: 'float', nullable: true })
  bmr: number;

  @Column({ type: 'float', nullable: true })
  tdee: number;

  @Column({ type: 'float', nullable: true })
  targetCalories: number;

  @Column({ type: 'float', nullable: true })
  targetProteinG: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
ENDOFFILE

# ── 3. Food entity ────────────────────────────────────────────────────────────
cat > backend/src/foods/entities/food.entity.ts << 'ENDOFFILE'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LogEntry } from '../../nutrition/entities/log-entry.entity';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float' })
  caloriesPer100g: number;

  @Column({ type: 'float' })
  proteinG: number;

  @Column({ type: 'float' })
  carbsG: number;

  @Column({ type: 'float' })
  fatG: number;

  @Column({ default: false })
  isCustom: boolean;

  @ManyToOne(() => User, user => user.foods, { nullable: true, eager: false })
  @JoinColumn()
  createdBy: User;

  @OneToMany(() => LogEntry, entry => entry.food)
  logEntries: LogEntry[];

  @CreateDateColumn()
  createdAt: Date;
}
ENDOFFILE

# ── 4. DailyLog entity ────────────────────────────────────────────────────────
cat > backend/src/nutrition/entities/daily-log.entity.ts << 'ENDOFFILE'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LogEntry } from './log-entry.entity';

@Entity('daily_logs')
export class DailyLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.dailyLogs)
  @JoinColumn()
  user: User;

  @Column({ type: 'date' })
  logDate: string;

  @Column({ type: 'float', default: 0 })
  totalCalories: number;

  @Column({ type: 'float', default: 0 })
  totalProteinG: number;

  @Column({ type: 'float', default: 0 })
  totalCarbsG: number;

  @Column({ type: 'float', default: 0 })
  totalFatG: number;

  @OneToMany(() => LogEntry, entry => entry.dailyLog, { cascade: true })
  entries: LogEntry[];

  @CreateDateColumn()
  createdAt: Date;
}
ENDOFFILE

# ── 5. LogEntry entity ────────────────────────────────────────────────────────
cat > backend/src/nutrition/entities/log-entry.entity.ts << 'ENDOFFILE'
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
ENDOFFILE

# ── 6. Goal entity ────────────────────────────────────────────────────────────
cat > backend/src/goals/entities/goal.entity.ts << 'ENDOFFILE'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.goals)
  @JoinColumn()
  user: User;

  @Column({ type: 'float' })
  targetCalories: number;

  @Column({ type: 'float' })
  targetProteinG: number;

  @Column({ type: 'int' })
  deficitSurplusKcal: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({ default: true })
  isActive: boolean;
}
ENDOFFILE

# ── 7. app.module.ts actualizado ──────────────────────────────────────────────
cat > backend/src/app.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { UserProfile } from './users/entities/user-profile.entity';
import { Food } from './foods/entities/food.entity';
import { DailyLog } from './nutrition/entities/daily-log.entity';
import { LogEntry } from './nutrition/entities/log-entry.entity';
import { Goal } from './goals/entities/goal.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, UserProfile, Food, DailyLog, LogEntry, Goal],
      synchronize: true,
      charset: 'utf8mb4',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
ENDOFFILE

echo ""
echo "✅ Entidades creadas correctamente:"
find backend/src -name "*.entity.ts" | sort
echo ""
echo "✅ app.module.ts actualizado"
