import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: any, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );

    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.send({ accessToken });
  }

  @Public()
  @Post('register')
  async register(@Res() res: Response, @Body() dto: CreateUserDto) {
    const { accessToken, refreshToken } = await this.authService.register(dto);

    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.send({ accessToken });
  }

  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(@User() user: UserEntity) {
    await this.authService.login(user);
  }
}
