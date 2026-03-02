export class ApplyForJuryDto {
  motivation: string;
}

export class ApplyForOrganizerDto {
  motivation: string;
}

export class ReviewApplicationDto {
  approved: boolean;
  reason?: string;
}

export class ApplicationFilterDto {
  type?: 'jury' | 'organizer'; // Filter by application type
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'; // Filter by status
}
