import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContestsModule } from './modules/contests/contests.module';
import { MailModule } from './modules/mail/mail.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SocialModule } from './modules/social/social.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { JuryModule } from './modules/jury/jury.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BadgesModule } from './modules/badges/badges.module';
import { AppController } from './app.controller';
import { TimeController } from './modules/time/time.controller';
import { HealthController } from './modules/logging/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ContestsModule,
    NotificationsModule,
    MessagesModule,
    SocialModule,
    UploadsModule,
    ApplicationsModule,
    JuryModule,
    PaymentsModule,
    SubscriptionModule,
    JobsModule,
    ProjectsModule,
    BadgesModule,
  ],
  controllers: [AppController, TimeController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
