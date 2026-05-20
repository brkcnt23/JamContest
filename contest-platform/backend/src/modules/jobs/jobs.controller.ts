import { Controller, Get, Post, Put, Delete, Patch, UseGuards, Body, Param, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.jobsService.create(req.user.id, body);
  }

  @Get()
  async findAll(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('featured') featured?: string,
  ) {
    return this.jobsService.findAll(
      Math.min(Number(take) || 20, 50),
      Math.max(Number(skip) || 0, 0),
      featured === 'true',
    );
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(@Request() req: any) {
    return this.jobsService.getMyApplications(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.jobsService.update(req.user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.jobsService.delete(req.user.id, id);
  }

  // ==================== APPLICATIONS ====================

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  async apply(
    @Param('id') id: string,
    @Body() body: { message?: string; portfolioLink?: string; answers?: { questionId: string; value: string }[] },
    @Request() req: any,
  ) {
    return this.jobsService.apply(req.user.id, id, body);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  async getApplications(
    @Param('id') id: string,
    @Request() req: any,
    @Query('status') status?: string,
    @Query('questionId') questionId?: string,
    @Query('operator') operator?: string,
    @Query('value') value?: string,
  ) {
    return this.jobsService.getApplications(req.user.id, id, { status, questionId, operator, value });
  }

  @Get(':jobId/applications/:appId')
  @UseGuards(JwtAuthGuard)
  async getApplicationDetail(
    @Param('jobId') jobId: string,
    @Param('appId') appId: string,
    @Request() req: any,
  ) {
    return this.jobsService.getApplicationDetail(req.user.id, jobId, appId);
  }

  @Patch(':jobId/applications/:appId/status')
  @UseGuards(JwtAuthGuard)
  async updateApplicationStatus(
    @Param('jobId') jobId: string,
    @Param('appId') appId: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.jobsService.updateApplicationStatus(req.user.id, jobId, appId, status);
  }

  // ==================== QUESTIONS ====================

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  async addQuestion(
    @Param('id') id: string,
    @Body() body: { text: string; type: string; options?: string[]; order?: number },
    @Request() req: any,
  ) {
    return this.jobsService.addQuestion(req.user.id, id, body);
  }

  @Get(':id/questions')
  async getQuestions(@Param('id') id: string) {
    return this.jobsService.getQuestions(id);
  }

  @Put(':jobId/questions/:questionId')
  @UseGuards(JwtAuthGuard)
  async updateQuestion(
    @Param('jobId') jobId: string,
    @Param('questionId') questionId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.jobsService.updateQuestion(req.user.id, jobId, questionId, body);
  }

  @Delete(':jobId/questions/:questionId')
  @UseGuards(JwtAuthGuard)
  async deleteQuestion(
    @Param('jobId') jobId: string,
    @Param('questionId') questionId: string,
    @Request() req: any,
  ) {
    return this.jobsService.deleteQuestion(req.user.id, jobId, questionId);
  }
}
