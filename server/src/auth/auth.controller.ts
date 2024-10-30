import { Request, Response } from 'express';
import { Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@CurrentUser() user: User, @Res() res: Response) {
    const { access_token, refresh_token } = await this.authService.login(user);

    res.cookie('Refresh', refresh_token.token, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      domain: 'localhost',
      expires: new Date(refresh_token.expIn * 1000),
    });

    res.send(access_token);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: any, @Res() res: Response) {
    const { jti } = req.user;
    res.cookie('Refresh', '');
    res.send(await this.authService.logout(jti));
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: any, @Res() res: Response) {
    const { user, jti } = req.user;

    const { access_token, refresh_token } = await this.authService.refreshTokens(user, jti);

    res.cookie('Refresh', refresh_token.token, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      domain: 'localhost',
      expires: new Date(refresh_token.expIn * 1000),
    });

    res.send(access_token);
  }
}
