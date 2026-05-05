import { User } from './user.entity'

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  findAll(): Promise<User[]>
  create(data: Omit<User, 'id' | 'createdAt'>): Promise<User>
  update(userId: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash'>> & { passwordHash?: string }): Promise<User>
  updatePassword(userId: string, newPasswordHash: string): Promise<void>
}

export const AUTH_REPOSITORY = Symbol('IAuthRepository')
