import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { IOrganizationRepository } from '../domain/organization.repository.port';
import { Organization, OrganizationMember } from '../domain/organization.entity';
import { OrganizationRole } from '@propiedades/types';

@Injectable()
export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Organization | null> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
    if (!org) return null;
    return this.mapToEntity(org);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (!org) return null;
    return this.mapToEntity(org);
  }

  async findAll(): Promise<Organization[]> {
    const orgs = await this.prisma.organization.findMany({
      orderBy: { name: 'asc' },
    });
    return orgs.map(org => this.mapToEntity(org));
  }

  async findAllByUserId(userId: string): Promise<OrganizationMember[]> {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    });
    return memberships.map(m => this.mapMemberToEntity(m));
  }

  async create(data: { name: string, slug: string, creatorId?: string }): Promise<Organization> {
    const org = await this.prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
        },
      });

      if (data.creatorId) {
        await tx.organizationMember.create({
          data: {
            organizationId: newOrg.id,
            userId: data.creatorId,
            role: OrganizationRole.ADMIN,
          },
        });
      }

      return await tx.organization.findUnique({
        where: { id: newOrg.id },
        include: { members: { include: { user: true } } },
      });
    });

    return this.mapToEntity(org!);
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        bankName: data.bankName,
        bankAccountType: data.bankAccountType,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountRut: data.bankAccountRut,
        bankAccountEmail: data.bankAccountEmail,
      },
    });
    return this.mapToEntity(updated);
  }

  async addMember(organizationId: string, userId: string, role: OrganizationRole): Promise<OrganizationMember> {
    const member = await this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
      },
      include: { user: true },
    });
    return this.mapMemberToEntity(member);
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    await this.prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async updateMemberRole(organizationId: string, userId: string, role: OrganizationRole): Promise<void> {
    await this.prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role: role as any }, // Prisma enum vs Types enum
    });
  }

  async findMember(organizationId: string, userId: string): Promise<OrganizationMember | null> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: { user: true },
    });
    if (!member) return null;
    return this.mapMemberToEntity(member);
  }

  async listMembers(organizationId: string): Promise<OrganizationMember[]> {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true },
    });
    return members.map(m => this.mapMemberToEntity(m));
  }

  async findUserByEmail(email: string): Promise<{ id: string; fullName: string; } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true },
    });
    return user;
  }

  private mapToEntity(org: any): Organization {
    return new Organization(
      org.id,
      org.name,
      org.slug,
      org.createdAt,
      org.updatedAt,
      org.members ? org.members.map((m: any) => this.mapMemberToEntity(m)) : [],
      org.bankName,
      org.bankAccountType,
      org.bankAccountNumber,
      org.bankAccountRut,
      org.bankAccountEmail,
    );
  }

  private mapMemberToEntity(m: any): OrganizationMember {
    return new OrganizationMember(
      m.id,
      m.organizationId,
      m.userId,
      m.role as OrganizationRole,
      m.createdAt,
      m.updatedAt,
      m.organization ? {
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        bankName: m.organization.bankName,
        bankAccountType: m.organization.bankAccountType,
        bankAccountNumber: m.organization.bankAccountNumber,
        bankAccountRut: m.organization.bankAccountRut,
        bankAccountEmail: m.organization.bankAccountEmail,
        createdAt: m.organization.createdAt,
      } : undefined,
      m.user?.email,
      m.user?.fullName,
    );
  }
}
