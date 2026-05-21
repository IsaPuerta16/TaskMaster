import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { SettingsService } from '../../settings/services/settings.service';
import { MailService } from '../../mail/services/mail.service';
import { User, UserRole } from '../../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'findByEmail' | 'existsByEmail' | 'create'>
  >;

  const mockUser: User = {
    id: 'u1',
    email: 'a@b.com',
    password: 'hashed',
    fullName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.ESTUDIANTE,
    avatarUrl: 'assets/avatars/male-1.png',
    createdAt: new Date(),
    tasks: [],
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: SettingsService,
          useValue: { getForUser: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt-token') },
        },
        {
          provide: MailService,
          useValue: { sendPasswordResetEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('register: lanza Conflict si el correo existe', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser);
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'x',
        fullName: 'Test User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('register: rechaza correo duplicado', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser);
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'secret12',
        fullName: 'Otro Usuario',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('register: crea usuario y devuelve token', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({ ...mockUser, email: 'new@b.com' });
    const res = await service.register({
      email: 'new@b.com',
      password: 'secret12',
      fullName: 'Nuevo Usuario',
    });
    expect(res.access_token).toBe('jwt-token');
    expect(res.user.email).toBe('new@b.com');
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarUrl: expect.stringMatching(/^assets\/avatars\//),
      }),
    );
  });

  it('login: Unauthorized si no existe usuario', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(
      service.login({ email: 'x@y.com', password: 'p' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
