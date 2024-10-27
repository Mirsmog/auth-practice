import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(16)
  name?: string;
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;
}
