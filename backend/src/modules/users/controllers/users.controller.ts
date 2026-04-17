import {
  Body,
  ConflictException,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { User, UserRole } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { UpdateMeDto } from '../dto/update-me.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return this.toUserResponse(user);
  }

  @Get()
  async listUsers() {
    const users = await this.usersService.findAll();
    return users.map((u: User) => this.toUserResponse(u));
  }

  @Patch('me')
  async updateMe(@GetUser() user: User, @Body() dto: UpdateMeDto) {
    const nextEmail = dto.email ?? user.email;
    if (nextEmail !== user.email) {
      const existing = await this.usersService.findByEmail(nextEmail);
      if (existing && existing.id !== user.id) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    const firstName = (dto.firstName ?? user.firstName ?? '').trim();
    const lastName = (dto.lastName ?? user.lastName ?? '').trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || user.fullName;
    const updated = await this.usersService.updateProfile(user.id, {
      email: nextEmail,
      fullName,
      firstName: firstName || null,
      lastName: lastName || null,
      role: dto.role ?? user.role ?? UserRole.ESTUDIANTE,
    });

    return this.toUserResponse(updated!);
  }

  private toUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
