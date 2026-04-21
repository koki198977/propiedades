import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { IAuthRepository } from '../domain/auth.repository.port';
import { User } from '../domain/user.entity';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return user ? this.mapToEntity(user) : null
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { fullName: 'asc' }
    })
    return users.map(u => this.mapToEntity(u))
  }

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: data.role,
      },
    });
    return this.mapToEntity(user);
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  private mapToEntity(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.fullName,
      prismaUser.role,
      prismaUser.createdAt,
    );
  }
}
