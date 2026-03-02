import { Module } from '@nestjs/common';
import { JuryService } from './jury.service';
import { JuryController } from './jury.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JuryController],
  providers: [JuryService],
  exports: [JuryService],
})
export class JuryModule {}
