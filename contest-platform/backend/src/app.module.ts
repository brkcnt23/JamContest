import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContestsModule } from './modules/contests/contests.module';
import { MailModule } from './modules/mail/mail.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SocialModule } from './modules/social/social.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AppController } from './app.controller';
import { TimeController } from './modules/time/time.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ContestsModule,
    NotificationsModule,
    MessagesModule,
    SocialModule,
    UploadsModule,
  ],
  controllers: [AppController, TimeController],
  providers: [],
})
export class AppModule {}