// files/files.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { pipeline } from 'stream/promises';
import * as mime from 'mime-types';

@Injectable()
export class FilesService {
  private readonly uploadRoot: string;
  private readonly allowedMimes = new Set([
    'image/png',
    'image/jpeg',
    'video/mp4',
    'application/zip',
    'application/pdf',
    'model/gltf-binary',
    'model/obj',
    'model/fbx',
  ]);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.uploadRoot = this.config.get('UPLOAD_PATH') || './uploads';
  }

  async uploadSubmissionFile(
    userId: string,
    contestId: string,
    submissionId: string,
    file: Express.Multer.File,
  ) {
    // Validation
    if (!this.allowedMimes.has(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const maxSize = await this.getContestMaxFileSize(contestId);
    if (file.size > maxSize) {
      throw new BadRequestException(`File too large. Max: ${maxSize} bytes`);
    }

    // Generate unique filename
    const ext = mime.extension(file.mimetype);
    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    
    // Path: uploads/contests/{contestId}/submissions/{userId}/{submissionId}/
    const relativePath = join(
      'contests',
      contestId,
      'submissions',
      userId,
      submissionId,
    );
    const absolutePath = join(this.uploadRoot, relativePath);
    
    // Ensure directory exists
    await fs.mkdir(absolutePath, { recursive: true });
    
    const filepath = join(relativePath, filename);
    const fullPath = join(this.uploadRoot, filepath);

    // Write file
    await fs.writeFile(fullPath, file.buffer);

    // Save metadata
    const fileRecord = await this.prisma.submissionFile.create({
      data: {
        submissionId,
        filename,
        originalName: file.originalname,
        filepath,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return fileRecord;
  }

  async getFileStream(fileId: string, userId: string, userRole: string) {
    const file = await this.prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: {
          include: {
            contest: {
              include: {
                juryAssignments: true,
              },
            },
          },
        },
      },
    });

    if (!file) throw new NotFoundException('File not found');

    // Authorization check
    const isOwner = file.submission.userId === userId;
    const isJury = file.submission.contest.juryAssignments.some(
      (j) => j.juryId === userId,
    );
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isJury && !isAdmin) {
      throw new BadRequestException('Unauthorized');
    }

    const fullPath = join(this.uploadRoot, file.filepath);
    
    // Check file exists
    try {
      await fs.access(fullPath);
    } catch {
      throw new NotFoundException('File not found on disk');
    }

    return {
      stream: require('fs').createReadStream(fullPath),
      mimetype: file.mimeType,
      filename: file.originalName,
      size: file.size,
    };
  }

  private async getContestMaxFileSize(contestId: string): Promise<number> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      select: { maxFileSize: true },
    });
    return contest?.maxFileSize || 209715200; // default 200MB
  }

  async deleteSubmissionFiles(submissionId: string) {
    const files = await this.prisma.submissionFile.findMany({
      where: { submissionId },
    });

    for (const file of files) {
      const fullPath = join(this.uploadRoot, file.filepath);
      try {
        await fs.unlink(fullPath);
      } catch (error) {
        console.error(`Failed to delete file: ${fullPath}`, error);
      }
    }

    await this.prisma.submissionFile.deleteMany({
      where: { submissionId },
    });
  }
}