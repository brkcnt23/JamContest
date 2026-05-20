import { IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class ApplyForJuryDto {
  @IsString()
  motivation: string;
}

export class ApplyForOrganizerDto {
  @IsString()
  motivation: string;
}

export class ReviewApplicationDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ApplicationFilterDto {
  @IsOptional()
  @IsIn(['jury', 'organizer'])
  type?: 'jury' | 'organizer';

  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
