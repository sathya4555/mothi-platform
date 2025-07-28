import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PartiesService } from './parties.service';
import { CreatePartyDto, UpdatePartyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('parties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  create(@Body() createPartyDto: CreatePartyDto, @Request() req) {
    return this.partiesService.create(createPartyDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findAll(@Request() req, @Query('search') search?: string) {
    if (search) {
      return this.partiesService.searchParties(
        search,
        req.user.id,
        req.user.role,
      );
    }
    return this.partiesService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.partiesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartyDto: UpdatePartyDto,
    @Request() req,
  ) {
    return this.partiesService.update(
      id,
      updatePartyDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.partiesService.remove(id, req.user.id, req.user.role);
  }
}
