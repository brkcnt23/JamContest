import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(email: string, password: string, username: string, displayName?: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) throw new ConflictException('Email or username already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, username, displayName: displayName || username, globalRole: 'USER', emailVerified: false },
    });

    // Verification token
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
      },
    });

    await this.mailService.sendVerificationEmail(email, user.username, token);
    return { message: 'Kayıt başarılı! Email adresinizi doğrulayın.' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.emailVerification.findUnique({ where: { token } });
    if (!record) throw new BadRequestException('Geçersiz token');
    if (record.expiresAt < new Date()) throw new BadRequestException('Token süresi dolmuş');

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });
    await this.prisma.emailVerification.delete({ where: { token } });
    return { message: 'Email doğrulandı!' };
  }

  async login(email: string, password: string, res: Response, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email adresinizi doğrulamanız gerekiyor');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id, ip, userAgent);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
      path: '/api/auth',
    });

    return { user: this.sanitizeUser(user), accessToken };
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedException('No refresh token');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw new UnauthorizedException();

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return { message: 'Çıkış yapıldı' };
  }

  async logoutAll(userId: string, res: Response) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return { message: 'Tüm cihazlardan çıkış yapıldı' };
  }

  async getSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, userAgent: true, ip: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Mail gönderildi' }; // güvenlik: user var mı belli etme

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerification.upsert({
      where: { userId: user.id },
      create: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      update: { token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    await this.mailService.sendPasswordResetEmail(email, user.username, token);
    return { message: 'Şifre sıfırlama maili gönderildi' };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.emailVerification.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) throw new BadRequestException('Geçersiz veya süresi dolmuş token');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await this.prisma.emailVerification.delete({ where: { token } });
    await this.prisma.refreshToken.updateMany({
      where: { userId: record.userId },
      data: { revokedAt: new Date() },
    });
    return { message: 'Şifre güncellendi' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        contestMembers: { include: { contest: { select: { id: true, title: true, slug: true } } } },
        badges: { include: { badge: true } },
      },
    });
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Geçersiz şifre');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Şifre güncellendi' };
  }

  async changeEmail(userId: string, currentPassword: string, newEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Geçersiz şifre');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) throw new ConflictException('Email zaten kullanımda');

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail, emailVerified: false },
    });

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerification.upsert({
      where: { userId },
      create: { userId, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      update: { token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });

    await this.mailService.sendVerificationEmail(newEmail, user.username, token);

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Email güncellendi, doğrulama maili gönderildi' };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Geçersiz şifre');
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Hesap silindi' };
  }

  async revokeSession(userId: string, sessionId: string) {
    const token = await this.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!token || token.userId !== userId) {
      throw new ForbiddenException('Bu oturum sizin değil');
    }

    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Oturum sonlandırıldı' };
  }

  private generateAccessToken(user: any) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, globalRole: user.globalRole },
      { expiresIn: '15m' },
    );
  }

  private async generateRefreshToken(userId: string, ip: string, userAgent: string) {
    const token = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        ip,
        userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return token;
  }

  private sanitizeUser(user: any) {
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }
}