import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { JuryService } from './jury.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitReviewDto } from './dto/jury-review.dto';

@Controller('jury')
@UseGuards(JwtAuthGuard)
export class JuryController {
  constructor(private juryService: JuryService) {}

  @Get('works')
  async getAssignedWorks(@Req() req: any) {
    return this.juryService.getAssignedWorks(req.user.id);
  }

  @Get('works/:id')
  async getWork(@Param('id') id: string, @Req() req: any) {
    return this.juryService.getWorkToReview(id, req.user.id);
  }

  @Post('works/:id/submit-review')
  @HttpCode(200)
  async submitReview(
    @Param('id') id: string,
    @Body() dto: SubmitReviewDto,
    @Req() req: any,
  ) {
    return this.juryService.submitReview(id, req.user.id, dto);
  }

  @Get('submissions/:submissionId/scores')
  async getAggregatedScores(@Param('submissionId') submissionId: string) {
    return this.juryService.getAggregatedScores(submissionId);
  }
}
