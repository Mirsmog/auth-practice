import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  ConflictException,
  NotFoundException,
  Get,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('Email is already taken');

    const hashedPassword = await this.hashPassword(dto.password);
    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return this.omitPassword(newUser);
  }

  @Get('profile')
  async profile(@CurrentUser('id') id: string) {
    const { password, ...user } = await this.userService.findById(id);
    return user;
  }

  @Get('all')
  async all() {
    return this.userService.findAll().then((users) => users.map((user) => this.omitPassword(user)));
  }

  @Patch()
  async update(@CurrentUser('id') id: string, @Body() dto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, dto);
    return this.omitPassword(updatedUser);
  }

  @Delete()
  async remove(@CurrentUser('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return await this.userService.remove(user.id);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private omitPassword(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
