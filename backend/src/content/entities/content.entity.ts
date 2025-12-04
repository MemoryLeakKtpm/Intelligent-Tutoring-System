import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ChildEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContentType } from '../dto/create-content.dto';

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('json', { nullable: true })
  tags: { name: string }[];

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column('json', { nullable: true })
  prerequisites: { contentId: string }[];

  @Column({ type: 'enum', enum: ContentType, default: ContentType.TEXT })
  type: ContentType;

  @Column({ nullable: true })
  text?: string;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column('json', { nullable: true })
  questions?: {
    questionText: string;
    options: string[];
    correctAnswer: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
