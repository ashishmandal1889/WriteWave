import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import blogService from '../../services/blogService';
import FormInput from '../../components/FormInput/FormInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { validateBlogTitle, validateBlogContent, validateUrl } from '../../utils/validators';
import './CreateBlog.css';

export const CreateBlog = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    coverImageUrl: '',
    content: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const categories = ['Technology', 'Writing', 'Design', 'Productivity', 'Culture', 'Life', 'General'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error on change
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const createdBlog = await blogService.createBlog({
        title: formData.title.trim(),
        category: formData.category,
        coverImageUrl: formData.coverImageUrl.trim() || undefined,
        content: formData.content.trim()
      });

      const newId = createdBlog?.id || createdBlog?._id;
      if (newId) {
        navigate(`/blogs/${newId}`);
      } else {
        navigate('/my-blogs');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to reach backend API to publish blog. Please ensure your backend server is running.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;

  return (
    <div className="create-blog-page">
      <div className="container-narrow">
        {/* Navigation Breadcrumb / Cancel Header */}
        <div className="editor-top-bar">
          <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <span className="editor-mode-badge">New Story</span>
        </div>

        <div className="editor-card card">
          <div className="editor-card-header">
            <h1 className="editor-title">Create Blog Post</h1>
            <p className="editor-subtitle">
              Draft your thoughts, articulate ideas, and publish them to WriteWave readers.
            </p>
          </div>

          {apiError && (
            <ErrorMessage
              title="Publication Failed"
              message={apiError}
              onRetry={handleSubmit}
            />
          )}

          <form onSubmit={handleSubmit} noValidate className="blog-editor-form">
            {/* Title Input */}
            <FormInput
              id="title"
              name="title"
              label="Blog Title"
              placeholder="e.g. The Art of Mindful Software Architecture"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              helperText="Give your post a compelling title between 5 and 150 characters."
            />

            {/* Category Select */}
            <div className="form-field">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control form-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image URL Field (Optional) */}
            <FormInput
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.coverImageUrl}
              onChange={handleChange}
              error={errors.coverImageUrl}
              helperText="Provide a valid direct web image URL to display as your header image."
            />

            {/* Live Image Preview if valid URL is entered */}
            {formData.coverImageUrl && !errors.coverImageUrl && (
              <div className="cover-preview-wrapper">
                <span className="cover-preview-label">Image Preview:</span>
                <div className="cover-preview-box">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    className="cover-preview-img"
                  />
                </div>
              </div>
            )}

            {/* Content Editor */}
            <div className="form-field">
              <div className="form-label-row">
                <label htmlFor="content" className="form-label">
                  Blog Content <span className="required-indicator">*</span>
                </label>
                <span className="editor-word-count">{wordCount} words</span>
              </div>
              <textarea
                id="content"
                name="content"
                rows={12}
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your article content here. Share your ideas, steps, learnings, or stories..."
                className={`form-control form-textarea editor-textarea ${errors.content ? 'is-invalid' : ''}`}
                aria-invalid={Boolean(errors.content)}
              />
              {errors.content && (
                <div className="form-error-msg" role="alert">
                  <span>{errors.content}</span>
                </div>
              )}
            </div>

            {/* Form Action Buttons */}
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
                {isSubmitting ? 'Publishing...' : 'Publish Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
