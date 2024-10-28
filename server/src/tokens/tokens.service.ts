import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async generateTokens(userId: string, jti: string) {
    const payload = { userId, jti };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_KEY'),
      expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIN'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_KEY'),
      expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIN'),
    });
    return { accessToken, refreshToken };
  }

  async validateRefreshToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: this.config.getOrThrow('JWT_REFRESH_KEY'),
    });
    const storedToken = await this.prisma.refreshTokens.findUnique({
      where: { id: payload.jti },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      !bcrypt.compareSync(token, storedToken.token)
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    return payload;
  }

  async saveRefreshToken(userId: string, token: string, jti: string) {
    const hashedToken = await bcrypt.hash(token, 10);
    return this.prisma.refreshTokens.create({
      data: { id: jti, userId, token: hashedToken },
    });
  }

  async revokeRefreshToken(id: string) {
    return this.prisma.refreshTokens.update({
      where: { id },
      data: { isRevoked: true },
    });
  }
}
