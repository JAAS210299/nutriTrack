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
