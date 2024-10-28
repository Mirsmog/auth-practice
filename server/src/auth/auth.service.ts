import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { TokensService } from 'src/tokens/tokens.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(userId: string, res: Response) {
    const jti = uuidv4();

    const { accessToken, refreshToken } = await this.tokensService.generateTokens(userId, jti);

    await this.tokensService.saveRefreshToken(userId, refreshToken, jti);

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

    return { accessToken, refreshToken };
  }

  async register(createUserDto: CreateUserDto, res: Response) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);

    if (existingUser) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.login(user.id, res);
  }

  async refreshTokens(token: string, res: Response) {
    const payload = await this.tokensService.validateRefreshToken(token);
    await this.tokensService.revokeRefreshToken(payload.jti);
    return this.login(payload.userId, res);
  }
}
