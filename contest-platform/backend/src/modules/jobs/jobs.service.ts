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

  // ==================== APPLICATIONS ====================

  async apply(userId: string, jobId: string, data: { message?: string; portfolioLink?: string; answers?: { questionId: string; value: string }[] }) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId === userId) throw new ForbiddenException('Kendi ilanınıza başvuramazsınız');

    // Validate question IDs belong to this job
    if (data.answers?.length) {
      const questions = await this.prisma.jobQuestion.findMany({ where: { jobListingId: jobId } });
      const questionIds = new Set(questions.map(q => q.id));
      for (const a of data.answers) {
        if (!questionIds.has(a.questionId)) throw new BadRequestException(`Geçersiz soru ID: ${a.questionId}`);
        const q = questions.find(x => x.id === a.questionId);
        if (q && q.type === 'NUMBER' && isNaN(Number(a.value))) throw new BadRequestException(`"${q.text}" sorusu için sayısal değer giriniz`);
      }
    }

    try {
      return await this.prisma.jobApplication.create({
        data: {
          jobListingId: jobId,
          userId,
          message: data.message || null,
          portfolioLink: data.portfolioLink || null,
          answers: data.answers?.length ? {
            create: data.answers.map(a => ({ questionId: a.questionId, value: a.value })),
          } : undefined,
        },
        include: { jobListing: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new BadRequestException('Bu işe zaten başvurdunuz');
      throw e;
    }
  }

  async getApplications(userId: string, jobId: string, query?: { status?: string; questionId?: string; operator?: string; value?: string }) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi ilanınızın başvurularını görebilirsiniz');

    const where: any = { jobListingId: jobId };
    if (query?.status) where.status = query.status;

    const apps = await this.prisma.jobApplication.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        answers: { include: { question: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Post-filter by question answer
    if (query?.questionId && query?.operator && query?.value !== undefined) {
      const { questionId, operator, value } = query;
      return apps.filter(app => {
        const answer = app.answers.find(a => a.questionId === questionId);
        if (!answer) return false;
        const numVal = Number(answer.value);
        const filterVal = Number(value);
        if (isNaN(numVal) || isNaN(filterVal)) return operator === 'eq' ? answer.value === value : false;
        switch (operator) {
          case 'gte': return numVal >= filterVal;
          case 'lte': return numVal <= filterVal;
          case 'gt':  return numVal > filterVal;
          case 'lt':  return numVal < filterVal;
          case 'eq':  return answer.value === value;
          default: return true;
        }
      });
    }

    return apps;
  }

  async getApplicationDetail(userId: string, jobId: string, appId: string) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi ilanınızın başvurularını görebilirsiniz');

    return this.prisma.jobApplication.findUnique({
      where: { id: appId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        answers: { include: { question: true } },
      },
    });
  }

  async updateApplicationStatus(userId: string, jobId: string, appId: string, status: string) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi ilanınızın başvurularını yönetebilirsiniz');

    return this.prisma.jobApplication.update({
      where: { id: appId },
      data: { status },
    });
  }

  async getMyApplications(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      include: {
        jobListing: { select: { id: true, title: true, company: true } },
        answers: { include: { question: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== QUESTIONS ====================

  async addQuestion(userId: string, jobId: string, data: { text: string; type: string; options?: string[]; order?: number }) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi ilanınıza soru ekleyebilirsiniz');
    if (!['TEXT', 'NUMBER', 'CHOICE'].includes(data.type)) throw new BadRequestException('Geçersiz soru tipi');
    if (data.type === 'CHOICE' && (!data.options || data.options.length < 2)) throw new BadRequestException('Seçim tipi sorularda en az 2 seçenek olmalıdır');

    const maxOrder = await this.prisma.jobQuestion.aggregate({ where: { jobListingId: jobId }, _max: { order: true } });

    return this.prisma.jobQuestion.create({
      data: {
        jobListingId: jobId,
        text: data.text,
        type: data.type,
        options: data.options || [],
        order: data.order ?? ((maxOrder._max.order ?? -1) + 1),
      },
    });
  }

  async getQuestions(jobId: string) {
    return this.prisma.jobQuestion.findMany({
      where: { jobListingId: jobId },
      orderBy: { order: 'asc' },
    });
  }

  async updateQuestion(userId: string, jobId: string, questionId: string, data: any) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi sorularınızı düzenleyebilirsiniz');

    return this.prisma.jobQuestion.update({
      where: { id: questionId },
      data: {
        text: data.text,
        type: data.type,
        options: data.options,
        order: data.order,
      },
    });
  }

  async deleteQuestion(userId: string, jobId: string, questionId: string) {
    const job = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    if (job.userId !== userId) throw new ForbiddenException('Sadece kendi sorularınızı silebilirsiniz');

    return this.prisma.jobQuestion.delete({ where: { id: questionId } });
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
