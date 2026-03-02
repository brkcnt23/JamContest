export class SubmitReviewDto {
  score: number; // 0-100

  comment?: string;
}

export class GetJuryWorksFilterDto {
  status?: string; // SUBMITTED | DRAFT | REVIEWED

  limit?: number;

  offset?: number;
}
