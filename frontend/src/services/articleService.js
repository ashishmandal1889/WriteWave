import api from './api';

export const articleService = {
  /**
   * Fetch published articles with search and filtering
   */
  async getArticles(params = {}) {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  /**
   * Fetch a single article by slug or ID
   */
  async getArticleBySlugOrId(slugOrId) {
    const response = await api.get(`/articles/${slugOrId}`);
    return response.data?.article || response.data;
  },

  /**
   * Create an article or draft
   */
  async createArticle(articleData) {
    const response = await api.post('/articles', articleData);
    return response.data?.article || response.data;
  },

  /**
   * Update an existing article
   */
  async updateArticle(id, articleData) {
    const response = await api.put(`/articles/${id}`, articleData);
    return response.data?.article || response.data;
  },

  /**
   * Delete an article
   */
  async deleteArticle(id) {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  },

  /**
   * Fetch writer's drafts
   */
  async getMyDrafts() {
    const response = await api.get('/articles/drafts');
    return response.data?.drafts || [];
  },

  /**
   * Fetch writer's articles
   */
  async getMyArticles() {
    const response = await api.get('/articles/my');
    return response.data?.articles || [];
  }
};

export default articleService;
