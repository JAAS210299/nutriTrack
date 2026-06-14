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
