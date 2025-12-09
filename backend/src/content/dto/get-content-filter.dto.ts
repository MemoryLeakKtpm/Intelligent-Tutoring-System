import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsUUID,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetContentFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100) 
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsUUID()
  instructorId?: string;

  

  @IsOptional()
  @IsString()
  @IsUUID()
  parentContentId?: string;

  @IsOptional()
  @IsString()
      
  isRoot?: string;
}