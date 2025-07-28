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
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateSubcategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { SubcategoryCategory } from '../entities/subcategory.entity';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Product endpoints
  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findAllProducts() {
    return this.productsService.findAllProducts();
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findActiveProducts() {
    return this.productsService.findActiveProducts();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneProduct(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  removeProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeProduct(id);
  }

  // Subcategory endpoints
  @Post('subcategories')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  createSubcategory(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.productsService.createSubcategory(createSubcategoryDto);
  }

  @Get('subcategories/all')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findAllSubcategories() {
    return this.productsService.findAllSubcategories();
  }

  @Get('subcategories/active')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findActiveSubcategories() {
    return this.productsService.findActiveSubcategories();
  }

  @Get('subcategories/category/:category')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findSubcategoriesByCategory(
    @Param('category') category: SubcategoryCategory,
  ) {
    return this.productsService.findSubcategoriesByCategory(category);
  }

  @Get('subcategories/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  findOneSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneSubcategory(id);
  }

  @Patch('subcategories/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  updateSubcategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubcategoryDto: Partial<CreateSubcategoryDto>,
  ) {
    return this.productsService.updateSubcategory(id, updateSubcategoryDto);
  }

  @Delete('subcategories/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  removeSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeSubcategory(id);
  }

  // Categories endpoint
  @Get('categories/list')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.AGENT)
  getCategories() {
    return this.productsService.getCategories();
  }
}
