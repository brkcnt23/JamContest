import { Controller, Get, Post, Put, Delete, UseGuards, Body, Param, Query, Request } from '@nestjs/common';
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
}
