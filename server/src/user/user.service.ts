import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: dto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findById(id: string): Promise<User> {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && (await this.isEmailAvailable(dto.email))) {
      throw new ConflictException('Email is already taken');
    }

    if (dto.password) {
      dto.password = await this.hashPassword(dto.password);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string): Promise<{ id: string }> {
    try {
      return await this.prisma.user.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private async isEmailAvailable(email: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) return false;
    return true;
  }
}
