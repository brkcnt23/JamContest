export interface Comment {
  id: string;
  content: string;
  userId: string;
  submissionId: string;
  createdAt: string | Date;
  user?: {
    id: string;
    username: string;
    avatar?: string;
    displayName?: string;
  };
}

export interface Like {
  id: string;
  userId: string;
  submissionId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}
