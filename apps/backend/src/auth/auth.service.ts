import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      (await this.usersService.validatePassword(password, user.password))
    ) {
      const { password, refreshToken, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string): Promise<Tokens> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);

    // Save refresh token to database
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<Tokens> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const tokens = await this.generateTokens(user);

      // Update refresh token in database
      await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
  }

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password?: string;
  }): Promise<any> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Generate a temporary password if not provided
    const tempPassword = userData.password || this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user with hashed password
    const user = await this.usersService.createUser({
      ...userData,
      password: hashedPassword,
    });

    // Generate one-time setup token
    const setupToken = await this.generateSetupToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tempPassword,
      setupToken,
    };
  }

  private async generateTokens(user: any): Promise<Tokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m', // 15 minutes
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d', // 7 days
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateSetupToken(userId: number): Promise<string> {
    const payload = {
      sub: userId,
      type: 'setup',
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SETUP_SECRET || process.env.JWT_ACCESS_SECRET,
      expiresIn: '24h', // 24 hours
    });
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
