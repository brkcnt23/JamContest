import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  ApplyForJuryDto,
  ApplyForOrganizerDto,
  ReviewApplicationDto,
  ApplicationFilterDto,
} from './dto/application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post('jury')
  @UseGuards(JwtAuthGuard)
  async applyForJury(@Body() dto: ApplyForJuryDto, @Req() req: any) {
    return this.applicationsService.applyForJury(req.user.id, dto);
  }

  @Post('organizer')
  @UseGuards(JwtAuthGuard)
  async applyForOrganizer(@Body() dto: ApplyForOrganizerDto, @Req() req: any) {
    return this.applicationsService.applyForOrganizer(req.user.id, dto);
  }

  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  async getMyApplicationStatus(@Req() req: any) {
    return this.applicationsService.getApplicationStatus(req.user.id);
  }

  @Get('admin/jury')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getJuryApplications(@Query('status') status?: string) {
    return this.applicationsService.getApplications('jury', status);
  }

  @Get('admin/organizer')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getOrganizerApplications(@Query('status') status?: string) {
    return this.applicationsService.getApplications('organizer', status);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllApplications(
    @Query('type') type?: 'jury' | 'organizer',
    @Query('status') status?: string,
  ) {
    return this.applicationsService.getApplications(type, status);
  }

  @Patch('admin/jury/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reviewJuryApplication(
    @Param('id') applicationId: string,
    @Body() dto: ReviewApplicationDto,
    @Req() req: any,
  ) {
    return this.applicationsService.reviewJuryApplication(
      applicationId,
      dto,
      req.user.id,
    );
  }

  @Patch('admin/organizer/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reviewOrganizerApplication(
    @Param('id') applicationId: string,
    @Body() dto: ReviewApplicationDto,
    @Req() req: any,
  ) {
    return this.applicationsService.reviewOrganizerApplication(
      applicationId,
      dto,
      req.user.id,
    );
  }
}
