import { IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyForJuryDto {
  @ApiProperty({ example: 'Oyun tasarımı konusunda 5 yıllık deneyimim var' })
  @IsString()
  motivation: string;
}

export class ApplyForOrganizerDto {
  @ApiProperty({ example: 'Daha önce 3 game jam düzenledim' })
  @IsString()
  motivation: string;
}

export class ReviewApplicationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ required: false, example: 'Deneyiminiz yeterli görüldü' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApplicationFilterDto {
  @ApiProperty({ required: false, enum: ['jury', 'organizer'] })
  @IsOptional()
  @IsIn(['jury', 'organizer'])
  type?: 'jury' | 'organizer';

  @ApiProperty({ required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
