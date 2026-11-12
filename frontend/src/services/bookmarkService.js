import api from './api';

export const bookmarkService = {
  async toggleBookmark(articleId) {
    const response = await api.post(`/bookmarks/${articleId}`);
    return response.data;
  },

  async getMyBookmarks() {
    const response = await api.get('/bookmarks/my');
    return response.data?.bookmarks || [];
  }
};

export default bookmarkService;
