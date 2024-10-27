import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async findRefreshTokenByUserId(id: string) {
    const token = await this.prisma.refreshTokens.findUnique({ where: { id } });
    return token;
  }

  async addTokenToWhiteList(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const savedToken = await this.prisma.refreshTokens.create({
      data: {
        userId,
        token: hashedToken,
      },
    });
    return savedToken;
  }

  async deleteRefreshToken(id: string) {
    const token = await this.prisma.refreshTokens.update({
      where: { id },
      data: { isRevoked: true },
    });
    return token;
  }

  generatePairTokens(userId: string) {
    const accessToken = this.generateAcessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  generateAcessToken(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_KEY'),
      expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIN'),
    });
    return token;
  }

  generateRefreshToken(userId: string) {
    const payload = {
      userId,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_KEY'),
      expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIN'),
    });
    return token;
  }
}
