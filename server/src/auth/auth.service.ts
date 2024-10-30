import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const existingUser = await this.userService.findByEmail(email);

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPassMatch = await bcrypt.compare(password, existingUser.password);

    if (isPassMatch) {
      return existingUser;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: User) {
    const jti = uuidv4();
    return await this.tokenService.generateTokens(user, jti);
  }

  async logout(jti: string) {
    if (!jti) throw new UnauthorizedException('Token is missing');
    const { userId } = await this.tokenService.revokeRefreshToken(jti);
    return { userId };
  }

  async refreshTokens(user: User, oldJti: string) {
    const jti = uuidv4();
    await this.tokenService.revokeRefreshToken(oldJti);
    return await this.tokenService.generateTokens(user, jti);
  }
}
