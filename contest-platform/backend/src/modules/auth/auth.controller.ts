import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
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
}