import api from './api';

export const blogService = {
  /**
   * Fetch latest published blogs (for homepage)
   * @param {number} limit
   */
  async getLatestBlogs(limit = 6) {
    const response = await api.get('/blogs/latest', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Fetch blogs with search and category filtering (for explore page)
   * @param {{ search?: string, category?: string, page?: number, limit?: number }} params
   */
  async getBlogs(params = {}) {
    const response = await api.get('/blogs', { params });
    return response.data;
  },

  /**
   * Fetch a single blog by ID with author and comments
   * @param {string|number} id
   */
  async getBlogById(id) {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  /**
   * Fetch blogs published by the currently authenticated user
   */
  async getMyBlogs() {
    const response = await api.get('/blogs/my-blogs');
    return response.data;
  },

  /**
   * Publish a new blog post
   * @param {{ title: string, content: string, coverImageUrl?: string, category?: string }} blogData
   */
  async createBlog(blogData) {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  /**
   * Update an existing blog post
   * @param {string|number} id
   * @param {{ title: string, content: string, coverImageUrl?: string, category?: string }} blogData
   */
  async updateBlog(id, blogData) {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  /**
   * Delete a blog post by ID
   * @param {string|number} id
   */
  async deleteBlog(id) {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  /**
   * Fetch available blog categories from backend
   */
  async getCategories() {
    const response = await api.get('/blogs/categories');
    return response.data;
  },

  /**
   * Post a new comment on a blog
   * @param {string|number} blogId
   * @param {{ comment: string }} commentData
   */
  async addComment(blogId, commentData) {
    const response = await api.post(`/blogs/${blogId}/comments`, commentData);
    return response.data;
  }
};

export default blogService;
