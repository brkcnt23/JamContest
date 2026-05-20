import { Controller, Post, Get, Body, UseGuards, Req, Res, Put, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.username, dto.fullName);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Email doğrulama' })
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Doğrulama mailini tekrar gönder' })
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  @Post('login')
  @ApiOperation({ summary: 'Giriş yap' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(dto.email, dto.password, res, ip, userAgent);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Access token yenile' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Çıkış yap' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm cihazlardan çıkış yap' })
  async logoutAll(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.logoutAll(req.user.id, res);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Şifre sıfırlama maili gönder' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Şifre sıfırla' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktif oturumları listele' })
  async getSessions(@Req() req: any) {
    return this.authService.getSessions(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kendi profilini getir' })
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Şifre değiştir' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @Put('change-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Email değiştir' })
  async changeEmail(
    @Req() req: any,
    @Body() body: { currentPassword: string; newEmail: string },
  ) {
    return this.authService.changeEmail(req.user.id, body.currentPassword, body.newEmail);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hesabı sil' })
  async deleteAccount(
    @Req() req: any,
    @Body() body: { password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.deleteAccount(req.user.id, body.password);
    res.clearCookie('refreshToken', { path: '/' });
    return result;
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Belirli bir oturumu sonlandır' })
  async revokeSession(@Req() req: any, @Param('id') sessionId: string) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }
}
