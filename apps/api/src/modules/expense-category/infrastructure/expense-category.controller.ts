import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard';
import { CurrentUser } from '../../auth/infrastructure/current-user.decorator';
import { UserProfileDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '@propiedades/types';
import { CreateExpenseCategoryUseCase } from '../application/create-expense-category.use-case';
import { GetExpenseCategoriesUseCase } from '../application/get-expense-categories.use-case';
import { UpdateExpenseCategoryUseCase } from '../application/update-expense-category.use-case';

@Controller('expense-categories')
@UseGuards(JwtAuthGuard)
export class ExpenseCategoryController {
  constructor(
    private readonly createUseCase: CreateExpenseCategoryUseCase,
    private readonly getUseCase: GetExpenseCategoriesUseCase,
    private readonly updateUseCase: UpdateExpenseCategoryUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: UserProfileDto,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    const orgId = user.organizations[0].organizationId; // Usando la org activa por defecto
    return this.createUseCase.execute(orgId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: UserProfileDto,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const orgId = user.organizations[0].organizationId;
    return this.getUseCase.execute(orgId, includeInactive === 'true');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserProfileDto,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    const orgId = user.organizations[0].organizationId;
    return this.updateUseCase.execute(id, orgId, dto);
  }
}
