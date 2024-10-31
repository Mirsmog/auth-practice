import { OmitType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  userId: string;

  @IsString()
  @MinLength(4)
  @MaxLength(64)
  title: string;

  @IsString()
  @MinLength(4)
  @MaxLength(256)
  description: string;
}

export class CreateTodoBodyDto extends OmitType(CreateTodoDto, ['userId']) {}
