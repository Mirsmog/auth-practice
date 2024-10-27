import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { TokensService } from 'src/tokens/tokens.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokensService,
  ) {}

  async login(user: UserEntity) {
    const { accessToken, refreshToken } = this.tokenService.generatePairTokens(
      user.id,
    );
    await this.tokenService.addTokenToWhiteList(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOne(createUserDto.email);

    if (existingUser) throw new BadRequestException('the email already in use');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.login(newUser);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOne(email);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async validateUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findOne(userId);
      const userRefreshToken =
        await this.tokenService.findRefreshTokenByUserId(userId);
      const isMatch = await bcrypt.compare(
        refreshToken,
        userRefreshToken.token,
      );
      if (!isMatch) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
