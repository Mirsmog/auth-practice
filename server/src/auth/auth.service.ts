import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { RefreshTokenPayload } from 'src/token/entities/refresh-token.entity';

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
    return await this.tokenService.generateTokens(user, uuidv4());
  }

  async logout(token: string) {
    const payload = await this.tokenService.validateRefreshToken(token);
    this.tokenService.revokeRefreshToken(payload.jti);
  }

  async refreshTokens({ sub, jti }: RefreshTokenPayload) {
    const user = await this.userService.findById(sub);

    if (user) {
      await this.tokenService.revokeRefreshToken(jti);
      return await this.tokenService.generateTokens(user, uuidv4());
    }

    throw new NotFoundException('User not found');
  }
}
