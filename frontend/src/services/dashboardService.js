import api from './api';

export const dashboardService = {
  async getDashboardOverview() {
    const response = await api.get('/dashboard/overview');
    return response.data;
  }
};

export default dashboardService;
