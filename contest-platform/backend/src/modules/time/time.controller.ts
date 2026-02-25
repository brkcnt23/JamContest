import { Controller, Get } from '@nestjs/common';

@Controller('time')
export class TimeController {
  @Get()
  getServerTime() {
    return {
      serverTime: new Date().toISOString(),
      timezone: 'UTC',
      timestamp: Date.now(),
    };
  }
}
