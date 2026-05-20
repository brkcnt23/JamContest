import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let mailService: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    passwordHash: 'hashed-password',
    displayName: 'Test User',
    globalRole: 'USER',
    emailVerified: false,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      emailVerification: {
        create: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    mailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a new user and send verification email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register('test@test.com', 'password123', 'testuser', 'Test User');

      expect(result.message).toBe('Kayıt başarılı! Email adresinizi doğrulayın.');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException when email exists', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.register('test@test.com', 'password123', 'testuser'),
      ).rejects.toThrow(ConflictException);
    });

    it('should still return success if mail fails', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mailService.sendVerificationEmail.mockRejectedValue(new Error('Mail failed'));

      const result = await service.register('test@test.com', 'password123', 'testuser');

      expect(result.message).toBe('Kayıt başarılı! Email adresinizi doğrulayın.');
    });
  });

  describe('login', () => {
    const mockRes = {
      cookie: jest.fn(),
    } as any;

    it('should return access token on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, emailVerified: true });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'password123', mockRes, '127.0.0.1', 'test-agent');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user).toBeDefined();
      expect(result.user.passwordHash).toBeUndefined();
      expect(mockRes.cookie).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, emailVerified: true });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@test.com', 'wrong', mockRes, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email not verified', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, emailVerified: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login('test@test.com', 'password123', mockRes, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      prisma.emailVerification.findUnique.mockResolvedValue({
        token: 'valid-token',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 3600000),
      });

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBe('Email doğrulandı!');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException on invalid token', async () => {
      prisma.emailVerification.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should return message even when user not found (security)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@test.com');

      expect(result.message).toBe('Mail gönderildi');
    });

    it('should send reset email when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.forgotPassword('test@test.com');

      expect(result.message).toBe('Şifre sıfırlama maili gönderildi');
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should update password on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.changePassword('user-1', 'old', 'newpass');

      expect(result.message).toBe('Şifre güncellendi');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
