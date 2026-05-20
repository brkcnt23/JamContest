import { IsString, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @Type(() => Date)
  @IsDate()
  applicationStart: Date;

  @Type(() => Date)
  @IsDate()
  applicationEnd: Date;

  @Type(() => Date)
  @IsDate()
  topicRevealAt: Date;

  @Type(() => Date)
  @IsDate()
  submissionEnd: Date;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}
