import { OrganizationRole } from '@propiedades/types';

export class Organization {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly members: OrganizationMember[] = [],
    public readonly bankName?: string,
    public readonly bankAccountType?: string,
    public readonly bankAccountNumber?: string,
    public readonly bankAccountRut?: string,
    public readonly bankAccountEmail?: string,
  ) {}
}

export class OrganizationMember {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly role: OrganizationRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly organization?: { 
      id: string, 
      name: string, 
      slug: string, 
      bankName?: string,
      bankAccountType?: string,
      bankAccountNumber?: string,
      bankAccountRut?: string,
      bankAccountEmail?: string,
      createdAt: Date 
    },
    public readonly userEmail?: string,
    public readonly userFullName?: string,
  ) {}
}
