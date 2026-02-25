import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SocialController } from './social.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SocialController],
  providers: [],
})
export class SocialModule {}
