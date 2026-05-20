import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: any;
  let mailService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
  };

  const mockJuryApp = {
    id: 'app-1',
    userId: 'user-1',
    motivation: 'I want to be a jury',
    status: 'PENDING',
  };

  const mockOrganizerApp = {
    id: 'app-2',
    userId: 'user-1',
    motivation: 'I want to organize',
    status: 'PENDING',
  };

  beforeEach(async () => {
    prisma = {
      juryApplication: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      organizerApplication: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    mailService = {
      sendJuryApplicationConfirmation: jest.fn().mockResolvedValue(undefined),
      sendOrganizerApplicationConfirmation: jest.fn().mockResolvedValue(undefined),
      sendJuryApprovalEmail: jest.fn().mockResolvedValue(undefined),
      sendJuryRejectionEmail: jest.fn().mockResolvedValue(undefined),
      sendOrganizerApprovalEmail: jest.fn().mockResolvedValue(undefined),
      sendOrganizerRejectionEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  describe('applyForJury', () => {
    it('should create a new jury application', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue(null);
      prisma.juryApplication.create.mockResolvedValue(mockJuryApp);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.applyForJury('user-1', { motivation: 'I want to be a jury' });

      expect(result.success).toBe(true);
      expect(prisma.juryApplication.create).toHaveBeenCalled();
      expect(mailService.sendJuryApplicationConfirmation).toHaveBeenCalled();
    });

    it('should update existing pending application', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue(mockJuryApp);
      prisma.juryApplication.update.mockResolvedValue({ ...mockJuryApp, motivation: 'Updated' });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.applyForJury('user-1', { motivation: 'Updated' });

      expect(result.success).toBe(true);
      expect(prisma.juryApplication.update).toHaveBeenCalled();
    });
  });

  describe('applyForOrganizer', () => {
    it('should create a new organizer application', async () => {
      prisma.organizerApplication.findUnique.mockResolvedValue(null);
      prisma.organizerApplication.create.mockResolvedValue(mockOrganizerApp);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.applyForOrganizer('user-1', { motivation: 'I want to organize' });

      expect(result.success).toBe(true);
      expect(mailService.sendOrganizerApplicationConfirmation).toHaveBeenCalled();
    });
  });

  describe('getApplicationStatus', () => {
    it('should return both application statuses', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue({ status: 'PENDING', reason: null });
      prisma.organizerApplication.findUnique.mockResolvedValue({ status: 'APPROVED', reason: null });

      const result = await service.getApplicationStatus('user-1');

      expect(result.jury.status).toBe('PENDING');
      expect(result.organizer.status).toBe('APPROVED');
    });

    it('should return null for missing applications', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue(null);
      prisma.organizerApplication.findUnique.mockResolvedValue(null);

      const result = await service.getApplicationStatus('user-1');

      expect(result.jury).toBeNull();
      expect(result.organizer).toBeNull();
    });
  });

  describe('reviewJuryApplication', () => {
    it('should approve application and update user role', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue({
        ...mockJuryApp,
        user: mockUser,
      });
      prisma.juryApplication.update.mockResolvedValue({ ...mockJuryApp, status: 'APPROVED' });

      const result = await service.reviewJuryApplication(
        'app-1',
        { approved: true },
        'admin-1',
      );

      expect(result.status).toBe('APPROVED');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { globalRole: { set: 'JURY' } } }),
      );
      expect(mailService.sendJuryApprovalEmail).toHaveBeenCalled();
    });

    it('should reject application and send rejection email', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue({
        ...mockJuryApp,
        user: mockUser,
      });
      prisma.juryApplication.update.mockResolvedValue({
        ...mockJuryApp,
        status: 'REJECTED',
        reason: 'Not enough experience',
      });

      const result = await service.reviewJuryApplication(
        'app-1',
        { approved: false, reason: 'Not enough experience' },
        'admin-1',
      );

      expect(result.status).toBe('REJECTED');
      expect(mailService.sendJuryRejectionEmail).toHaveBeenCalled();
    });

    it('should throw when application not found', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue(null);

      await expect(
        service.reviewJuryApplication('invalid', { approved: true }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when already reviewed', async () => {
      prisma.juryApplication.findUnique.mockResolvedValue({
        ...mockJuryApp,
        status: 'APPROVED',
        user: mockUser,
      });

      await expect(
        service.reviewJuryApplication('app-1', { approved: true }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
