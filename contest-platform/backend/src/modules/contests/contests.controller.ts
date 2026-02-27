import {
  Controller, Get, Post, Put, Delete, Param, Body,
  Query, Req, UseGuards,
} from '@nestjs/common';
import { ContestsService } from './contests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('contests')
export class ContestsController {
  constructor(private contestsService: ContestsService) {}

  // ==========================================
  // YARIŞMA CRUD
  // ==========================================

  // POST /api/contests — Yarışma oluştur (login gerekli)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    return this.contestsService.create(body, req.user.id);
  }

  // GET /api/contests — Yarışma listesi
  @Get()
  async findAll(@Query('status') status?: string) {
    return this.contestsService.findAll(status);
  }

  // GET /api/contests/pending — Admin: onay bekleyenler
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getPending() {
    return this.contestsService.getPendingContests();
  }

  // GET /api/contests/jury-invitations/my — Kendi davetlerim
  @Get('jury-invitations/my')
  @UseGuards(JwtAuthGuard)
  async getMyJuryInvitations(@Req() req: any) {
    return this.contestsService.getMyJuryInvitations(req.user.id);
  }

  // GET /api/contests/my-jury-contests — Jüri olarak atandığım yarışmalar
  @Get('my-jury-contests')
  @UseGuards(JwtAuthGuard)
  async getMyJuryContests(@Req() req: any) {
    return this.contestsService.getMyJuryContests(req.user.id);
  }

  // GET /api/contests/admin/edit-requests — Admin: pending edit requests
  @Get('admin/edit-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getPendingEditRequests() {
    return this.contestsService.getPendingEditRequests();
  }

  // GET /api/contests/admin/cancel-requests — Admin: pending cancel requests
  @Get('admin/cancel-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getPendingCancelRequests() {
    return this.contestsService.getPendingCancelRequests();
  }

  // ==========================================
  // PARAMETRE ROUTES (SPECIFIC → CATCH-ALL)
  // ==========================================

  // PUT /api/contests/:id/approve
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.contestsService.approveContest(id, req.user.id, body.note);
  }

  // PUT /api/contests/:id/reject
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async reject(@Param('id') id: string, @Body() body: { note: string }, @Req() req: any) {
    return this.contestsService.rejectContest(id, req.user.id, body.note);
  }

  // PUT /api/contests/:id/status
  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.contestsService.updateStatus(id, body.status, req.user.id);
  }

  // GET /api/contests/:id/members
  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.contestsService.getMembers(id);
  }

  // POST /api/contests/:id/members — Üye ekle
  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  async addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role: string },
    @Req() req: any,
  ) {
    return this.contestsService.addMember(id, body.userId, body.role, req.user.id);
  }

  // DELETE /api/contests/:id/members/:userId/:role — Üye çıkar
  @Delete(':id/members/:userId/:role')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('role') role: string,
    @Req() req: any,
  ) {
    return this.contestsService.removeMember(id, userId, role, req.user.id);
  }

  // POST /api/contests/:id/apply — Başvur
  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  async apply(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.contestsService.apply(id, req.user.id, body.message);
  }

  // GET /api/contests/:id/applications — Başvuru listesi (organizatör)
  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  async getApplications(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.getApplications(id, req.user.id);
  }

  // PUT /api/contests/:id/applications/:appId/approve
  @Put(':id/applications/:appId/approve')
  @UseGuards(JwtAuthGuard)
  async approveApplication(@Param('appId') appId: string, @Req() req: any) {
    return this.contestsService.approveApplication(appId, req.user.id);
  }

  // PUT /api/contests/:id/applications/:appId/reject
  @Put(':id/applications/:appId/reject')
  @UseGuards(JwtAuthGuard)
  async rejectApplication(@Param('appId') appId: string, @Req() req: any) {
    return this.contestsService.rejectApplication(appId, req.user.id);
  }

  // POST /api/contests/:id/submit
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submitWork(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.contestsService.submitWork(id, req.user.id, body);
  }

  // GET /api/contests/:id/submissions — Gönderimler (org/jüri)
  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard)
  async getSubmissions(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.getSubmissions(id, req.user.id);
  }

  // GET /api/contests/:id/jury/queue — Oylanacak eserler
  @Get(':id/jury/queue')
  @UseGuards(JwtAuthGuard)
  async getJuryQueue(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.getJuryQueue(id, req.user.id);
  }

  // POST /api/contests/:id/jury/score — Oy ver
  @Post(':id/jury/score')
  @UseGuards(JwtAuthGuard)
  async submitScore(
    @Param('id') id: string,
    @Body() body: { submissionId: string; score: number; comment?: string },
    @Req() req: any,
  ) {
    return this.contestsService.submitScore(id, req.user.id, body.submissionId, body.score, body.comment);
  }

  // GET /api/contests/:id/jury/my-scores — Jürinin verdiği oylar
  @Get(':id/jury/my-scores')
  @UseGuards(JwtAuthGuard)
  async getMyScores(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.getJuryScores(id, req.user.id);
  }

  // POST /api/contests/:id/finalize — Sonuçları hesapla (org)
  @Post(':id/finalize')
  @UseGuards(JwtAuthGuard)
  async finalize(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.finalize(id, req.user.id);
  }

  // GET /api/contests/:id/results — Herkese açık sonuçlar
  @Get(':id/results')
  async getResults(@Param('id') id: string) {
    return this.contestsService.getResults(id);
  }

  // GET /api/contests/:id/scores/detailed — Sadece SUPER_ADMIN
  @Get(':id/scores/detailed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getDetailedScores(@Param('id') id: string) {
    return this.contestsService.getDetailedScores(id);
  }

  // GET /api/contests/:id/my-application — Kendi başvuruyu getir
  @Get(':id/my-application')
  @UseGuards(JwtAuthGuard)
  async getMyApplication(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.getMyApplication(id, req.user.id);
  }

  // PUT /api/contests/:id — Yarışma güncelle
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.contestsService.update(id, body, req.user.id);
  }

  // ==========================================
  // JURY DAVET SİSTEMİ
  // ==========================================

  // POST /api/contests/:id/jury/invite
  @Post(':id/jury/invite')
  @UseGuards(JwtAuthGuard)
  async inviteJury(
    @Param('id') id: string,
    @Body() body: { username: string },
    @Req() req: any,
  ) {
    return this.contestsService.inviteJury(id, body.username, req.user.id);
  }

  // GET /api/contests/:id/jury/invitations
  @Get(':id/jury/invitations')
  @UseGuards(JwtAuthGuard)
  async getContestInvitations(@Param('id') id: string) {
    return this.contestsService.getContestInvitations(id);
  }

  // PUT /api/jury-invitations/:invitationId/accept
  @Put('jury-invitations/:invitationId/accept')
  @UseGuards(JwtAuthGuard)
  async acceptJuryInvitation(@Param('invitationId') invitationId: string, @Req() req: any) {
    return this.contestsService.acceptJuryInvitation(invitationId, req.user.id);
  }

  // PUT /api/jury-invitations/:invitationId/reject
  @Put('jury-invitations/:invitationId/reject')
  @UseGuards(JwtAuthGuard)
  async rejectJuryInvitation(@Param('invitationId') invitationId: string, @Req() req: any) {
    return this.contestsService.rejectJuryInvitation(invitationId, req.user.id);
  }

  // DELETE /api/contests/:id/jury/invite/:invitationId
  @Delete(':id/jury/invite/:invitationId')
  @UseGuards(JwtAuthGuard)
  async cancelJuryInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @Req() req: any,
  ) {
    return this.contestsService.cancelJuryInvitation(invitationId, req.user.id);
  }

  // ==========================================
  // ONAYA GÖNDER
  // ==========================================

  // POST /api/contests/:id/submit-for-review
  @Post(':id/submit-for-review')
  @UseGuards(JwtAuthGuard)
  async submitForReview(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.submitForReview(id, req.user.id);
  }

  // ==========================================
  // DÜZENLEME TALEPLERİ
  // ==========================================

  // POST /api/contests/:id/edit-request
  @Post(':id/edit-request')
  @UseGuards(JwtAuthGuard)
  async createEditRequest(
    @Param('id') id: string,
    @Body() body: { changes: object; reason: string },
    @Req() req: any,
  ) {
    return this.contestsService.createEditRequest(id, body.changes, body.reason, req.user.id);
  }

  // PUT /api/contests/:id/edit-request/:reqId/approve
  @Put(':id/edit-request/:reqId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async approveEditRequest(
    @Param('id') id: string,
    @Param('reqId') reqId: string,
    @Req() req: any,
  ) {
    return this.contestsService.approveEditRequest(reqId, req.user.id);
  }

  // PUT /api/contests/:id/edit-request/:reqId/reject
  @Put(':id/edit-request/:reqId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async rejectEditRequest(
    @Param('id') id: string,
    @Param('reqId') reqId: string,
    @Body() body: { adminNote: string },
    @Req() req: any,
  ) {
    return this.contestsService.rejectEditRequest(reqId, body.adminNote);
  }

  // ==========================================
  // İPTAL TALEPLERİ
  // ==========================================

  // POST /api/contests/:id/cancel-request
  @Post(':id/cancel-request')
  @UseGuards(JwtAuthGuard)
  async createCancelRequest(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ) {
    return this.contestsService.createCancelRequest(id, body.reason, req.user.id);
  }

  // PUT /api/contests/:id/cancel-request/approve
  @Put(':id/cancel-request/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async approveCancelRequest(@Param('id') id: string, @Req() req: any) {
    return this.contestsService.approveCancelRequest(id, req.user.id);
  }

  // PUT /api/contests/:id/cancel-request/reject
  @Put(':id/cancel-request/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async rejectCancelRequest(
    @Param('id') id: string,
    @Body() body: { adminNote: string },
    @Req() req: any,
  ) {
    return this.contestsService.rejectCancelRequest(id, body.adminNote);
  }

  // ==========================================
  // JURY SKORU ARŞİVLEME
  // ==========================================

  // DELETE /api/jury-scores/:scoreId
  @Delete('jury-scores/:scoreId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async archiveJuryScore(@Param('scoreId') scoreId: string, @Req() req: any) {
    return this.contestsService.archiveJuryScore(scoreId, req.user.id);
  }

  // GET /api/contests/:id/jury/scores — Tüm skorlar (admin)
  @Get(':id/jury/scores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getContestScores(@Param('id') id: string, @Query('archived') archived?: string) {
    return this.contestsService.getContestScores(id, archived === 'true');
  }

  // GET /api/contests/:slug — Yarışma detay (slug ile) — MUST BE LAST!
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.contestsService.findBySlug(slug);
  }
}