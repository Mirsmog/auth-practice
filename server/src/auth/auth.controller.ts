import { Request, Response } from 'express';
import { Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { CookieService } from './cookie.service';
import { RefreshTokenPayload } from 'src/token/entities/refresh-token.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@CurrentUser() user: User, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(user);

    this.cookieService.setCookie(res, 'Refresh', refreshToken.token, {
      expires: new Date(refreshToken.expires * 1000),
    });

    res.send(accessToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res() res: Response) {
    const token: string = req.cookies.Refresh;

    if (token) {
      this.authService.logout(token);
      this.cookieService.clearCookie(res, 'Refresh');
    }

    res.status(200).send({ message: 'Logout successful' });
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: any, @Res() res: Response) {
    const payload: RefreshTokenPayload = req.user;
    const { refreshToken, accessToken } = await this.authService.refreshTokens(payload);

    this.cookieService.setCookie(res, 'Refresh', refreshToken.token, {
      expires: new Date(refreshToken.expires * 1000),
    });

    res.send(accessToken);
  }
}
