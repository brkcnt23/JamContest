import {
  Controller, Get, Put, Post, Delete, Param, Body, Query,
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

  // GET /api/users/me/submissions — Benim gonderimleim
  @Get('me/submissions')
  @UseGuards(JwtAuthGuard)
  async getMySubmissions(@Req() req: any) {
    return this.usersService.getMySubmissions(req.user.id);
  }

  // GET /api/users/me/favorites — Favori yarışmalarım
  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  async getMyFavorites(@Req() req: any) {
    return this.usersService.getMyFavorites(req.user.id);
  }

  // POST /api/users/me/favorites/:contestId — Favori ekle
  @Post('me/favorites/:contestId')
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Req() req: any, @Param('contestId') contestId: string) {
    return this.usersService.addFavorite(req.user.id, contestId);
  }

  // DELETE /api/users/me/favorites/:contestId — Favoriden çıkar
  @Delete('me/favorites/:contestId')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Req() req: any, @Param('contestId') contestId: string) {
    return this.usersService.removeFavorite(req.user.id, contestId);
  }

  // GET /api/users/me/favorites/:contestId/check — Favori mi kontrol et
  @Get('me/favorites/:contestId/check')
  @UseGuards(JwtAuthGuard)
  async checkFavorite(@Req() req: any, @Param('contestId') contestId: string) {
    return this.usersService.checkFavorite(req.user.id, contestId);
  }

  // GET /api/users/me/jury-scores — Benim jüri puanlarım
  @Get('me/jury-scores')
  @UseGuards(JwtAuthGuard)
  async getMyJuryScores(@Req() req: any) {
    return this.usersService.getMyJuryScores(req.user.id);
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

  // ==========================================
  // BAN SİSTEMİ (SUPER_ADMIN only)
  // ==========================================

  // POST /api/users/:id/ban
  @Post(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async banUser(
    @Param('id') id: string,
    @Body() body: { reason: string; restrictions: string[] },
    @Req() req: any,
  ) {
    return this.usersService.banUser(id, body.reason, body.restrictions, req.user.id);
  }

  // DELETE /api/users/:id/ban/:banId
  @Delete(':id/ban/:banId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async removeBan(@Param('id') id: string, @Param('banId') banId: string) {
    return this.usersService.removeBan(banId);
  }

  // GET /api/users/:id/bans
  @Get(':id/bans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getUserBans(@Param('id') id: string) {
    return this.usersService.getUserBans(id);
  }

  // GET /api/users/bans/active (SUPER_ADMIN)
  @Get('bans/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getActiveBans() {
    return this.usersService.getActiveBans();
  }

  // ==========================================
  // JURY DAVT DAVETLERİ
  // ==========================================

  // GET /api/jury-invitations/my
  @Get('jury-invitations/my')
  @UseGuards(JwtAuthGuard)
  async getMyJuryInvitations(@Req() req: any) {
    // Note: Bu endpoint contests.service.ts'de getMyJuryInvitations metodunda gerçekleşir
    // Users controller'dan erişilebilmesi için contests controller'ında da olabilir
    return { message: 'Use GET /api/contests/jury-invitations/my instead' };
  }
}