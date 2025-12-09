import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ContentType } from '../dto/create-content.dto';
import { User } from '../../users/user.entity';

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-json', { nullable: true })
  tags: { name: string }[];

  @Column({ type: 'datetime', nullable: true })
  deadline: Date;

  @Column({ type: 'uuid', nullable: true })
  creatorId: string;

  @ManyToOne(() => User, (user) => user.content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column('simple-json', { nullable: true })
  prerequisites: { contentId: string }[];

  @Column({ type: 'simple-enum', enum: ContentType, default: ContentType.TEXT })
  type: ContentType;

  @Column({ type: 'uuid', nullable: true })
  parentContentId: string;

  @ManyToOne(() => Content, (content) => content.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentContentId' })
  parentContent: Content;

  @OneToMany(() => Content, (content) => content.parentContent)
  children: Content[];

  @Column({ type: 'uuid', nullable: true })
  groupInstructorId: string;

  @ManyToOne(() => User, (user) => user.instructedGroups)
  @JoinColumn({ name: 'groupInstructorId' })
  groupInstructor: User;

  @Column({ nullable: true })
  text?: string;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column('simple-json', { nullable: true })
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