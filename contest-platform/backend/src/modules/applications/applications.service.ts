import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ApplyForJuryDto, ApplyForOrganizerDto, ReviewApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Apply for Jury role
   */
  async applyForJury(userId: string, dto: ApplyForJuryDto) {
    // Check if user already has a jury application
    const existing = await this.prisma.juryApplication.findUnique({
      where: { userId },
    });

    let application;
    if (existing) {
      // If reapplying, update the existing application
      application = await this.prisma.juryApplication.update({
        where: { userId },
        data: {
          motivation: dto.motivation,
          status: 'PENDING',
          appliedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
        },
      });
    } else {
      // Create new application
      application = await this.prisma.juryApplication.create({
        data: {
          userId,
          motivation: dto.motivation,
          status: 'PENDING',
        },
      });
    }

    // Send confirmation email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await this.mailService.sendJuryApplicationConfirmation(user.email, user.username);
    }

    return { success: true, application };
  }

  /**
   * Apply for Organizer role
   */
  async applyForOrganizer(userId: string, dto: ApplyForOrganizerDto) {
    // Check if user already has an organizer application
    const existing = await this.prisma.organizerApplication.findUnique({
      where: { userId },
    });

    let application;
    if (existing) {
      // If reapplying, update the existing application
      application = await this.prisma.organizerApplication.update({
        where: { userId },
        data: {
          motivation: dto.motivation,
          status: 'PENDING',
          appliedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
        },
      });
    } else {
      // Create new application
      application = await this.prisma.organizerApplication.create({
        data: {
          userId,
          motivation: dto.motivation,
          status: 'PENDING',
        },
      });
    }

    // Send confirmation email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await this.mailService.sendOrganizerApplicationConfirmation(user.email, user.username);
    }

    return { success: true, application };
  }

  /**
   * Get user's application status
   */
  async getApplicationStatus(userId: string) {
    const juryApp = await this.prisma.juryApplication.findUnique({
      where: { userId },
      select: { status: true, reason: true },
    });

    const organizerApp = await this.prisma.organizerApplication.findUnique({
      where: { userId },
      select: { status: true, reason: true },
    });

    return {
      jury: juryApp,
      organizer: organizerApp,
    };
  }

  /**
   * Get all applications (admin only)
   */
  async getApplications(type?: 'jury' | 'organizer', status?: string) {
    if (type === 'jury') {
      return await this.prisma.juryApplication.findMany({
        where: status ? { status } : {},
        include: { user: true },
        orderBy: { appliedAt: 'desc' },
      });
    }

    if (type === 'organizer') {
      return await this.prisma.organizerApplication.findMany({
        where: status ? { status } : {},
        include: { user: true },
        orderBy: { appliedAt: 'desc' },
      });
    }

    // Return both if no type specified
    const juryApps = await this.prisma.juryApplication.findMany({
      include: { user: true },
      orderBy: { appliedAt: 'desc' },
    });

    const organizerApps = await this.prisma.organizerApplication.findMany({
      include: { user: true },
      orderBy: { appliedAt: 'desc' },
    });

    return {
      jury: juryApps,
      organizer: organizerApps,
    };
  }

  /**
   * Review jury application (admin only)
   */
  async reviewJuryApplication(
    applicationId: string,
    dto: ReviewApplicationDto,
    reviewedById: string,
  ) {
    const application = await this.prisma.juryApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Application has already been reviewed');
    }

    const updatedApp = await this.prisma.juryApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.approved ? 'APPROVED' : 'REJECTED',
        reason: dto.reason,
        reviewedAt: new Date(),
        reviewedBy: reviewedById,
      },
    });

    // If approved, update user role
    if (dto.approved) {
      await this.prisma.user.update({
        where: { id: application.userId },
        data: { globalRole: { set: 'JURY' } },
      });

      // Send approval email
      await this.mailService.sendJuryApprovalEmail(
        application.user.email,
        application.user.username,
      );
    } else {
      // Send rejection email
      await this.mailService.sendJuryRejectionEmail(
        application.user.email,
        application.user.username,
        dto.reason,
      );
    }

    return updatedApp;
  }

  /**
   * Review organizer application (admin only)
   */
  async reviewOrganizerApplication(
    applicationId: string,
    dto: ReviewApplicationDto,
    reviewedById: string,
  ) {
    const application = await this.prisma.organizerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Application has already been reviewed');
    }

    const updatedApp = await this.prisma.organizerApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.approved ? 'APPROVED' : 'REJECTED',
        reason: dto.reason,
        reviewedAt: new Date(),
        reviewedBy: reviewedById,
      },
    });

    // If approved, update user role
    if (dto.approved) {
      await this.prisma.user.update({
        where: { id: application.userId },
        data: { globalRole: { set: 'ORGANIZER' } },
      });

      // Send approval email
      await this.mailService.sendOrganizerApprovalEmail(
        application.user.email,
        application.user.username,
      );
    } else {
      // Send rejection email
      await this.mailService.sendOrganizerRejectionEmail(
        application.user.email,
        application.user.username,
        dto.reason,
      );
    }

    return updatedApp;
  }
}
