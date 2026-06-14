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
