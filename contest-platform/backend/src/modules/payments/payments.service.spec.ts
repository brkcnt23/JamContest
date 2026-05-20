import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;

  const mockPlan = {
    id: 'plan-1',
    name: 'Creator',
    price: 79,
  };

  const mockTransaction = {
    id: 'tx-1',
    userId: 'user-1',
    amount: 79,
    currency: 'TRY',
    status: 'COMPLETED',
    method: 'MOCK',
  };

  const mockSubscription = {
    id: 'sub-1',
    userId: 'user-1',
    planId: 'plan-1',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    prisma = {
      subscriptionPlan: {
        findUnique: jest.fn(),
      },
      userSubscription: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('checkout', () => {
    it('should create subscription and transaction for new user', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.transaction.create.mockResolvedValue(mockTransaction);
      prisma.userSubscription.create.mockResolvedValue(mockSubscription);
      prisma.userSubscription.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockSubscription);

      const result = await service.checkout('user-1', 'plan-1');

      expect(result.success).toBe(true);
      expect(prisma.transaction.create).toHaveBeenCalled();
      expect(prisma.userSubscription.create).toHaveBeenCalled();
    });

    it('should update existing subscription', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      prisma.userSubscription.findUnique
        .mockResolvedValueOnce(mockSubscription)
        .mockResolvedValueOnce(mockSubscription);
      prisma.transaction.create.mockResolvedValue(mockTransaction);
      prisma.userSubscription.update.mockResolvedValue(mockSubscription);

      const result = await service.checkout('user-1', 'plan-1');

      expect(result.success).toBe(true);
      expect(prisma.userSubscription.update).toHaveBeenCalled();
    });

    it('should throw error when plan not found', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(service.checkout('user-1', 'invalid-plan')).rejects.toThrow('Plan bulunamadı');
    });

    it('should set expiresAt to null for free plans', async () => {
      const freePlan = { ...mockPlan, price: 0 };
      prisma.subscriptionPlan.findUnique.mockResolvedValue(freePlan);
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.transaction.create.mockResolvedValue({ ...mockTransaction, amount: 0 });
      prisma.userSubscription.create.mockResolvedValue({ ...mockSubscription, expiresAt: null });
      prisma.userSubscription.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockSubscription, expiresAt: null });

      const result = await service.checkout('user-1', 'plan-1');

      expect(result.success).toBe(true);
      expect(result.subscription!.expiresAt).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('should return transaction history', async () => {
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      const result = await service.getHistory('user-1');

      expect(result).toHaveLength(1);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });

    it('should respect pagination params', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);

      await service.getHistory('user-1', 5, 10);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5, skip: 10 }),
      );
    });
  });
});
