import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(32)
    name?: string;

    @IsOptional()
    @IsEmail()
    @MinLength(2)
    @MaxLength(254)
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(32)
    password?: string;
}