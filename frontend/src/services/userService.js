import api from './api';

export const userService = {
  async getWriterProfile(usernameOrId) {
    const response = await api.get(`/users/profile/${usernameOrId}`);
    return response.data?.writer || response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data?.user || response.data;
  },

  async toggleFollow(writerId) {
    const response = await api.post(`/users/${writerId}/follow`);
    return response.data;
  },

  async getRecommendedWriters() {
    const response = await api.get('/users/recommended');
    return response.data?.writers || [];
  }
};

export default userService;
