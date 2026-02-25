import { Controller, Post, Get, Body, UseGuards, Req, Res, Put, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; username: string; displayName?: string }) {
    return this.authService.register(body.email, body.password, body.username, body.displayName);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(body.email, body.password, res, ip, userAgent);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.logoutAll(req.user.id, res);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: any) {
    return this.authService.getSessions(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Put('change-email')
  @UseGuards(JwtAuthGuard)
  async changeEmail(@Req() req: any, @Body() body: { currentPassword: string; newEmail: string }) {
    return this.authService.changeEmail(req.user.id, body.currentPassword, body.newEmail);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() req: any, @Body() body: { password: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.deleteAccount(req.user.id, body.password);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return result;
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Req() req: any, @Param('id') sessionId: string) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }
}