import { createHash, randomBytes, randomUUID } from 'crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenPairDto } from './dto/token-pair.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPairDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const user = await this.usersService.create(dto);
    return this.issueTokenPair(user);
  }

  async login(dto: LoginDto): Promise<TokenPairDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokenPair(user);
  }

  async refresh(rawToken: string): Promise<TokenPairDto> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokenModel.findOne({ tokenHash }).exec();

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.used) {
      await this.refreshTokenModel.deleteMany({ family: stored.family }).exec();
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (stored.expiresAt < new Date()) {
      await stored.deleteOne();
      throw new UnauthorizedException('Refresh token expired');
    }

    stored.used = true;
    await stored.save();

    const user = await this.usersService.findById(stored.userId.toString());
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokenPair(user, stored.family);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokenModel.deleteOne({ tokenHash }).exec();
  }

  private async issueTokenPair(user: UserDocument, family?: string): Promise<TokenPairDto> {
    const accessToken = this.jwtService.sign(
      { sub: user._id, email: user.email },
      { expiresIn: '15m' },
    );

    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenFamily = family ?? randomUUID();

    await this.refreshTokenModel.create({
      userId: user._id,
      tokenHash,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
