import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import articleService from '../../services/articleService';
import publicationService from '../../services/publicationService';
import userService from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import FormInput from '../../components/FormInput/FormInput';
import './WriterDashboard.css';

export const WriterDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Overview Data
  const [overviewData, setOverviewData] = useState(null);

  // Articles & Drafts
  const [articles, setArticles] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [articlesFilter, setArticlesFilter] = useState('all'); // 'all' | 'published' | 'drafts'
  const [deletingArticleId, setDeletingArticleId] = useState(null);

  // Publications
  const [publications, setPublications] = useState([]);

  // Settings State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || ''
  });
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardOverview();
      setOverviewData(data);

      // Load all articles & drafts
      const [userArticles, userDrafts, userPubs] = await Promise.all([
        articleService.getMyArticles().catch(() => []),
        articleService.getMyDrafts().catch(() => []),
        publicationService.getMyPublications().catch(() => [])
      ]);

      setArticles(userArticles);
      setDrafts(userDrafts);
      setPublications(userPubs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Delete an article
  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    setDeletingArticleId(articleId);
    try {
      await articleService.deleteArticle(articleId);
      setArticles((prev) => prev.filter((a) => (a._id || a.id) !== articleId));
      setDrafts((prev) => prev.filter((d) => (d._id || d.id) !== articleId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete article.');
    } finally {
      setDeletingArticleId(null);
    }
  };

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      await userService.updateProfile(profileForm);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loading message="Loading dashboard metrics..." size="lg" />
      </div>
    );
  }

  const metrics = overviewData?.metrics || {
    publicationsCount: 0,
    publishedArticlesCount: 0,
    draftsCount: 0,
    totalSubscribers: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  };

  const allDisplayItems = articlesFilter === 'drafts'
    ? drafts
    : articlesFilter === 'published'
      ? articles
      : [...articles, ...drafts];

  return (
    <div className="dashboard-page">
      {/* Top Banner */}
      <section className="dashboard-header-section">
        <div className="container">
          <div className="dashboard-header-inner">
            <div className="dashboard-header-title-box">
              <h1 className="dashboard-heading headline-editorial">Writer Dashboard</h1>
              <p className="dashboard-subheading">
                Monitor real-time audience metrics, manage publications, and draft articles.
              </p>
            </div>
            <div className="dashboard-header-actions">
              <Link to="/write" className="btn btn-primary">
                Start Writing
              </Link>
              <Link to="/create-publication" className="btn btn-secondary">
                Launch Publication
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="dashboard-tabs-section">
        <div className="container">
          <div className="dashboard-tabs-bar">
            <button
              type="button"
              onClick={() => handleTabChange('overview')}
              className={`dashboard-tab-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('articles')}
              className={`dashboard-tab-btn ${activeTab === 'articles' ? 'is-active' : ''}`}
            >
              Stories ({articles.length + drafts.length})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('publications')}
              className={`dashboard-tab-btn ${activeTab === 'publications' ? 'is-active' : ''}`}
            >
              Publications ({publications.length})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('settings')}
              className={`dashboard-tab-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
            >
              Profile Settings
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Body Content */}
      <main className="dashboard-body-section">
        <div className="container">
          {error && <ErrorMessage message={error} onRetry={loadDashboard} />}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="overview-tab-content">
              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card card">
                  <span className="metric-label">Subscribers</span>
                  <span className="metric-value">{metrics.totalSubscribers}</span>
                  <span className="metric-subtext">Active readers</span>
                </div>
                <div className="metric-card card">
                  <span className="metric-label">Article Views</span>
                  <span className="metric-value">{metrics.totalViews}</span>
                  <span className="metric-subtext">Total reads</span>
                </div>
                <div className="metric-card card">
                  <span className="metric-label">Likes</span>
                  <span className="metric-value">{metrics.totalLikes}</span>
                  <span className="metric-subtext">Reader appreciations</span>
                </div>
                <div className="metric-card card">
                  <span className="metric-label">Comments</span>
                  <span className="metric-value">{metrics.totalComments}</span>
                  <span className="metric-subtext">Discussion items</span>
                </div>
                <div className="metric-card card">
                  <span className="metric-label">Published</span>
                  <span className="metric-value">{metrics.publishedArticlesCount}</span>
                  <span className="metric-subtext">Live stories</span>
                </div>
                <div className="metric-card card">
                  <span className="metric-label">Drafts</span>
                  <span className="metric-value">{metrics.draftsCount}</span>
                  <span className="metric-subtext">Unpublished work</span>
                </div>
              </div>

              {/* Two Column Layout for Recent Activity */}
              <div className="overview-columns-grid">
                {/* Recent Subscribers */}
                <div className="activity-card card">
                  <h3 className="activity-title headline-editorial">Recent Subscribers</h3>
                  {overviewData?.recentSubscribers?.length > 0 ? (
                    <div className="subscribers-table-wrapper">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Publication</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overviewData.recentSubscribers.map((sub) => (
                            <tr key={sub._id || sub.id}>
                              <td className="table-email">{sub.email}</td>
                              <td>{sub.publication?.name || 'Publication'}</td>
                              <td className="table-date">{formatDate(sub.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title="No subscribers yet"
                      description="Readers who subscribe to your publications will appear here."
                    />
                  )}
                </div>

                {/* Recent Discussion Comments */}
                <div className="activity-card card">
                  <h3 className="activity-title headline-editorial">Recent Reader Comments</h3>
                  {overviewData?.recentComments?.length > 0 ? (
                    <div className="comments-stream-widget">
                      {overviewData.recentComments.map((comment) => (
                        <div key={comment._id || comment.id} className="comment-widget-item">
                          <div className="widget-comment-header">
                            <span className="widget-commenter">
                              {comment.user?.fullName || 'Reader'}
                            </span>
                            <span className="widget-comment-date">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="widget-comment-text">{comment.content}</p>
                          {comment.article && (
                            <Link
                              to={`/article/${comment.article.slug || comment.article._id}`}
                              className="widget-article-link"
                            >
                              Story: {comment.article.title}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No discussion comments"
                      description="Comments on your stories will appear here."
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLES */}
          {activeTab === 'articles' && (
            <div className="articles-tab-content">
              {/* Filter Sub-bar */}
              <div className="articles-filter-subbar">
                <div className="filter-pill-group">
                  <button
                    type="button"
                    onClick={() => setArticlesFilter('all')}
                    className={`filter-pill-btn ${articlesFilter === 'all' ? 'is-active' : ''}`}
                  >
                    All ({articles.length + drafts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticlesFilter('published')}
                    className={`filter-pill-btn ${articlesFilter === 'published' ? 'is-active' : ''}`}
                  >
                    Published ({articles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticlesFilter('drafts')}
                    className={`filter-pill-btn ${articlesFilter === 'drafts' ? 'is-active' : ''}`}
                  >
                    Drafts ({drafts.length})
                  </button>
                </div>

                <Link to="/write" className="btn btn-primary btn-sm">
                  Write New Story
                </Link>
              </div>

              {/* Stories List */}
              {allDisplayItems.length > 0 ? (
                <div className="dashboard-stories-list">
                  {allDisplayItems.map((story) => {
                    const storyId = story._id || story.id;
                    const isDraft = story.status === 'draft';
                    const identifier = story.slug || storyId;

                    return (
                      <div key={storyId} className="story-management-card card">
                        <div className="story-main-info">
                          <div className="story-meta-row">
                            <span className={`story-status-tag ${isDraft ? 'status-draft' : 'status-published'}`}>
                              {isDraft ? 'Draft' : 'Published'}
                            </span>
                            {story.publication?.name && (
                              <span className="story-pub-name">{story.publication.name}</span>
                            )}
                            <span className="story-date-text">
                              {formatDate(story.publishedAt || story.createdAt)}
                            </span>
                          </div>

                          <h3 className="story-manage-title headline-editorial">
                            {story.title || 'Untitled Draft'}
                          </h3>

                          {story.subtitle && (
                            <p className="story-manage-subtitle">{story.subtitle}</p>
                          )}

                          {!isDraft && (
                            <div className="story-metrics-strip">
                              <span className="strip-metric">{story.viewsCount || 0} Views</span>
                              <span className="strip-metric">{story.likesCount || 0} Likes</span>
                              <span className="strip-metric">{story.commentsCount || 0} Comments</span>
                            </div>
                          )}
                        </div>

                        <div className="story-actions-group">
                          <Link to={`/editor/${storyId}`} className="btn btn-secondary btn-sm">
                            Edit
                          </Link>
                          {!isDraft && (
                            <Link to={`/article/${identifier}`} className="btn btn-ghost btn-sm">
                              View Live
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(storyId)}
                            className="btn btn-ghost btn-sm text-danger"
                            disabled={deletingArticleId === storyId}
                          >
                            {deletingArticleId === storyId ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={articlesFilter === 'drafts' ? 'No drafts saved' : 'No published stories'}
                  description="Start sharing your ideas and essays with your readership."
                  actionText="Start Writing"
                  actionLink="/write"
                />
              )}
            </div>
          )}

          {/* TAB 3: PUBLICATIONS */}
          {activeTab === 'publications' && (
            <div className="publications-tab-content">
              <div className="pub-tab-header">
                <p className="pub-tab-description">
                  Publications are independent brands where you publish serialized newsletters and essays.
                </p>
                <Link to="/create-publication" className="btn btn-primary btn-sm">
                  Launch New Publication
                </Link>
              </div>

              {publications.length > 0 ? (
                <div className="dashboard-pubs-grid">
                  {publications.map((pub) => {
                    const pubId = pub._id || pub.id;
                    return (
                      <div key={pubId} className="pub-management-card card">
                        <div className="pub-card-head">
                          <h3 className="pub-card-name headline-editorial">{pub.name}</h3>
                          <span className="pub-badge-category">{pub.category}</span>
                        </div>

                        <p className="pub-card-desc">{pub.description}</p>

                        <div className="pub-card-stats-strip">
                          <span className="pub-strip-item">
                            {pub.subscriberCount || 0} Subscribers
                          </span>
                        </div>

                        <div className="pub-card-actions">
                          <Link to={`/publication/${pub.slug}`} className="btn btn-secondary btn-sm">
                            View Publication
                          </Link>
                          <Link to={`/write?pub=${pubId}`} className="btn btn-primary btn-sm">
                            Write Story
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No publications launched yet"
                  description="Create your first publication to begin building an audience and sending newsletters."
                  actionText="Launch Publication"
                  actionLink="/create-publication"
                />
              )}
            </div>
          )}

          {/* TAB 4: PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="settings-tab-content">
              <div className="settings-card card">
                <h3 className="settings-title headline-editorial">Writer Profile Settings</h3>
                <p className="settings-subtitle">
                  Update your public writer profile, bio, and handle.
                </p>

                {profileSuccess && (
                  <div className="settings-alert-success">
                    Profile updated successfully!
                  </div>
                )}

                {profileError && (
                  <ErrorMessage message={profileError} />
                )}

                <form onSubmit={handleProfileSubmit} className="settings-form">
                  <FormInput
                    label="Full Name"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="Your legal or pen name"
                    required
                  />

                  <FormInput
                    label="Username"
                    name="username"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, username: e.target.value }))
                    }
                    placeholder="unique_writer_handle"
                    helperText="Used in your profile URL: writewave.com/profile/yourhandle"
                    required
                  />

                  <div className="form-field">
                    <label htmlFor="bio-input" className="form-label">
                      Writer Bio
                    </label>
                    <textarea
                      id="bio-input"
                      rows={4}
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      placeholder="Share a brief overview of your background, topics, and ideas..."
                      className="form-control"
                    />
                  </div>

                  <div className="settings-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={profileUpdating}
                    >
                      {profileUpdating ? 'Saving Profile...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WriterDashboard;