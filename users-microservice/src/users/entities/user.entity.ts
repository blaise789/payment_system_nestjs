import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
