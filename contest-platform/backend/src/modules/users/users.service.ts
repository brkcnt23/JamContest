import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // KULLANICI LİSTESİ (Admin panel için)
  // ==========================================

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        globalRole: true,
        createdAt: true,
        contestMembers: {
          select: {
            role: true,
            contest: { select: { id: true, title: true } },
          },
        },
        userBans: {
          select: {
            id: true,
            reason: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // ROL DEĞİŞTİRME (Global role)
  // ==========================================

  async updateGlobalRole(
    targetUserId: string,
    newRole: string,
    requestingUser: { id: string; globalRole: string },
  ) {
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw new NotFoundException('User not found');

    // SUPER_ADMIN sadece SUPER_ADMIN tarafından değiştirilebilir
    if (target.globalRole === 'SUPER_ADMIN' && requestingUser.globalRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify Super Admin');
    }

    // ADMIN rolü sadece SUPER_ADMIN atayabilir
    if (newRole === 'ADMIN' && requestingUser.globalRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admin can assign Admin role');
    }

    if (newRole === 'SUPER_ADMIN' && requestingUser.globalRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admin can assign Super Admin role');
    }

    // Admin başka bir adminin rolünü değiştiremez
    if (target.globalRole === 'ADMIN' && requestingUser.globalRole === 'ADMIN') {
      throw new ForbiddenException('Admins cannot modify other Admins');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { globalRole: newRole as any },
      select: {
        id: true,
        username: true,
        email: true,
        globalRole: true,
      },
    });
  }

  // ==========================================
  // PROFİL
  // ==========================================

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true } },
        contestMembers: {
          include: { contest: { select: { id: true, title: true, slug: true, status: true } } },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    let galleryArtworks: any[] = [];
    try {
      const raw = user.galleryArtworks as any;
      galleryArtworks = Array.isArray(raw) ? raw : [];
    } catch (error) {}

    return {
      userId: user.id,
      displayName: user.displayName || user.username,
      username: user.username,
      tagline: user.tagline || '',
      bio: user.bio || '',
      about: user.about || '',
      profileImageUrl: user.avatar || '',
      portfolioLink: user.portfolioLink || '',
      galleryArtworks,
      contactEmail: user.contactEmail || '',
      contactInstagram: user.contactInstagram || '',
      contactTwitter: user.contactTwitter || '',
      contactBehance: user.contactBehance || '',
      contactArtStation: user.contactArtStation || '',
      globalRole: user.globalRole,
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        type: ub.badge.type,
        name: ub.badge.name,
        icon: ub.badge.icon,
        color: ub.badge.color,
        earnedAt: ub.earnedAt,
      })),
      contestRoles: user.contestMembers.map((cm) => ({
        contestId: cm.contest.id,
        contestTitle: cm.contest.title,
        contestSlug: cm.contest.slug,
        role: cm.role,
      })),
    };
  }

  async updateUserProfile(userId: string, data: any) {
    let artworksToSave: any[] = [];
    if (Array.isArray(data.galleryArtworks)) {
      artworksToSave = data.galleryArtworks
        .filter((art: any) => art && typeof art === 'object' && art.url)
        .map((art: any) => ({
          title: art.title || 'Untitled',
          url: art.url.trim(),
        }));
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        tagline: data.tagline,
        bio: data.bio,
        about: data.about,
        portfolioLink: data.portfolioLink,
        avatar: data.avatar,
        galleryArtworks: artworksToSave as any,
        contactEmail: data.contactEmail,
        contactInstagram: data.contactInstagram,
        contactTwitter: data.contactTwitter,
        contactBehance: data.contactBehance,
        contactArtStation: data.contactArtStation,
      },
    });

    let savedArtworks: any[] = [];
    try {
      const raw = updated.galleryArtworks as any;
      savedArtworks = Array.isArray(raw) ? raw : [];
    } catch {}

    return {
      userId: updated.id,
      displayName: updated.displayName || updated.username,
      tagline: updated.tagline || '',
      bio: updated.bio || '',
      about: updated.about || '',
      profileImageUrl: updated.avatar || '',
      portfolioLink: updated.portfolioLink || '',
      galleryArtworks: savedArtworks,
      contactEmail: updated.contactEmail || '',
      contactInstagram: updated.contactInstagram || '',
      contactTwitter: updated.contactTwitter || '',
      contactBehance: updated.contactBehance || '',
      contactArtStation: updated.contactArtStation || '',
    };
  }

  // ==========================================
  // KULLANICI ARAMA (Jüri/organizatör seçimi için)
  // ==========================================

  async searchUsers(query: string, limit = 20) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        globalRole: true,
      },
      take: limit,
    });
  }

  // ==========================================
  // KULLNAICI GÖNDERİMLERİ
  // ==========================================

  async getMySubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: {
        contest: { select: { id: true, title: true, slug: true, status: true, category: true, coverImage: true } },
        scores: {
          select: {
            score: true,
            comment: true,
            jury: { select: { id: true, username: true, displayName: true } },
          },
        },
        _count: { select: { scores: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // ==========================================
  // BAN SİSTEMİ
  // ==========================================

  /**
   * Belirli bir aksiyon için kullanıcının aktif ban'ı var mı kontrol et
   * @param userId
   * @param action "APPLY", "POST", "SUBMIT", "CREATE_CONTEST"
   */
  async checkBan(userId: string, action: string): Promise<void> {
    const ban = await this.prisma.userBan.findFirst({
      where: {
        userId,
        active: true,
        restrictions: { has: action },
      },
    });

    if (ban) {
      throw new ForbiddenException(`Bu işlem için banlandınız: ${ban.reason}`);
    }
  }

  /**
   * Kullanıcıyı banla
   */
  async banUser(userId: string, reason: string, restrictions: string[], bannedBy: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (userId === bannedBy) {
      throw new ForbiddenException('Kendinizi banlamazsınız');
    }

    return this.prisma.userBan.create({
      data: {
        userId,
        bannedBy,
        reason,
        restrictions,
        active: true,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        bannedByUser: { select: { id: true, username: true } },
      },
    });
  }

  /**
   * Ban'ı kaldır (deaktif et)
   */
  async removeBan(banId: string) {
    const ban = await this.prisma.userBan.findUnique({ where: { id: banId } });
    if (!ban) throw new NotFoundException('Ban not found');

    return this.prisma.userBan.update({
      where: { id: banId },
      data: { active: false, updatedAt: new Date() },
      include: {
        user: { select: { id: true, username: true, email: true } },
        bannedByUser: { select: { id: true, username: true } },
      },
    });
  }

  /**
   * Kullanıcının ban geçmişi
   */
  async getUserBans(userId: string) {
    return this.prisma.userBan.findMany({
      where: { userId },
      include: {
        bannedByUser: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tüm aktif banları getir (admin için)
   */
  async getActiveBans() {
    return this.prisma.userBan.findMany({
      where: { active: true },
      include: {
        user: { select: { id: true, username: true, email: true } },
        bannedByUser: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // JÜRİ SKORLARI
  // ==========================================

  async getMyJuryScores(userId: string) {
    return this.prisma.juryScore.findMany({
      where: { juryId: userId },
      include: {
        submission: {
          select: {
            id: true,
            title: true,
            link: true,
            user: { select: { id: true, username: true, displayName: true } },
            contest: { select: { id: true, title: true, slug: true, status: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // KOMUNİ FAVORİLERİ
  // ==========================================

  async getMyFavorites(userId: string) {
    return this.prisma.contestFavorite.findMany({
      where: { userId },
      include: {
        contest: {
          include: {
            createdBy: { select: { id: true, username: true, displayName: true } },
            _count: { select: { applications: true, submissions: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addFavorite(userId: string, contestId: string) {
    await this.prisma.contestFavorite.upsert({
      where: {
        userId_contestId: { userId, contestId },
      },
      create: { userId, contestId },
      update: {},
    });
    return { favorited: true };
  }

  async removeFavorite(userId: string, contestId: string) {
    await this.prisma.contestFavorite.deleteMany({
      where: { userId, contestId },
    });
    return { favorited: false };
  }

  async checkFavorite(userId: string, contestId: string) {
    const favorite = await this.prisma.contestFavorite.findUnique({
      where: {
        userId_contestId: { userId, contestId },
      },
    });
    return { favorited: !!favorite };
  }
}