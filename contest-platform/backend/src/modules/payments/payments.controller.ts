import { Controller, Post, Get, UseGuards, Body, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Body() body: { planId: string }, @Request() req: any) {
    return this.paymentsService.checkout(req.user.id, body.planId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Request() req: any,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.paymentsService.getHistory(
      req.user.id,
      Math.min(Number(take) || 20, 50),
      Math.max(Number(skip) || 0, 0),
    );
  }
}
