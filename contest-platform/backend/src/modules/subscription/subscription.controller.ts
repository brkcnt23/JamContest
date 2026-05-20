import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Request() req: any) {
    return this.subscriptionService.getStatus(req.user.id);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Request() req: any) {
    return this.subscriptionService.cancel(req.user.id);
  }
}
