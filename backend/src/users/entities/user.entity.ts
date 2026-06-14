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
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken!: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile!: UserProfile;

  @OneToMany(() => DailyLog, log => log.user)
  dailyLogs!: DailyLog[];

  @OneToMany(() => Goal, goal => goal.user)
  goals!: Goal[];

  @OneToMany(() => Food, food => food.createdBy)
  foods!: Food[];
}