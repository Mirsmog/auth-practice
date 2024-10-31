import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateTodoDto) {
    try {
      return await this.prisma.todo.create({ data: dto });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findByUserId(userId: string) {
    try {
      return await this.prisma.todo.findMany({ where: { userId } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.todo.findUnique({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, dto: UpdateTodoDto) {
    try {
      return await this.prisma.todo.update({ where: { id }, data: dto });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.todo.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
