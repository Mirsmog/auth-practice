import ms from 'ms';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccessTokenPayload } from './entities/access-token.entity';
import { RefreshTokenPayload } from './entities/refresh-token.entity';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly JWT_ACCESS_KEY = this.configService.getOrThrow<string>('JWT_ACCESS_KEY');
  private readonly JWT_ACCESS_EXPIN = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIN');
  private readonly JWT_REFRESH_KEY = this.configService.getOrThrow<string>('JWT_REFRESH_KEY');
  private readonly JWT_REFRESH_EXPIN = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIN');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const payload: RefreshTokenPayload = this.jwtService.verify(token, {
      secret: this.JWT_REFRESH_KEY,
    });

    const existingToken = await this.findRefreshToken(payload.jti);

    if (
      existingToken &&
      !existingToken.revoked &&
      (await bcrypt.compare(token, existingToken.hashedToken))
    ) {
      return payload;
    }

    throw new UnauthorizedException('Invalid token');
  }

  async generateTokens(user: User, jti: string) {
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user, jti);
    await this.saveRefreshToken(user.id, refresh_token.token, jti);

    return {
      access_token,
      refresh_token,
    };
  }

  async findRefreshToken(id: string) {
    try {
      return await this.prisma.refreshToken.findUnique({ where: { id } });
    } catch (error) {
      throw new Error(error);
    }
  }

  async revokeRefreshToken(id: string) {
    try {
      return await this.prisma.refreshToken.update({
        where: { id },
        data: { revoked: true },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  private generateAccessToken(user: User) {
    const expIn = Math.floor((Date.now() + ms(this.JWT_ACCESS_EXPIN)) / 1000);
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      exp: expIn,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.JWT_ACCESS_KEY,
    });
    return { token, expIn };
  }

  private generateRefreshToken(user: User, jti: string) {
    const expIn = Math.floor((Date.now() + ms(this.JWT_REFRESH_EXPIN)) / 1000);
    const payload: RefreshTokenPayload = {
      jti,
      sub: user.id,
      email: user.email,
      exp: expIn,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.JWT_REFRESH_KEY,
    });
    return { token, expIn };
  }

  private async saveRefreshToken(userId: string, token: string, jti: string) {
    const hashedToken = await bcrypt.hash(token, 10);
    const savedToken = await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        hashedToken,
      },
    });
    return savedToken;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async deleteExpiredTokens() {
    this.logger.log('Cleaning up refresh tokens...');
    const expirationDate = new Date(Date.now() - ms(this.JWT_REFRESH_EXPIN)).toISOString();

    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ revoked: true }, { createdAt: { lt: expirationDate } }],
      },
    });
    this.logger.log(`Deleted ${result.count} expired/revoked tokens.`);
  }
}
