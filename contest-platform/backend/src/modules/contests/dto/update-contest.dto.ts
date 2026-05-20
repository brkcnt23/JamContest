import { IsString, IsOptional } from 'class-validator';

export class UpdateContestDto {
  @IsOptional()
  @IsString()
  title?: string;
}
