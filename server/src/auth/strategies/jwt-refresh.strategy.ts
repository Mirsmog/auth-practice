import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { TokensService } from 'src/tokens/tokens.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request.cookies.Refresh,
      ]),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request) {
    const payload = await this.tokensService.validateRefreshToken(
      request.cookies.Refresh,
    );
    const user = await this.usersService.findById(payload.userId);
    return user;
  }
}
