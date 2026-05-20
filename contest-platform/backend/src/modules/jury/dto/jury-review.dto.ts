import { IsNumber, IsString, IsOptional, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitReviewDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class GetJuryWorksFilterDto {
  @IsOptional()
  @IsIn(['SUBMITTED', 'DRAFT', 'REVIEWED'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
