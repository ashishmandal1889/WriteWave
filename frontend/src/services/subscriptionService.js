import api from './api';

export const subscriptionService = {
  /**
   * Subscribe to a publication with email
   */
  async subscribe(publicationId, email) {
    const response = await api.post('/subscriptions', { publicationId, email });
    return response.data;
  },

  /**
   * Unsubscribe from a publication
   */
  async unsubscribe(publicationId, email) {
    const response = await api.post('/subscriptions/unsubscribe', { publicationId, email });
    return response.data;
  },

  /**
   * Get active subscriptions for current user
   */
  async getMySubscriptions() {
    const response = await api.get('/subscriptions/my');
    return response.data?.subscriptions || [];
  },

  /**
   * Get subscribers for a publication (author only)
   */
  async getPublicationSubscribers(publicationId) {
    const response = await api.get(`/subscriptions/publication/${publicationId}`);
    return response.data?.subscribers || [];
  }
};

export default subscriptionService;
