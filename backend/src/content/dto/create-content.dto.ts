import {
  IsString,
  IsArray,
  IsOptional,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ContentType {
  TEXT = 'text',
  FILE = 'file',
  QUIZ = 'quiz',
  GROUP = 'group',
}

export enum TagNamespace {
  SUBJECT = 'subject',
  DIFFICULTY = 'difficulty',
  CHAPTER = 'chapter',
}

class TagDto {
  @IsEnum(TagNamespace)
  @IsNotEmpty()
  namespace: TagNamespace;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  name: string;
}

class PrerequisiteDto {
  @IsString()
  @IsNotEmpty()
  contentId: string;
}

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  options: string[];

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  @IsOptional()
  tags?: TagDto[];

  @IsDateString()
  @IsOptional()
  deadline?: Date;

  @IsOptional()
  @IsString()
  @IsUUID()
  parentContentId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  groupInstructorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrerequisiteDto)
  @IsOptional()
  prerequisites?: PrerequisiteDto[];

  @IsEnum(ContentType)
  type: ContentType;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];
}
