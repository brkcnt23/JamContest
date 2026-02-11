import { Controller, Get, Put, Param, Body, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Put(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request
  ) {
    // Auth middleware ile req.user.id gelmeli
    if (!req.user || (req.user as any).id !== id) {
      throw new ForbiddenException('You can only edit your own profile');
    }
    return this.usersService.updateUserProfile(id, body);
  }
}
export {}
