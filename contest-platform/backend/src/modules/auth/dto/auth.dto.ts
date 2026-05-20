import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'gamemaster42' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;

  @ApiProperty({ required: false, example: 'Ahmet Yılmaz' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123' })
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'newSecurePass456', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'abc123def456' })
  @IsString()
  token: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPass123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPass456' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
