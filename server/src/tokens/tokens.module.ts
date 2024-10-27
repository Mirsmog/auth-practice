import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TokensService, ConfigService, JwtService, PrismaService],
})
export class TokensModule {}
