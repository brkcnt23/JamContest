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

  // ==========================================
  // JURY DAVET SİSTEMİ
  // ==========================================

  async inviteJury(contestId: string, username: string, invitedBy: string) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundException('Contest not found');

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    // Organizatör kendi contestine jury olamaz
    if (contest.createdById === user.id) {
      throw new ForbiddenException('Organizatör kendi contestinde jury olamaz');
    }

    // Zaten ACCEPTED jury vardır kontrol et
    const existingMember = await this.prisma.contestMember.findFirst({
      where: { contestId, userId: user.id, role: 'JURY' },
    });
    if (existingMember) {
      throw new ConflictException('Bu user zaten jury olarak ekli');
    }

    // Tekrar davet edilemez kontrol et
    const existingInvitation = await this.prisma.juryInvitation.findUnique({
      where: { contestId_userId: { contestId, userId: user.id } },
    });
    if (existingInvitation && existingInvitation.status === 'PENDING') {
      throw new ConflictException('Bu user\'a zaten pending davet var');
    }

    return this.prisma.juryInvitation.create({
      data: {
        contestId,
        userId: user.id,
        invitedBy,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        contest: { select: { id: true, title: true, slug: true } },
        inviter: { select: { id: true, username: true } },
      },
    });
  }

  async acceptJuryInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.juryInvitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.userId !== userId) {
      throw new ForbiddenException('Not your invitation');
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation is not pending');
    }

    // ContestMember'a JURY rolüyle ekle
    await this.prisma.contestMember.create({
      data: {
        contestId: invitation.contestId,
        userId,
        role: 'JURY',
        assignedBy: invitation.invitedBy,
      },
    });

    // Daveti ACCEPTED yap
    return this.prisma.juryInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED', updatedAt: new Date() },
      include: {
        user: { select: { id: true, username: true, displayName: true } },
        contest: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async rejectJuryInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.juryInvitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.userId !== userId) {
      throw new ForbiddenException('Not your invitation');
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Invitation is not pending');
    }

    return this.prisma.juryInvitation.update({
      where: { id: invitationId },
      data: { status: 'REJECTED', updatedAt: new Date() },
    });
  }

  async cancelJuryInvitation(invitationId: string, organizerId: string) {
    const invitation = await this.prisma.juryInvitation.findUnique({
      where: { id: invitationId },
      include: { contest: true },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.contest.createdById !== organizerId) {
      throw new ForbiddenException('Not authorized');
    }
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Only pending invitations can be cancelled');
    }

    return this.prisma.juryInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), updatedAt: new Date() },
    });
  }

  async getMyJuryInvitations(userId: string) {
    return this.prisma.juryInvitation.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      include: {
        contest: { select: { id: true, title: true, slug: true, description: true } },
        inviter: { select: { id: true, username: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContestInvitations(contestId: string) {
    return this.prisma.juryInvitation.findMany({
      where: { contestId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        inviter: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // DÜZENLEME TALEPLERİ
  // ==========================================

  async createEditRequest(
    contestId: string,
    changes: object,
    reason: string,
    organizerId: string,
  ) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundException('Contest not found');

    if (contest.createdById !== organizerId) {
      throw new ForbiddenException('Not authorized');
    }

    if (!['APPROVED', 'ACTIVE'].includes(contest.status)) {
      throw new BadRequestException('Contest must be APPROVED or ACTIVE');
    }

    return this.prisma.contestEditRequest.create({
      data: {
        contestId,
        requestedBy: organizerId,
        changes: changes as any,
        status: 'PENDING',
      },
      include: {
        requester: { select: { id: true, username: true } },
        contest: { select: { id: true, title: true } },
      },
    });
  }

  async approveEditRequest(requestId: string, adminId: string) {
    const request = await this.prisma.contestEditRequest.findUnique({
      where: { id: requestId },
      include: { contest: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    // changes'deki alanları contest'e uygula
    const changes = request.changes as any;
    await this.prisma.contest.update({
      where: { id: request.contestId },
      data: {
        ...changes,
        updatedAt: new Date(),
      },
    });

    return this.prisma.contestEditRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', updatedAt: new Date() },
    });
  }

  async rejectEditRequest(requestId: string, adminNote: string) {
    const request = await this.prisma.contestEditRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    return this.prisma.contestEditRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', adminNote, updatedAt: new Date() },
    });
  }

  async getPendingEditRequests() {
    return this.prisma.contestEditRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        requester: { select: { id: true, username: true, displayName: true } },
        contest: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // İPTAL TALEPLERİ
  // ==========================================

  async createCancelRequest(contestId: string, reason: string, organizerId: string) {
    const contest = await this.prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundException('Contest not found');

    if (contest.createdById !== organizerId) {
      throw new ForbiddenException('Not authorized');
    }

    if (!['APPROVED', 'ACTIVE'].includes(contest.status)) {
      throw new BadRequestException('Contest must be APPROVED or ACTIVE');
    }

    // Sadece bir tane active cancel request olabilir
    const existing = await this.prisma.contestCancelRequest.findUnique({
      where: { contestId },
    });
    if (existing && existing.status === 'PENDING') {
      throw new ConflictException('Cancel request already pending');
    }

    return this.prisma.contestCancelRequest.create({
      data: {
        contestId,
        requestedBy: organizerId,
        reason,
        status: 'PENDING',
      },
      include: {
        requester: { select: { id: true, username: true } },
        contest: { select: { id: true, title: true } },
      },
    });
  }

  async approveCancelRequest(contestId: string, adminId: string) {
    const request = await this.prisma.contestCancelRequest.findUnique({
      where: { contestId },
    });
    if (!request) throw new NotFoundException('Cancel request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    // Contest'i CANCELLED yap
    await this.prisma.contest.update({
      where: { id: contestId },
      data: { status: 'CANCELLED', reviewStatus: 'CANCELLED' },
    });

    // Tüm JuryScore'ları arşivle
    await this.prisma.juryScore.updateMany({
      where: { submission: { contestId } },
      data: { archivedAt: new Date(), archivedBy: adminId },
    });

    return this.prisma.contestCancelRequest.update({
      where: { contestId },
      data: { status: 'APPROVED', updatedAt: new Date() },
    });
  }

  async rejectCancelRequest(contestId: string, adminNote: string) {
    const request = await this.prisma.contestCancelRequest.findUnique({
      where: { contestId },
    });
    if (!request) throw new NotFoundException('Cancel request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    return this.prisma.contestCancelRequest.update({
      where: { contestId },
      data: { status: 'REJECTED', adminNote, updatedAt: new Date() },
    });
  }

  async getPendingCancelRequests() {
    return this.prisma.contestCancelRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        requester: { select: { id: true, username: true, displayName: true } },
        contest: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // ONAYA GÖNDER (Submit for Review)
  // ==========================================

  async submitForReview(contestId: string, organizerId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
    });
    if (!contest) throw new NotFoundException('Contest not found');

    if (contest.createdById !== organizerId) {
      throw new ForbiddenException('Not authorized');
    }

    if (contest.status !== 'DRAFT') {
      throw new BadRequestException('Contest must be in DRAFT status');
    }

    // En az 1 ACCEPTED jury olmalı
    const acceptedJury = await this.prisma.juryInvitation.findFirst({
      where: { contestId, status: 'ACCEPTED' },
    });
    if (!acceptedJury) {
      throw new BadRequestException('En az 1 ACCEPTED jury olmak zorunlu');
    }

    // Hiç PENDING invitation kalmamalı
    const pendingInvitations = await this.prisma.juryInvitation.findMany({
      where: { contestId, status: 'PENDING' },
    });
    if (pendingInvitations.length > 0) {
      throw new BadRequestException(
        'Tüm davetler ACCEPTED veya REJECTED/CANCELLED olmalı',
      );
    }

    return this.prisma.contest.update({
      where: { id: contestId },
      data: { reviewStatus: 'REVIEW_PENDING', updatedAt: new Date() },
      include: {
        createdBy: { select: { id: true, username: true } },
      },
    });
  }

  // ==========================================
  // JURY SKORU SİLME (Arşivleme)
  // ==========================================

  async archiveJuryScore(scoreId: string, adminId: string) {
    const score = await this.prisma.juryScore.findUnique({ where: { id: scoreId } });
    if (!score) throw new NotFoundException('Score not found');

    return this.prisma.juryScore.update({
      where: { id: scoreId },
      data: { archivedAt: new Date(), archivedBy: adminId },
      include: {
        jury: { select: { id: true, username: true } },
        submission: { select: { id: true, title: true } },
      },
    });
  }

  async getContestScores(contestId: string, includeArchived = false) {
    const where: any = { submission: { contestId } };
    if (!includeArchived) {
      where.archivedAt = null;
    }

    return this.prisma.juryScore.findMany({
      where,
      include: {
        jury: { select: { id: true, username: true, displayName: true, avatar: true } },
        submission: {
          select: { id: true, title: true, user: { select: { id: true, username: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}