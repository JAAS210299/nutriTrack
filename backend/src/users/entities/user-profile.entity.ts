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
