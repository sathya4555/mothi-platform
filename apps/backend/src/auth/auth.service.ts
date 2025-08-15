import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
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
  }): Promise<any> {
    // Check if user already exists (case-insensitive)
    const existingUser = await this.usersService.findByEmailInsensitive(
      userData.email,
    );
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user without password; it will be set during onboarding
    const user = await this.usersService.createUser({
      ...userData,
      password: null as any,
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
        expiresIn: '12h', // 12 hours
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '20d', // 20 days
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

  async getSetupInfo(token: string) {
    try {
      const decoded: any = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SETUP_SECRET || process.env.JWT_ACCESS_SECRET,
      });
      if (decoded?.type !== 'setup') throw new Error('Invalid token');
      const user = await this.usersService.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('Invalid setup token');
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid setup token');
    }
  }

  async setupPassword(payload: {
    token: string;
    name: string;
    phone: string;
    password: string;
  }) {
    const info = await this.getSetupInfo(payload.token);
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    await this.usersService.updateUser(info.id, {
      name: payload.name?.trim() || info.name,
      phone: payload.phone?.trim() || info.phone,
      isActive: true,
    });
    await this.usersService.setPassword(info.id, hashedPassword);
    return { message: 'Password setup successful' };
  }

  async generateResetLink(userId: number): Promise<{ setupToken: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    // Optionally, we could invalidate previous setup tokens by rotating a server-side secret
    const setupToken = await this.generateSetupToken(user.id);
    return { setupToken };
  }
}
