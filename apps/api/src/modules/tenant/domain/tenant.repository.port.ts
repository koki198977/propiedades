import { Tenant } from './tenant.entity';
import { PaginationQuery, PaginatedResponse } from '@propiedades/types';

export interface ITenantRepository {
  findAllByOrganizationId(organizationId: string, query?: PaginationQuery): Promise<PaginatedResponse<Tenant>>;
  findById(id: string): Promise<Tenant | null>;
  findByDocumentIdAndOrg(documentId: string, organizationId: string): Promise<Tenant | null>;
  findByEmailAndOrg(email: string, organizationId: string): Promise<Tenant | null>;
  create(data: any): Promise<Tenant>;
  update(id: string, data: any): Promise<Tenant>;
  delete(id: string): Promise<void>;
}

export const TENANT_REPOSITORY = Symbol('ITenantRepository');
