import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
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
}
