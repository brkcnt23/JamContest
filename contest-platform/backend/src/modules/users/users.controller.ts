import {
  Controller, Get, Put, Param, Body, Query,
  Req, ForbiddenException, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /api/users — Admin: tüm kullanıcılar
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // GET /api/users/search?q=xxx — Kullanıcı arama (jüri/org seçimi)
  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query || '');
  }

  // GET /api/users/:id/profile — Profil görüntüle
  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  // PUT /api/users/:id/profile — Profil güncelle
  @Put(':id/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only edit your own profile');
    }
    return this.usersService.updateUserProfile(id, body);
  }

  // PUT /api/users/:id/role — Global rol değiştir
  @Put(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { globalRole: string },
    @Req() req: any,
  ) {
    return this.usersService.updateGlobalRole(id, body.globalRole, {
      id: req.user.id,
      globalRole: req.user.globalRole,
    });
  }
}