import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/user.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@CurrentUser() user: UserEntity, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.login(user.id, res);
    return { accessToken };
  }

  @Public()
  @Post('register')
  async register(@Body() dto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.register(dto, res);
    return { accessToken };
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@CurrentUser() user: UserEntity, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.login(user.id, res);
    return { accessToken };
  }
}
