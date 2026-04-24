export class Tenant {
  constructor(
    public readonly id: string,
    public readonly userId: string, // Creator
    public readonly organizationId: string, // Owner Workspace
    public readonly name: string,
    public readonly email?: string | null,
    public readonly phone?: string | null,
    public readonly documentId?: string | null,
    public readonly isActive: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
