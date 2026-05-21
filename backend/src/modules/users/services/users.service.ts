import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { normalizeEmail } from '../../../common/utils/normalize-email.util';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: UserRole;
    avatarUrl?: string | null;
  }) {
    const user = this.userRepo.create({
      ...data,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      role: data.role ?? UserRole.ESTUDIANTE,
    });
    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email: normalizeEmail(email) } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const normalized = normalizeEmail(email);
    const count = await this.userRepo.count({ where: { email: normalized } });
    return count > 0;
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async findAll() {
    return this.userRepo.find({
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(
    id: string,
    data: {
      email: string;
      fullName: string;
      firstName: string | null;
      lastName: string | null;
      role: UserRole;
    },
  ) {
    await this.userRepo.update({ id }, data);
    return this.findById(id);
  }

  async setPasswordResetToken(id: string, token: string, expires: Date) {
    await this.userRepo.update(
      { id },
      { passwordResetToken: token, passwordResetExpires: expires },
    );
  }

  async findByPasswordResetToken(token: string) {
    return this.userRepo.findOne({ where: { passwordResetToken: token } });
  }

  async updatePassword(id: string, hashedPassword: string) {
    await this.userRepo.update(
      { id },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    );
    return this.findById(id);
  }
}
