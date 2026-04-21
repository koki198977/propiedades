import { Organization, OrganizationMember } from './organization.entity';
import { OrganizationRole } from '@propiedades/types';

export const ORGANIZATION_REPOSITORY = 'ORGANIZATION_REPOSITORY';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  findAllByUserId(userId: string): Promise<OrganizationMember[]>;
  create(data: { name: string, slug: string, creatorId?: string }): Promise<Organization>;
  update(id: string, data: Partial<Organization>): Promise<Organization>;
  
  // Member management
  addMember(organizationId: string, userId: string, role: OrganizationRole): Promise<OrganizationMember>;
  removeMember(organizationId: string, userId: string): Promise<void>;
  updateMemberRole(organizationId: string, userId: string, role: OrganizationRole): Promise<void>;
  findMember(organizationId: string, userId: string): Promise<OrganizationMember | null>;
  listMembers(organizationId: string): Promise<OrganizationMember[]>;
  
  // User lookup helper without coupling Auth
  findUserByEmail(email: string): Promise<{id: string, fullName: string} | null>;
}
