import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkJobLimit(userId: string) {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const limit = sub && sub.status === 'ACTIVE' ? sub.plan.jobListingLimit : 0;
    if (limit === 0) throw new ForbiddenException('İş ilanı oluşturmak için Creator veya Recruiter paketi gerekli');

    if (limit !== -1) {
      const activeCount = await this.prisma.jobListing.count({
        where: { userId, active: true },
      });
      if (activeCount >= limit) {
        throw new ForbiddenException(`Aylık iş ilanı limitine ulaştınız (${limit})`);
      }
    }
  }

  async create(userId: string, data: CreateJobDto) {
    await this.checkJobLimit(userId);

    return this.prisma.jobListing.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        company: data.company,
        location: data.location,
        remote: data.remote ?? false,
        salary: data.salary,
        tags: data.tags ?? [],
        contactEmail: data.contactEmail,
        contactUrl: data.contactUrl,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });
  }

  async findAll(take = 20, skip = 0, featured = false) {
    const where: any = { active: true };
    if (featured) where.featured = true;

    return this.prisma.jobListing.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take,
      skip,
    });
  }

  async findById(id: string) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    return job;
  }

  async update(userId: string, id: string, data: UpdateJobDto) {
    const job = await this.prisma.jobListing.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi ilanlarını düzenleyebilirsin');

    return this.prisma.jobListing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        company: data.company,
        location: data.location,
        remote: data.remote,
        salary: data.salary,
        tags: data.tags,
        contactEmail: data.contactEmail,
        contactUrl: data.contactUrl,
        active: data.active,
      },
    });
  }

  async delete(userId: string, id: string) {
    const job = await this.prisma.jobListing.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi ilanlarını silebilirsin');

    return this.prisma.jobListing.update({
      where: { id },
      data: { active: false },
    });
  }
}

interface CreateJobDto {
  title: string;
  description: string;
  company?: string;
  location?: string;
  remote?: boolean;
  salary?: string;
  tags?: string[];
  contactEmail?: string;
  contactUrl?: string;
}

interface UpdateJobDto extends Partial<CreateJobDto> {
  active?: boolean;
}
