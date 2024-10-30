import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [TokenService, PrismaService, JwtService, ConfigService],
  exports: [TokenService, JwtService, ConfigService],
})
export class TokenModule {}
