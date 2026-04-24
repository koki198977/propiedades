import { Property } from './property.entity';

export interface IPropertyRepository {
  findAllByOrganizationId(organizationId: string): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  findActiveTenancyByPropertyId(propertyId: string): Promise<any | null>;
  create(data: any): Promise<Property>;
  update(id: string, data: any): Promise<Property>;
  delete(id: string): Promise<void>;
  assignTenant(propertyId: string, data: any): Promise<any>;
  returnSecurityDeposit(tenancyId: string): Promise<void>;
}

export const PROPERTY_REPOSITORY = Symbol('IPropertyRepository');
