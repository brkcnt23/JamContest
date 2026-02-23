import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContestsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // YARIŞMA CRUD
  // ==========================================

  async create(data: any, userId: string) {
    const slug = this.generateSlug(data.title);

    const contest = await this.prisma.contest.create({
      data: {
        title: data.title,
        description: data.description,
        slug,
        coverImage: data.coverImage,
        category: data.category || 'contest',
        applicationStart: data.applicationStart ? new Date(data.applicationStart) : null,
        applicationEnd: data.applicationEnd ? new Date(data.applicationEnd) : null,
        topicRevealAt: data.topicRevealAt ? new Date(data.topicRevealAt) : null,
        submissionStart: data.submissionStart ? new Date(data.submissionStart) : null,
        submissionEnd: data.submissionEnd ? new Date(data.submissionEnd) : null,
        judgingStart: data.judgingStart ? new Date(data.judgingStart) : null,
        judgingEnd: data.judgingEnd ? new Date(data.judgingEnd) : null,
        topic: data.topic,
        rules: data.rules,
        prizes: data.prizes,
        maxParticipants: data.maxParticipants,
        approvalMode: data.approvalMode || 'MANUAL',
        allowedFormats: data.allowedFormats || [],
        status: 'PENDING_APPROVAL',
        createdById: userId,
      },
    });

    // Oluşturan kişiyi otomatik ORGANIZER yap
    await this.prisma.contestMember.create({
      data: {
        userId,
        contestId: contest.id,
        role: 'ORGANIZER',
        assignedBy: userId,
      },
    });

    return contest;
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.contest.findMany({
      where,
      include: {
        createdBy: { select: { id: true, username: true, displayName: true, avatar: true } },
        members: {
          select: {
            role: true,
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
        _count: { select: { applications: true, submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { id: true, username: true, displayName: true, avatar: true } },
        members: {
          select: {
            role: true,
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
        _count: { select: { applications: true, submissions: true } },
      },
    });

    if (!contest) throw new NotFoundException('Contest not found');
    return contest;
  }

  async findById(id: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true, displayName: true, avatar: true } },
        members: {
          select: {
            role: true,
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
        _count: { select: { applications: true, submissions: true } },
      },
    });
    if (!contest) throw new NotFoundException('Contest not found');
    return contest;
  }

  async update(id: string, data: any, userId: string) {
    await this.assertOrganizerOrAdmin(id, userId);

    return this.prisma.contest.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        category: data.category,
        applicationStart: data.applicationStart ? new Date(data.applicationStart) : undefined,
        applicationEnd: data.applicationEnd ? new Date(data.applicationEnd) : undefined,
        topicRevealAt: data.topicRevealAt ? new Date(data.topicRevealAt) : undefined,
        submissionStart: data.submissionStart ? new Date(data.submissionStart) : undefined,
        submissionEnd: data.submissionEnd ? new Date(data.submissionEnd) : undefined,
        judgingStart: data.judgingStart ? new Date(data.judgingStart) : undefined,
        judgingEnd: data.judgingEnd ? new Date(data.judgingEnd) : undefined,
        topic: data.topic,
        rules: data.rules,
        prizes: data.prizes,
        maxParticipants: data.maxParticipants,
        approvalMode: data.approvalMode,
        allowedFormats: data.allowedFormats,
      },
    });
  }

  // ==========================================
  // ADMIN ONAY SÜRECİ
  // ==========================================

  async getPendingContests() {
    return this.prisma.contest.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        createdBy: { select: { id: true, username: true, displayName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveContest(contestId: string, reviewerId: string, note?: string) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundException('Contest not found');
    if (contest.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Contest is not pending approval');
    }

    await this.prisma.contestApproval.create({
      data: { contestId, reviewerId, decision: 'APPROVED', note },
    });

    return this.prisma.contest.update({
      where: { id: contestId },
      data: { status: 'APPROVED' },
    });
  }

  async rejectContest(contestId: string, reviewerId: string, note: string) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundException('Contest not found');

    await this.prisma.contestApproval.create({
      data: { contestId, reviewerId, decision: 'REJECTED', note },
    });

    return this.prisma.contest.update({
      where: { id: contestId },
      data: { status: 'REJECTED', adminApprovalNote: note },
    });
  }

  async updateStatus(contestId: string, status: string, userId: string) {
    await this.assertOrganizerOrAdmin(contestId, userId);
    return this.prisma.contest.update({
      where: { id: contestId },
      data: { status: status as any },
    });
  }

  // ==========================================
  // ÜYE YÖNETİMİ (Organizatör, Jüri atama)
  // ==========================================

  async addMember(contestId: string, targetUserId: string, role: string, assignedBy: string) {
    await this.assertOrganizerOrAdmin(contestId, assignedBy);

    // Aynı rolde zaten var mı kontrol
    const existing = await this.prisma.contestMember.findUnique({
      where: { userId_contestId_role: { userId: targetUserId, contestId, role: role as any } },
    });
    if (existing) throw new ConflictException('User already has this role in this contest');

    return this.prisma.contestMember.create({
      data: {
        userId: targetUserId,
        contestId,
        role: role as any,
        assignedBy,
      },
    });
  }

  async removeMember(contestId: string, targetUserId: string, role: string, requestingUserId: string) {
    await this.assertOrganizerOrAdmin(contestId, requestingUserId);

    return this.prisma.contestMember.deleteMany({
      where: { userId: targetUserId, contestId, role: role as any },
    });
  }

  async getMembers(contestId: string) {
    return this.prisma.contestMember.findMany({
      where: { contestId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });
  }

  // ==========================================
  // KATILIM BAŞVURUSU
  // ==========================================

  async apply(contestId: string, userId: string, message?: string) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundException('Contest not found');

    if (!['APPROVED', 'APPLICATIONS', 'ACTIVE'].includes(contest.status)) {
      throw new BadRequestException('Contest is not accepting applications');
    }

    // Zaten başvurmuş mu
    const existing = await this.prisma.contestApplication.findUnique({
      where: { userId_contestId: { userId, contestId } },
    });
    if (existing) throw new ConflictException('Already applied');

    // Max katılımcı kontrolü
    if (contest.maxParticipants) {
      const count = await this.prisma.contestApplication.count({
        where: { contestId, status: 'APPROVED' },
      });
      if (count >= contest.maxParticipants) {
        throw new BadRequestException('Contest is full');
      }
    }

    const status = contest.approvalMode === 'AUTO' ? 'APPROVED' : 'PENDING';

    const application = await this.prisma.contestApplication.create({
      data: { userId, contestId, status, message },
    });

    // AUTO ise direkt PARTICIPANT olarak ekle
    if (status === 'APPROVED') {
      await this.prisma.contestMember.create({
        data: { userId, contestId, role: 'PARTICIPANT' },
      });
    }

    return application;
  }

  async getMyApplication(contestId: string, userId: string) {
    return this.prisma.contestApplication.findUnique({
      where: { userId_contestId: { userId, contestId } },
    });
  }

  async getApplications(contestId: string, requestingUserId: string) {
    await this.assertOrganizerOrAdmin(contestId, requestingUserId);

    return this.prisma.contestApplication.findMany({
      where: { contestId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveApplication(applicationId: string, requestingUserId: string) {
    const app = await this.prisma.contestApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Application not found');

    await this.assertOrganizerOrAdmin(app.contestId, requestingUserId);

    await this.prisma.contestApplication.update({
      where: { id: applicationId },
      data: { status: 'APPROVED' },
    });

    // PARTICIPANT rolü ver
    await this.prisma.contestMember.upsert({
      where: { userId_contestId_role: { userId: app.userId, contestId: app.contestId, role: 'PARTICIPANT' } },
      create: { userId: app.userId, contestId: app.contestId, role: 'PARTICIPANT' },
      update: {},
    });

    return { message: 'Application approved' };
  }

  async rejectApplication(applicationId: string, requestingUserId: string) {
    const app = await this.prisma.contestApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Application not found');

    await this.assertOrganizerOrAdmin(app.contestId, requestingUserId);

    return this.prisma.contestApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });
  }

  // ==========================================
  // ESER TESLİMİ
  // ==========================================

  async submitWork(contestId: string, userId: string, data: { title: string; description?: string; link?: string }) {
    // Katılımcı mı kontrol
    const member = await this.prisma.contestMember.findFirst({
      where: { userId, contestId, role: 'PARTICIPANT' },
    });
    if (!member) throw new ForbiddenException('You are not a participant in this contest');

    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest || !['ACTIVE'].includes(contest.status)) {
      throw new BadRequestException('Contest is not accepting submissions');
    }

    return this.prisma.submission.upsert({
      where: { userId_contestId: { userId, contestId } },
      create: {
        userId,
        contestId,
        title: data.title,
        description: data.description,
        link: data.link,
      },
      update: {
        title: data.title,
        description: data.description,
        link: data.link,
      },
    });
  }

  async getSubmissions(contestId: string, requestingUserId: string) {
    // Organizatör veya jüri görebilir
    const member = await this.prisma.contestMember.findFirst({
      where: {
        contestId,
        userId: requestingUserId,
        role: { in: ['ORGANIZER', 'CO_ORGANIZER', 'JURY'] },
      },
    });
    const user = await this.prisma.user.findUnique({ where: { id: requestingUserId } });
    if (!member && !['ADMIN', 'SUPER_ADMIN'].includes(user?.globalRole || '')) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.submission.findMany({
      where: { contestId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { scores: true } },
      },
    });
  }

  // ==========================================
  // JÜRİ OYLAMA
  // ==========================================

  async getJuryQueue(contestId: string, juryId: string) {
    // Jüri mi kontrol
    const member = await this.prisma.contestMember.findFirst({
      where: { contestId, userId: juryId, role: 'JURY' },
    });
    if (!member) throw new ForbiddenException('You are not a jury in this contest');

    // Henüz oy vermediği submission'ları getir
    const alreadyScored = await this.prisma.juryScore.findMany({
      where: { juryId, submission: { contestId } },
      select: { submissionId: true },
    });
    const scoredIds = alreadyScored.map((s) => s.submissionId);

    return this.prisma.submission.findMany({
      where: {
        contestId,
        id: { notIn: scoredIds },
      },
      include: {
        user: { select: { id: true, username: true, displayName: true } },
        files: true,
      },
    });
  }

  async submitScore(contestId: string, juryId: string, submissionId: string, score: number, comment?: string) {
    // Jüri mi kontrol
    const member = await this.prisma.contestMember.findFirst({
      where: { contestId, userId: juryId, role: 'JURY' },
    });
    if (!member) throw new ForbiddenException('You are not a jury in this contest');

    // Zaten oy vermiş mi
    const existing = await this.prisma.juryScore.findUnique({
      where: { juryId_submissionId: { juryId, submissionId } },
    });
    if (existing) throw new ConflictException('You have already scored this submission');

    // Score range kontrolü
    if (score < 0 || score > 10) throw new BadRequestException('Score must be between 0 and 10');

    return this.prisma.juryScore.create({
      data: {
        juryId,
        submissionId,
        score,
        comment,
        isLocked: true,
      },
    });
  }

  async getJuryScores(contestId: string, juryId: string) {
    // Verify jury membership
    const member = await this.prisma.contestMember.findFirst({
      where: { contestId, userId: juryId, role: 'JURY' },
    });
    if (!member) throw new ForbiddenException('You are not a jury in this contest');

    // Get all scores submitted by this jury
    const scores = await this.prisma.juryScore.findMany({
      where: { juryId },
      include: {
        submission: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: scores.length,
      scores,
    };
  }

  // ==========================================
  // FİNALİZE (Sonuçları hesapla)
  // ==========================================

  async finalize(contestId: string, userId: string) {
    await this.assertOrganizerOrAdmin(contestId, userId);

    const submissions = await this.prisma.submission.findMany({
      where: { contestId },
      include: { scores: true },
    });

    // Ortalama puan hesapla
    const scored = submissions.map((sub) => {
      const total = sub.scores.reduce((acc, s) => acc + s.score, 0);
      const avg = sub.scores.length > 0 ? total / sub.scores.length : 0;
      return { id: sub.id, avg };
    });

    // Sırala
    scored.sort((a, b) => b.avg - a.avg);

    // Güncelle
    for (let i = 0; i < scored.length; i++) {
      await this.prisma.submission.update({
        where: { id: scored[i].id },
        data: { finalScore: scored[i].avg, rank: i + 1 },
      });
    }

    await this.prisma.contest.update({
      where: { id: contestId },
      data: { status: 'FINALIZED' },
    });

    return { message: 'Contest finalized', results: scored };
  }

  // Sadece SUPER_ADMIN: Detaylı oy bilgisi
  async getDetailedScores(contestId: string) {
    return this.prisma.juryScore.findMany({
      where: { submission: { contestId } },
      include: {
        jury: { select: { id: true, username: true, displayName: true } },
        submission: {
          select: { id: true, title: true, user: { select: { id: true, username: true } } },
        },
      },
    });
  }

  // Herkese açık sonuçlar (sadece toplam skor)
  async getResults(contestId: string) {
    return this.prisma.submission.findMany({
      where: { contestId, rank: { not: null } },
      select: {
        id: true,
        title: true,
        finalScore: true,
        rank: true,
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { rank: 'asc' },
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private async assertOrganizerOrAdmin(contestId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (['ADMIN', 'SUPER_ADMIN'].includes(user?.globalRole || '')) return;

    const member = await this.prisma.contestMember.findFirst({
      where: {
        contestId,
        userId,
        role: { in: ['ORGANIZER', 'CO_ORGANIZER'] },
      },
    });
    if (!member) throw new ForbiddenException('Not authorized');
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }
}