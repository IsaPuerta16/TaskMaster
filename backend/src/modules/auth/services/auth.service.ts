import {

  Injectable,

  UnauthorizedException,

  ConflictException,

  BadRequestException,

} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { randomBytes } from 'crypto';

import { User, UserRole } from '../../users/entities/user.entity';

import { UsersService } from '../../users/services/users.service';

import { SettingsService } from '../../settings/services/settings.service';

import { MailService } from '../../mail/services/mail.service';

import { RegisterDto } from '../dto/register.dto';

import { LoginDto } from '../dto/login.dto';

import { ForgotPasswordDto } from '../dto/forgot-password.dto';

import { ResetPasswordDto } from '../dto/reset-password.dto';

import { avatarUrlFromName } from '../../../common/utils/avatar-from-name.util';

import { normalizeEmail } from '../../../common/utils/normalize-email.util';



@Injectable()

export class AuthService {

  constructor(

    private usersService: UsersService,

    private settingsService: SettingsService,

    private jwtService: JwtService,

    private mailService: MailService,

  ) {}



  async checkEmailAvailable(email: string): Promise<{ available: boolean }> {

    const normalized = normalizeEmail(email);

    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {

      return { available: false };

    }

    const taken = await this.usersService.existsByEmail(normalized);

    return { available: !taken };

  }



  async register(dto: RegisterDto) {

    const email = normalizeEmail(dto.email);

    const existing = await this.usersService.findByEmail(email);

    if (existing) {

      throw new ConflictException(

        'Este correo ya está registrado. Inicia sesión si ya tienes cuenta.',

      );

    }



    const [firstName, ...rest] = dto.fullName.trim().split(/\s+/);

    const lastName = rest.join(' ').trim();

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const avatarUrl = avatarUrlFromName(

      dto.fullName,

      email,

      firstName || null,

    );

    const user = await this.usersService.create({

      email,

      password: hashedPassword,

      fullName: dto.fullName,

      firstName: firstName || null,

      lastName: lastName || null,

      role: UserRole.ESTUDIANTE,

      avatarUrl,

    });



    await this.settingsService.getForUser(user.id);



    return this.generateToken(user);

  }



  async login(dto: LoginDto) {

    const user = await this.usersService.findByEmail(normalizeEmail(dto.email));

    if (!user) {

      throw new UnauthorizedException('Credenciales inválidas');

    }



    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {

      throw new UnauthorizedException('Credenciales inválidas');

    }



    return this.generateToken(user);

  }



  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {

    const email = normalizeEmail(dto.email);

    const user = await this.usersService.findByEmail(email);

    if (!user) {

      return {

        message:

          'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.',

      };

    }



    const token = randomBytes(32).toString('hex');

    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.setPasswordResetToken(user.id, token, expires);



    await this.mailService.sendPasswordResetEmail({

      to: user.email,

      userName: user.fullName ?? user.firstName ?? 'usuario',

      token,

    });



    return {

      message:

        'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.',

    };

  }



  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {

    const user = await this.usersService.findByPasswordResetToken(dto.token);

    if (!user?.passwordResetExpires) {

      throw new BadRequestException('El enlace no es válido o ya expiró.');

    }

    if (user.passwordResetExpires.getTime() < Date.now()) {

      throw new BadRequestException('El enlace no es válido o ya expiró.');

    }



    const hashed = await bcrypt.hash(dto.password, 10);

    await this.usersService.updatePassword(user.id, hashed);



    return { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };

  }



  private generateToken(user: User) {

    const payload = { sub: user.id, email: user.email };

    return {

      access_token: this.jwtService.sign(payload),

      user: {

        id: user.id,

        email: user.email,

        fullName: user.fullName,

        firstName: user.firstName,

        lastName: user.lastName,

        role: user.role,

        avatarUrl: user.avatarUrl,

      },

    };

  }

}


