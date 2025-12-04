import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Content } from '../content/entities/content.entity';

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // Despite the name, this is actually hashed in AuthService::register.
  @Column()
  password: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @OneToMany(() => Content, (content) => content.creator)
  content: Content[];
}
