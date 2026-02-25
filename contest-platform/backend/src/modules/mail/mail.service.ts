import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { LOGO_BASE64 } from './logo.constant';

@Injectable()
export class MailService {

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });

  async sendVerificationEmail(email: string, username: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'JamContest — Email Adresinizi Doğrulayın',
      html: this.verificationTemplate(username, url),
    });
  }

  async sendPasswordResetEmail(email: string, username: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'JamContest — Şifre Sıfırlama',
      html: this.passwordResetTemplate(username, url),
    });
  }

  async sendJuryInvitationEmail(email: string, username: string, contestTitle: string, inviterName: string) {
    const url = `${process.env.FRONTEND_URL}/jury-invitations`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `JamContest — ${contestTitle} için Jüri Daveti`,
      html: this.juryInvitationTemplate(username, contestTitle, inviterName, url),
    });
  }

  private verificationTemplate(username: string, url: string) {
    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f0f0f;font-family:system-ui,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
          <img src="${LOGO_BASE64}" style="max-height:130px;width:auto;display:block;margin:0 auto 20px;"/>
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;">JamContest</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#f1f1f1;margin-top:0;font-size:20px;">Merhaba, ${username}!</h2>
          <p style="color:#a1a1a1;line-height:1.8;font-size:16px;">Hesabını aktifleştirmek için aşağıdaki butona tıkla. Link 24 saat geçerlidir.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="background:#7c3aed;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">✉️ Email Adresimi Doğrula</a>
          </div>
          <p style="color:#666;font-size:13px;line-height:1.6;">Butona tıklayamıyorsan bu linki kopyala:<br/><a href="${url}" style="color:#7c3aed;word-break:break-all;">${url}</a></p>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #2a2a2a;text-align:center;">
          <p style="color:#555;font-size:12px;margin:0;">© 2026 JamContest · noreply@jamcontest.com</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private passwordResetTemplate(username: string, url: string) {
    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f0f0f;font-family:system-ui,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
          <img src="${LOGO_BASE64}" style="max-height:130px;width:auto;display:block;margin:0 auto 20px;"/>
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;">JamContest</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#f1f1f1;margin-top:0;font-size:20px;">Şifre Sıfırlama</h2>
          <p style="color:#a1a1a1;line-height:1.8;font-size:16px;">Merhaba ${username}, şifre sıfırlama talebinde bulundun. Aşağıdaki butona tıkla. Link 1 saat geçerlidir.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="background:#7c3aed;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">🔑 Şifremi Sıfırla</a>
          </div>
          <p style="color:#666;font-size:13px;">Bu isteği sen yapmadıysan bu maili dikkate alma.</p>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #2a2a2a;text-align:center;">
          <p style="color:#555;font-size:12px;margin:0;">© 2026 JamContest · noreply@jamcontest.com</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private juryInvitationTemplate(username: string, contestTitle: string, inviterName: string, url: string) {
    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f0f0f;font-family:system-ui,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
          <img src="${LOGO_BASE64}" style="max-height:130px;width:auto;display:block;margin:0 auto 20px;"/>
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;">JamContest</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#f1f1f1;margin-top:0;font-size:20px;">Jüri Daveti 🏆</h2>
          <p style="color:#a1a1a1;line-height:1.8;font-size:16px;">Merhaba <strong style="color:#f1f1f1;">${username}</strong>,</p>
          <p style="color:#a1a1a1;line-height:1.8;font-size:16px;"><strong style="color:#f1f1f1;">${inviterName}</strong> seni <strong style="color:#7c3aed;">${contestTitle}</strong> yarışması için jüri üyesi olarak davet etti!</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="background:#7c3aed;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">⚖️ Daveti Görüntüle</a>
          </div>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #2a2a2a;text-align:center;">
          <p style="color:#555;font-size:12px;margin:0;">© 2026 JamContest · noreply@jamcontest.com</p>
        </div>
      </div>
    </body>
    </html>`;
  }
}
