import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { TokenPayloadEntity } from 'src/tokens/entities/token-payload.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.Refresh,
      ]),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayloadEntity) {
    return this.authService.validateUserRefreshToken(
      request.cookies.Refresh,
      payload.userId,
    );
  }
}