import { UserRole } from '@propiedades/types'

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    email: string
    passwordHash: string
    fullName: string
    role?: UserRole
  }): Omit<User, 'id' | 'createdAt'> {
    return {
      email: params.email.toLowerCase().trim(),
      passwordHash: params.passwordHash,
      fullName: params.fullName.trim(),
      role: params.role ?? UserRole.ADMIN,
    }
  }
}
