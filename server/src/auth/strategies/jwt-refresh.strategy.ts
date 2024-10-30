import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { RefreshTokenPayload } from 'src/token/entities/refresh-token.entity';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request) => request.cookies.Refresh]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_KEY'),
      passReqToCallback: true,
    });
  }
  async validate(request: Request) {
    const token: string = request.cookies.Refresh;
    if (!token) throw new UnauthorizedException('Token is missing');

    const payload: RefreshTokenPayload = await this.tokenService.validateRefreshToken(token);

    const user = await this.userService.findById(payload.sub);
    if (user) return { user, jti: payload.jti };

    throw new UnauthorizedException('Invalid token');
  }
}
