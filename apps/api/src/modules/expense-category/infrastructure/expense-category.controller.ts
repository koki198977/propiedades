import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../../shared/infrastructure/guards/organization.guard';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '@propiedades/types';
import { CreateExpenseCategoryUseCase } from '../application/create-expense-category.use-case';
import { GetExpenseCategoriesUseCase } from '../application/get-expense-categories.use-case';
import { UpdateExpenseCategoryUseCase } from '../application/update-expense-category.use-case';

@Controller('expense-categories')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class ExpenseCategoryController {
  constructor(
    private readonly createUseCase: CreateExpenseCategoryUseCase,
    private readonly getUseCase: GetExpenseCategoriesUseCase,
    private readonly updateUseCase: UpdateExpenseCategoryUseCase,
  ) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.createUseCase.execute(req.organizationId, dto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.getUseCase.execute(req.organizationId, includeInactive === 'true');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    return this.updateUseCase.execute(id, req.organizationId, dto);
  }
}
