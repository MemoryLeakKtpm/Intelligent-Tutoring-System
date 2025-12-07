import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class GetMultipleContentDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty({ each: true })
  ids: string[];
}
