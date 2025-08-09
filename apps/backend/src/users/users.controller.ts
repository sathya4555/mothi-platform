import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async list(@Query('role') role?: string, @Query('search') search?: string) {
    return this.usersService.listUsers({ role: role as UserRole, search });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role?: UserRole; isActive?: boolean },
  ) {
    // simple update using repository
    const user = await this.usersService.findById(id);
    if (!user) return { message: 'Not found' };
    if (typeof body.isActive === 'boolean') user.isActive = body.isActive;
    if (body.role) user.role = body.role;
    const saved = await (this as any).usersService['usersRepository'].save(
      user,
    );
    return {
      message: 'Updated',
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        role: saved.role,
        isActive: saved.isActive,
      },
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    if (!user) return { message: 'Not found' };
    await (this as any).usersService['usersRepository'].remove(user);
    return { message: 'Deleted' };
  }
}
