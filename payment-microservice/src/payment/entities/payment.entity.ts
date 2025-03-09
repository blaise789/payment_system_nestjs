import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('float')
  amount: number;
  // User target entity (user) target relationship mapping
  sessionId: string;
  @ManyToOne(() => User, (user) => user.payments)
  userId: string;
  status: string;
}
