import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../../services/blogService';
import FormInput from '../../components/FormInput/FormInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import { validateBlogTitle, validateBlogContent, validateUrl } from '../../utils/validators';
import './EditBlog.css';

export const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    coverImageUrl: '',
    content: ''
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const categories = ['Technology', 'Writing', 'Design', 'Productivity', 'Culture', 'Life', 'General'];

  useEffect(() => {
    const fetchBlogData = async () => {
      setInitialLoading(true);
      try {
        const blog = await blogService.getBlogById(id);
        if (blog) {
          setFormData({
            title: blog.title || '',
            category: blog.category || 'Technology',
            coverImageUrl: blog.coverImageUrl || '',
            content: blog.content || ''
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBlogData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const titleError = validateBlogTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const contentError = validateBlogContent(formData.content);
    if (contentError) newErrors.content = contentError;

    if (formData.coverImageUrl) {
      const urlError = validateUrl(formData.coverImageUrl);
      if (urlError) newErrors.coverImageUrl = urlError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await blogService.updateBlog(id, {
        title: formData.title.trim(),
        category: formData.category,
        coverImageUrl: formData.coverImageUrl.trim() || undefined,
        content: formData.content.trim()
      });
      navigate(`/blogs/${id}`);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to save changes. Please ensure your backend server is running.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (initialLoading) {
    return (
      <div className="container-narrow" style={{ padding: '60px 0' }}>
        <Loading message="Loading blog details for editing..." size="lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container-narrow" style={{ padding: '60px 0' }}>
        <EmptyState
          title="Blog post not found"
          description="The blog post you are trying to edit could not be found or loaded from the backend."
          actionText="Return to Dashboard"
          actionLink="/my-blogs"
        />
      </div>
    );
  }

  return (
    <div className="create-blog-page">
      <div className="container-narrow">
        <div className="editor-top-bar">
          <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <span className="editor-mode-badge">Edit Mode</span>
        </div>

        <div className="editor-card card">
          <div className="editor-card-header">
            <h1 className="editor-title">Edit Blog Post</h1>
            <p className="editor-subtitle">Update and refine your published thoughts.</p>
          </div>

          {apiError && (
            <ErrorMessage
              title="Update Failed"
              message={apiError}
              onRetry={handleSubmit}
            />
          )}

          <form onSubmit={handleSubmit} noValidate className="blog-editor-form">
            <FormInput
              id="title"
              name="title"
              label="Blog Title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            <div className="form-field">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control form-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <FormInput
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              label="Cover Image URL (Optional)"
              value={formData.coverImageUrl}
              onChange={handleChange}
              error={errors.coverImageUrl}
            />

            <div className="form-field">
              <div className="form-label-row">
                <label htmlFor="content" className="form-label">
                  Blog Content <span className="required-indicator">*</span>
                </label>
              </div>
              <textarea
                id="content"
                name="content"
                rows={12}
                value={formData.content}
                onChange={handleChange}
                className={`form-control form-textarea editor-textarea ${errors.content ? 'is-invalid' : ''}`}
              />
              {errors.content && (
                <div className="form-error-msg" role="alert">
                  <span>{errors.content}</span>
                </div>
              )}
            </div>

            <div className="editor-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary btn-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
