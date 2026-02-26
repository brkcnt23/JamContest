import {
  Controller, Post, Delete, Get, Param, Req, Res,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = `./uploads/submissions/${req.params.submissionId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('submission/:submissionId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB — contest override in service
  }))
  async uploadFile(
    @Param('submissionId') submissionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.uploadsService.saveFile(submissionId, req.user.id, file);
  }

  @Delete('file/:fileId')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('fileId') fileId: string, @Req() req: any) {
    return this.uploadsService.deleteFile(fileId, req.user.id);
  }

  @Get('file/:fileId')
  @UseGuards(JwtAuthGuard)
  async serveFile(
    @Param('fileId') fileId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const file = await this.uploadsService.getFileRecord(fileId);
    if (!this.uploadsService.canAccessFile(file, req.user.id, req.user.globalRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const absPath = path.resolve(file.filepath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: 'File not on disk' });
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.sendFile(absPath);
  }
}
