// files/files.controller.ts
import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get(':fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { stream, mimetype, filename, size } = 
      await this.filesService.getFileStream(
        fileId,
        req.user.id,
        req.user.role,
      );

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': size,
    });

    stream.pipe(res);
  }
}