import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async saveFile(submissionId: string, userId: string, file: Express.Multer.File) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { contest: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.userId !== userId) throw new ForbiddenException('Not your submission');

    // Format check
    const allowed = submission.contest.allowedFormats;
    if (allowed?.length) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      if (!allowed.includes(ext)) {
        fs.unlinkSync(file.path);
        throw new BadRequestException(`Format not allowed: ${ext}. Allowed: ${allowed.join(', ')}`);
      }
    }

    return this.prisma.submissionFile.create({
      data: {
        submissionId,
        filename: file.filename,
        originalName: file.originalname,
        filepath: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: { submission: true },
    });
    if (!file) throw new NotFoundException('File not found');
    if (file.submission.userId !== userId) throw new ForbiddenException('Not your file');

    if (fs.existsSync(file.filepath)) fs.unlinkSync(file.filepath);
    return this.prisma.submissionFile.delete({ where: { id: fileId } });
  }

  async getFileRecord(fileId: string) {
    const file = await this.prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: {
          include: {
            contest: { include: { members: true } },
          },
        },
      },
    });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  canAccessFile(file: any, userId: string, userRole: string): boolean {
    if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) return true;
    if (file.submission.userId === userId) return true;
    return file.submission.contest.members.some(
      (m: any) => m.userId === userId && ['JURY', 'ORGANIZER', 'CO_ORGANIZER'].includes(m.role),
    );
  }
}
