import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsUUID,
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
  @Max(30)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsUUID()
  instructorId?: string;
}
