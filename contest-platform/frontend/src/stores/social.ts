import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface Comment {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Like {
  count: number;
}

export const useSocialStore = defineStore('social', () => {
  // State
  const likedSubmissions = ref<Set<string>>(new Set());
  const followedUsers = ref<Set<string>>(new Set());
  const comments = ref<Map<string, Comment[]>>(new Map());
  const likes = ref<Map<string, number>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isLiked = computed(() => (submissionId: string) => likedSubmissions.value.has(submissionId));
  const isFollowing = computed(() => (userId: string) => followedUsers.value.has(userId));
  const getComments = computed(() => (submissionId: string) => comments.value.get(submissionId) || []);
  const getLikeCount = computed(() => (submissionId: string) => likes.value.get(submissionId) || 0);

  // Actions
  async function like(submissionId: string) {
    try {
      await axios.post(`/api/social/submissions/${submissionId}/like`);
      likedSubmissions.value.add(submissionId);
      const currentCount = likes.value.get(submissionId) || 0;
      likes.value.set(submissionId, currentCount + 1);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to like';
      throw err;
    }
  }

  async function unlike(submissionId: string) {
    try {
      await axios.delete(`/api/social/submissions/${submissionId}/like`);
      likedSubmissions.value.delete(submissionId);
      const currentCount = likes.value.get(submissionId) || 0;
      if (currentCount > 0) {
        likes.value.set(submissionId, currentCount - 1);
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to unlike';
      throw err;
    }
  }

  async function fetchLikes(submissionId: string) {
    try {
      const { data } = await axios.get(`/api/social/submissions/${submissionId}/likes`);
      likes.value.set(submissionId, data.count || 0);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch likes';
    }
  }

  async function fetchComments(submissionId: string) {
    try {
      const { data } = await axios.get(`/api/social/submissions/${submissionId}/comments`);
      comments.value.set(submissionId, data || []);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch comments';
    }
  }

  async function addComment(submissionId: string, content: string) {
    try {
      const { data } = await axios.post(`/api/social/submissions/${submissionId}/comments`, { content });
      const currentComments = comments.value.get(submissionId) || [];
      comments.value.set(submissionId, [...currentComments, data]);
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add comment';
      throw err;
    }
  }

  async function deleteComment(commentId: string, submissionId: string) {
    try {
      await axios.delete(`/api/social/comments/${commentId}`);
      const currentComments = comments.value.get(submissionId) || [];
      comments.value.set(
        submissionId,
        currentComments.filter((c) => c.id !== commentId)
      );
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete comment';
      throw err;
    }
  }

  async function follow(userId: string) {
    try {
      await axios.post(`/api/social/follow/${userId}`);
      followedUsers.value.add(userId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to follow';
      throw err;
    }
  }

  async function unfollow(userId: string) {
    try {
      await axios.delete(`/api/social/follow/${userId}`);
      followedUsers.value.delete(userId);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to unfollow';
      throw err;
    }
  }

  async function fetchFollowStatus(userId: string) {
    try {
      const { data } = await axios.get(`/api/social/followers/${userId}`);
      // This endpoint returns followers list, we'd need a different endpoint to check if we follow them
      // For now, assume it's handled by the component
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch follow status';
    }
  }

  return {
    // State
    likedSubmissions,
    followedUsers,
    comments,
    likes,
    loading,
    error,

    // Getters
    isLiked,
    isFollowing,
    getComments,
    getLikeCount,

    // Actions
    like,
    unlike,
    fetchLikes,
    fetchComments,
    addComment,
    deleteComment,
    follow,
    unfollow,
    fetchFollowStatus,
  };
});
