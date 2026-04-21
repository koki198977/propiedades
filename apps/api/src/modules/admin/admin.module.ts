import { Module } from '@nestjs/common';
import { AdminController } from './infrastructure/admin.controller';
import { 
  ListAllOrganizationsUseCase, 
  ListAllUsersUseCase, 
  AdminCreateOrganizationUseCase, 
  AssignUserToOrganizationUseCase 
} from './application/admin.use-cases';

import { AuthModule } from '../auth/infrastructure/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    ListAllOrganizationsUseCase,
    ListAllUsersUseCase,
    AdminCreateOrganizationUseCase,
    AssignUserToOrganizationUseCase,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
