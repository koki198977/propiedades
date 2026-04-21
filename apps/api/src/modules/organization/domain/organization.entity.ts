import { OrganizationRole } from '@propiedades/types';

export class Organization {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly members: OrganizationMember[] = [],
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
    public readonly organization?: { id: string, name: string, slug: string, createdAt: Date },
    public readonly userEmail?: string,
    public readonly userFullName?: string,
  ) {}
}
