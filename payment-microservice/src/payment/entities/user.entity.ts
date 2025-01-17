import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  userID: string;
  @Column()
  username: string;
  @Column()
  email: string;
  @Column()
  password: string;
  // target entity target propert for mapping
  @OneToMany(() => Payment, (payment) => payment.userId)
  @JoinColumn()
  payments: Payment[];
}
