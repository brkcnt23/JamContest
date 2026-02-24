
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (e) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }

  @Get('time')
  getServerTime() {
    return {
      serverTime: new Date().toISOString(),
      timezone: 'UTC',
      timestamp: Date.now(),
    };
  }
}