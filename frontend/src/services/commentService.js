import api from './api';

export const commentService = {
  async getComments(articleId) {
    const response = await api.get(`/comments/article/${articleId}`);
    return response.data?.comments || [];
  },

  async addComment(articleId, content) {
    const response = await api.post(`/comments/article/${articleId}`, { content });
    return response.data?.comment || response.data;
  },

  async updateComment(commentId, content) {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data?.comment || response.data;
  },

  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  async toggleCommentLike(commentId) {
    const response = await api.post(`/comments/${commentId}/like`);
    return response.data;
  }
};

export default commentService;
