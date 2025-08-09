import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailInsensitive(email: string): Promise<User | undefined> {
    const e = (email || '').trim().toLowerCase();
    return this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: e })
      .getOne();
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string | null;
    role: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      name: userData.name,
      email: (userData.email || '').trim().toLowerCase(),
      phone: userData.phone,
      password: userData.password,
      role: userData.role as UserRole,
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  async updateUser(
    id: number,
    updates: Partial<Pick<User, 'role' | 'isActive' | 'name' | 'phone'>>,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    return this.usersRepository.save(user);
  }

  async removeUser(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;
    await this.usersRepository.remove(user);
  }

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }

  async removeRefreshToken(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async listUsers(params: { role?: UserRole; search?: string }) {
    const where: any = {};
    if (params.role) {
      where.role = params.role;
    }
    if (params.search) {
      where.name = ILike(`%${params.search}%`);
    }
    const users = await this.usersRepository.find({
      where,
      select: ['id', 'name', 'email', 'role', 'isActive'],
      order: { name: 'ASC' },
      take: 100,
    });
    return users;
  }
}
