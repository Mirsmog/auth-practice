import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({ data: createUserDto });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async findOne(query: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ id: query, email: query }] },
      });
      return user;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
