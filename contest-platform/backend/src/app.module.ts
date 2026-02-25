import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContestsModule } from './modules/contests/contests.module';
import { MailModule } from './modules/mail/mail.module';
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
  ],
  controllers: [AppController, TimeController],
  providers: [],
})
export class AppModule {}