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
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ContentType {
  TEXT = 'text',
  FILE = 'file',
  QUIZ = 'quiz',
}

export enum TagNamespace {
  SUBJECT = 'subject',
  DIFFICULTY = 'difficulty',
  CHAPTER = 'chapter',
}

class TagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MinLength(32)
  namespace: TagNamespace;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MinLength(32)
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
