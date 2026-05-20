import { IsNumber, IsString, IsOptional, IsIn, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmitReviewDto {
  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ required: false, example: 'Oyun mekanikleri çok yaratıcı' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class GetJuryWorksFilterDto {
  @ApiProperty({ required: false, enum: ['SUBMITTED', 'DRAFT', 'REVIEWED'] })
  @IsOptional()
  @IsIn(['SUBMITTED', 'DRAFT', 'REVIEWED'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
