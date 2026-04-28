import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateExpenseCategoryDto } from '@propiedades/types';
import { IExpenseCategoryRepository, EXPENSE_CATEGORY_REPOSITORY } from '../domain/expense-category.repository.port';

@Injectable()
export class UpdateExpenseCategoryUseCase {
  constructor(
    @Inject(EXPENSE_CATEGORY_REPOSITORY) private readonly repository: IExpenseCategoryRepository,
  ) {}

  async execute(id: string, organizationId: string, data: UpdateExpenseCategoryDto) {
    if (data.name) {
      const existing = await this.repository.findByName(organizationId, data.name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otra categoría con ese nombre');
      }
    }
    
    try {
      return await this.repository.update(id, organizationId, data);
    } catch (e) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }
}
