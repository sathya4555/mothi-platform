import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Query('role') role?: string, @Query('search') search?: string) {
    return this.usersService.listUsers({ role: role as UserRole, search });
  }
}
