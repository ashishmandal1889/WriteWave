import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import publicationService from '../../services/publicationService';
import FormInput from '../../components/FormInput/FormInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './CreatePublication.css';

export const CreatePublication = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    about: '',
    category: 'Technology',
    logoUrl: '',
    coverImageUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const categories = [
    'Technology',
    'Culture',
    'Business',
    'Writing',
    'Design',
    'Science',
    'Finance',
    'Philosophy',
    'Life',
    'General'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Publication name is required.';
    if (formData.name.trim().length < 3) errs.name = 'Name must be at least 3 characters.';
    if (!formData.description.trim()) errs.description = 'Short description is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      const pub = await publicationService.createPublication({
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim(),
        about: formData.about.trim(),
        category: formData.category,
        logoUrl: formData.logoUrl.trim() || undefined,
        coverImageUrl: formData.coverImageUrl.trim() || undefined
      });
      navigate(`/publication/${pub.slug}`);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create publication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-pub-page">
      <div className="container-narrow">
        <div className="create-pub-card card">
          <header className="create-pub-header">
            <h1 className="create-pub-title headline-editorial">
              Create an Independent Publication
            </h1>
            <p className="create-pub-subtitle">
              Start your publication, publish serialized stories or newsletters, and grow your audience.
            </p>
          </header>

          {apiError && (
            <ErrorMessage
              title="Publication Creation Failed"
              message={apiError}
              onRetry={handleSubmit}
            />
          )}

          <form onSubmit={handleSubmit} noValidate className="create-pub-form">
            <FormInput
              id="name"
              name="name"
              label="Publication Name"
              placeholder="e.g. The Architecture Dispatch"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              helperText="The public title of your publication."
            />

            <FormInput
              id="slug"
              name="slug"
              label="Publication Web Address (Slug)"
              placeholder="e.g. architecture-dispatch"
              value={formData.slug}
              onChange={handleChange}
              helperText="Optional: Leave blank to auto-generate from the publication name."
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
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <FormInput
              id="description"
              name="description"
              label="Short Description"
              placeholder="A brief tagline or summary describing what subscribers will read."
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              required
              multiline
              rows={3}
            />

            <FormInput
              id="about"
              name="about"
              label="About Section (Optional)"
              placeholder="Describe your publication mission, background, and posting frequency in detail."
              value={formData.about}
              onChange={handleChange}
              multiline
              rows={5}
            />

            <FormInput
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              label="Cover Banner Image URL (Optional)"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.coverImageUrl}
              onChange={handleChange}
            />

            <div className="create-pub-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                {isSubmitting ? 'Creating...' : 'Launch Publication'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePublication;
