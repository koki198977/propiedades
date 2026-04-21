import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { CreatePropertyUseCase } from '../application/create-property.use-case';
import { GetPropertiesUseCase } from '../application/get-properties.use-case';
import { UpdatePropertyUseCase } from '../application/update-property.use-case';
import { AssignTenantUseCase } from '../application/assign-tenant.use-case';
import { DeletePropertyUseCase } from '../application/delete-property.use-case';
import { PropertyMeterService } from './property-meter.service';
import { PROPERTY_REPOSITORY } from '../domain/property.repository.port';
import { PrismaPropertyRepository } from './prisma-property.repository';
import { CloudinaryModule } from '../../../shared/infrastructure/cloudinary/cloudinary.module';
import { ShowcaseController } from './showcase.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [PropertyController, ShowcaseController],
  providers: [
    CreatePropertyUseCase,
    GetPropertiesUseCase,
    UpdatePropertyUseCase,
    AssignTenantUseCase,
    PropertyMeterService,
    DeletePropertyUseCase,
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PrismaPropertyRepository,
    },
  ],
  exports: [PROPERTY_REPOSITORY, GetPropertiesUseCase],
})
export class PropertyModule {}

