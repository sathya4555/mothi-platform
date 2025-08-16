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
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { PurchaseStatus } from '../entities/purchase.entity';

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  create(@Body() createPurchaseDto: CreatePurchaseDto, @Request() req) {
    return this.purchasesService.create(createPurchaseDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findAll(@Request() req, @Query() filters: any) {
    return this.purchasesService.findAll(req.user.id, req.user.role, filters);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  getDashboardStats(@Request() req) {
    return this.purchasesService.getDashboardStats(req.user.id, req.user.role);
  }

  @Get('executive-analytics')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  getExecutiveAnalytics() {
    return this.purchasesService.getExecutiveAnalytics();
  }

  @Get('agent-leaderboards')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  getAgentLeaderboards() {
    return this.purchasesService.getAgentLeaderboards();
  }

  @Get('predictive-analytics')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  getPredictiveAnalytics() {
    return this.purchasesService.getPredictiveAnalytics();
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  getOverduePurchases(@Request() req) {
    return this.purchasesService.getOverduePurchases(
      req.user.id,
      req.user.role,
    );
  }

  @Get('status/:status')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findByStatus(
    @Param('status') status: PurchaseStatus,
    @Request() req,
    @Query() filters: any,
  ) {
    return this.purchasesService.findAll(req.user.id, req.user.role, {
      ...filters,
      status,
    });
  }

  @Get('sales-type/:salesType')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findBySalesType(
    @Param('salesType') salesType: string,
    @Request() req,
    @Query() filters: any,
  ) {
    return this.purchasesService.findAll(req.user.id, req.user.role, {
      ...filters,
      salesType,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.purchasesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
    @Request() req,
  ) {
    return this.purchasesService.update(
      id,
      updatePurchaseDto,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: PurchaseStatus,
    @Request() req,
  ) {
    return this.purchasesService.updateStatus(
      id,
      status,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/invoice-number')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  generateInvoiceNumber(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.purchasesService.generateInvoiceNumber(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.purchasesService.remove(id, req.user.id, req.user.role);
  }
}
