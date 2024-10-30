import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { TokenModule } from 'src/token/token.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { CookieService } from './cookie.service';

@Module({
  controllers: [AuthController],
  imports: [UserModule, TokenModule, PassportModule, JwtModule],
  providers: [AuthService, JwtStrategy, LocalStrategy, JwtRefreshStrategy, CookieService],
})
export class AuthModule {}
