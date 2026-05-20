import { Controller, Get, Post, Put, Delete, UseGuards, Body, Param, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.projectsService.create(req.user.id, body);
  }

  @Get()
  async findAll(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.projectsService.findAll(
      Math.min(Number(take) || 20, 50),
      Math.max(Number(skip) || 0, 0),
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.projectsService.update(req.user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.delete(req.user.id, id);
  }
}
