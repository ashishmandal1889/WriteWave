import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import articleService from '../../services/articleService';
import publicationService from '../../services/publicationService';
import FormInput from '../../components/FormInput/FormInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loading from '../../components/Loading/Loading';
import './ArticleEditor.css';

export const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [publications, setPublications] = useState([]);
  const [loadingPubs, setLoadingPubs] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    coverImageUrl: '',
    publicationId: '',
    isPremium: false
  });

  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch publications owned by current user
  useEffect(() => {
    publicationService.getMyPublications()
      .then((pubs) => {
        setPublications(pubs);
        if (pubs.length > 0 && !formData.publicationId) {
          setFormData((prev) => ({ ...prev, publicationId: pubs[0]._id }));
        }
      })
      .finally(() => setLoadingPubs(false));
  }, []);

  // If editing an existing article, fetch its data
  useEffect(() => {
    if (id) {
      articleService.getArticleBySlugOrId(id)
        .then((article) => {
          if (article) {
            setFormData({
              title: article.title || '',
              subtitle: article.subtitle || '',
              content: article.content || '',
              coverImageUrl: article.coverImageUrl || '',
              publicationId: article.publication?._id || article.publication || '',
              isPremium: Boolean(article.isPremium)
            });
          }
        })
        .catch(() => {
          setApiError('Unable to load article for editing.');
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  // Plain-text rich editor insertion helpers
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('article-content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Article title is required.';
    if (!formData.content.trim()) errs.content = 'Article content cannot be empty.';
    if (!formData.publicationId) errs.publicationId = 'Please select a publication.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (status) => {
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    const payload = {
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      content: formData.content.trim(),
      coverImageUrl: formData.coverImageUrl.trim() || undefined,
      publicationId: formData.publicationId,
      isPremium: formData.isPremium,
      status
    };

    try {
      if (id) {
        await articleService.updateArticle(id, payload);
        navigate(status === 'published' ? `/article/${id}` : '/dashboard');
      } else {
        const created = await articleService.createArticle(payload);
        const articleSlug = created?.slug || created?._id;
        navigate(status === 'published' ? `/article/${articleSlug}` : '/dashboard');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPubs) {
    return (
      <div className="container-narrow" style={{ padding: '80px 0' }}>
        <Loading message="Checking your publications..." />
      </div>
    );
  }

  // If writer owns no publications yet, prompt to create one first
  if (publications.length === 0) {
    return (
      <div className="container-narrow" style={{ padding: '80px 0' }}>
        <div className="no-pub-notice card">
          <h2 className="headline-editorial">Create a publication first</h2>
          <p>
            On WriteWave, every article is published under an independent publication or newsletter. Launch your publication to begin writing articles.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/create-publication" className="btn btn-primary">
              Create Publication
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-editor-page">
      <div className="container-narrow">
        {/* Editor Top Navigation */}
        <div className="editor-top-nav">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <div className="editor-top-actions">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="btn btn-secondary btn-sm"
            >
              {isPreview ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={isSubmitting}
              className="btn btn-secondary btn-sm"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {apiError && (
          <ErrorMessage title="Editor Error" message={apiError} />
        )}

        {isPreview ? (
          /* Live Article Preview */
          <article className="editor-preview-card card">
            <div className="preview-label">Article Preview</div>
            <h1 className="preview-title headline-editorial">{formData.title || 'Untitled Article'}</h1>
            {formData.subtitle && <p className="preview-subtitle">{formData.subtitle}</p>}
            {formData.coverImageUrl && (
              <div className="preview-cover">
                <img src={formData.coverImageUrl} alt="Article cover" />
              </div>
            )}
            <div className="preview-content">
              {formData.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </article>
        ) : (
          /* Editor Form */
          <div className="editor-form-card card">
            <div className="editor-settings-row">
              <div className="form-field pub-selector-field">
                <label htmlFor="publicationId" className="form-label">Publication</label>
                <select
                  id="publicationId"
                  name="publicationId"
                  value={formData.publicationId}
                  onChange={handleChange}
                  className="form-control form-select"
                >
                  {publications.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="premium-toggle-wrapper">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleChange}
                  />
                  <span>Premium Article (Paid Subscribers)</span>
                </label>
              </div>
            </div>

            <FormInput
              id="title"
              name="title"
              label="Article Title"
              placeholder="Enter headline..."
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              className="editor-title-field"
            />

            <FormInput
              id="subtitle"
              name="subtitle"
              label="Subtitle (Optional)"
              placeholder="Add an engaging standfirst or brief overview..."
              value={formData.subtitle}
              onChange={handleChange}
            />

            <FormInput
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.coverImageUrl}
              onChange={handleChange}
            />

            {/* Plain-Text Formatting Toolbar */}
            <div className="editor-text-toolbar" aria-label="Text Formatting">
              <span className="toolbar-label">Format:</span>
              <button type="button" onClick={() => insertFormatting('## ', '\n')} className="toolbar-text-btn">
                Heading
              </button>
              <button type="button" onClick={() => insertFormatting('**', '**')} className="toolbar-text-btn">
                Bold
              </button>
              <button type="button" onClick={() => insertFormatting('*', '*')} className="toolbar-text-btn">
                Italic
              </button>
              <button type="button" onClick={() => insertFormatting('> ', '\n')} className="toolbar-text-btn">
                Quote
              </button>
              <button type="button" onClick={() => insertFormatting('- ', '\n')} className="toolbar-text-btn">
                List
              </button>
              <button type="button" onClick={() => insertFormatting('[Link Text](', ')')} className="toolbar-text-btn">
                Link
              </button>
            </div>

            <div className="form-field">
              <label htmlFor="article-content-textarea" className="form-label">
                Content <span className="required-indicator">*</span>
              </label>
              <textarea
                id="article-content-textarea"
                name="content"
                rows={16}
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your article here. Use paragraphs, quotes, and structured text..."
                className={`form-control form-textarea ${errors.content ? 'has-error' : ''}`}
                required
              />
              {errors.content && (
                <div className="form-error-msg" role="alert">
                  <span>{errors.content}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleEditor;
