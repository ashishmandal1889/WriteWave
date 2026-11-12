import api from './api';

export const likeService = {
  async toggleArticleLike(articleId) {
    const response = await api.post(`/likes/article/${articleId}`);
    return response.data;
  },

  async getArticleLikeStatus(articleId) {
    const response = await api.get(`/likes/article/${articleId}`);
    return response.data;
  }
};

export default likeService;
