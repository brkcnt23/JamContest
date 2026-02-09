export interface CreateContestDto {
	title?: string;
	description?: string;
	applicationStart?: Date | string;
	applicationEnd?: Date | string;
	topicRevealAt?: Date | string;
	submissionEnd?: Date | string;
	requiresApproval?: boolean;
}
