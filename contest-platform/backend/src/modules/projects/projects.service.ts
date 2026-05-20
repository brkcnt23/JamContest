import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkProjectLimit(userId: string) {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const limit = sub && sub.status === 'ACTIVE' ? sub.plan.projectListingLimit : 0;
    if (limit === 0) throw new ForbiddenException('Proje ilanı oluşturmak için Creator veya Pro paketi gerekli');

    if (limit !== -1) {
      const activeCount = await this.prisma.projectListing.count({
        where: { userId, active: true },
      });
      if (activeCount >= limit) {
        throw new ForbiddenException(`Aylık proje ilanı limitine ulaştınız (${limit})`);
      }
    }
  }

  async create(userId: string, data: CreateProjectDto) {
    await this.checkProjectLimit(userId);

    return this.prisma.projectListing.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        price: data.price,
        tags: data.tags ?? [],
        images: data.images ?? [],
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });
  }

  async findAll(take = 20, skip = 0) {
    return this.prisma.projectListing.findMany({
      where: { active: true },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async findById(id: string) {
    const project = await this.prisma.projectListing.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });
    if (!project) throw new NotFoundException('Proje bulunamadı');
    return project;
  }

  async update(userId: string, id: string, data: UpdateProjectDto) {
    const project = await this.prisma.projectListing.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Proje bulunamadı');
    if (project.userId !== userId) throw new ForbiddenException('Sadece kendi ilanlarını düzenleyebilirsin');

    return this.prisma.projectListing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        tags: data.tags,
        images: data.images,
        active: data.active,
      },
    });
  }

  async delete(userId: string, id: string) {
    const project = await this.prisma.projectListing.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Proje bulunamadı');
    if (project.userId !== userId) throw new ForbiddenException('Sadece kendi ilanlarını silebilirsin');

    return this.prisma.projectListing.update({
      where: { id },
      data: { active: false },
    });
  }

  // ==================== CONTACT / MESSAGES ====================

  async contact(userId: string, projectId: string, data: { message: string; portfolioLink?: string; contactEmail?: string }) {
    if (!data.message?.trim()) throw new BadRequestException('Mesaj boş olamaz');

    const project = await this.prisma.projectListing.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Proje bulunamadı');
    if (project.userId === userId) throw new ForbiddenException('Kendi projenize mesaj gönderemezsiniz');

    return this.prisma.projectApplication.create({
      data: {
        projectListingId: projectId,
        userId,
        message: data.message.trim(),
        portfolioLink: data.portfolioLink || null,
        contactEmail: data.contactEmail || null,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });
  }

  async getMessages(userId: string, projectId: string) {
    const project = await this.prisma.projectListing.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Proje bulunamadı');
    if (project.userId !== userId) throw new ForbiddenException('Sadece kendi projenizin mesajlarını görebilirsiniz');

    return this.prisma.projectApplication.findMany({
      where: { projectListingId: projectId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyContacts(userId: string) {
    return this.prisma.projectApplication.findMany({
      where: { userId },
      include: {
        projectListing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

interface CreateProjectDto {
  title: string;
  description: string;
  price?: number;
  tags?: string[];
  images?: string[];
}

interface UpdateProjectDto extends Partial<CreateProjectDto> {
  active?: boolean;
}
