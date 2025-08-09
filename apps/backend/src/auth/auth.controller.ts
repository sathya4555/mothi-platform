import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;
}

export class SetupPasswordDto {
  token: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return {
      message: 'Login successful',
      ...tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return {
      message: 'Token refreshed successfully',
      ...tokens,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.sub);
    return {
      message: 'Logout successful',
    };
  }

  @Post('create-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.createUser(createUserDto);
    return {
      message: 'User created successfully',
      user: result.user,
      setupToken: result.setupToken,
    };
  }

  @Post('setup-password')
  @HttpCode(HttpStatus.OK)
  async setupPassword(@Body() setupPasswordDto: SetupPasswordDto) {
    // This endpoint would handle the one-time password setup
    return this.authService.setupPassword({
      token: setupPasswordDto.token,
      name: (setupPasswordDto as any).name,
      phone: (setupPasswordDto as any).phone,
      password: setupPasswordDto.password,
    });
  }

  @Post('setup-info')
  @HttpCode(HttpStatus.OK)
  async setupInfo(@Body() body: { token: string }) {
    return this.authService.getSetupInfo(body.token);
  }
}
