import { IsEmail, IsNotEmpty, IsEnum, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class RegisterDto {
    @IsEmail()
    @MinLength(2)
    @MaxLength(254)
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(32)
    password: string;


    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(32)
    name: string;

    @IsEnum(UserRole)
    role: UserRole;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}