import api from './api';

export const publicationService = {
  /**
   * Get publications with search, category, or featured filters
   */
  async getPublications(params = {}) {
    const response = await api.get('/publications', { params });
    return response.data;
  },

  /**
   * Get single publication by slug or ID with author & articles
   */
  async getPublicationBySlug(slugOrId) {
    const response = await api.get(`/publications/${slugOrId}`);
    return response.data?.publication || response.data;
  },

  /**
   * Get publications owned by current user
   */
  async getMyPublications() {
    const response = await api.get('/publications/my');
    return response.data?.publications || [];
  },

  /**
   * Create a publication
   */
  async createPublication(publicationData) {
    const response = await api.post('/publications', publicationData);
    return response.data?.publication || response.data;
  },

  /**
   * Update a publication
   */
  async updatePublication(id, publicationData) {
    const response = await api.put(`/publications/${id}`, publicationData);
    return response.data?.publication || response.data;
  },

  /**
   * Delete a publication
   */
  async deletePublication(id) {
    const response = await api.delete(`/publications/${id}`);
    return response.data;
  },

  /**
   * Get available publication categories
   */
  async getCategories() {
    const response = await api.get('/publications/categories');
    return response.data?.categories || [];
  }
};

export default publicationService;
