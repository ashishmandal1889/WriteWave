import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import PublicationCard from '../../components/PublicationCard/PublicationCard';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import './WriterProfile.css';

export const WriterProfile = () => {
  const { usernameOrId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [writer, setWriter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'publications'

  useEffect(() => {
    let isMounted = true;

    const fetchWriter = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.getWriterProfile(usernameOrId);
        if (isMounted) {
          setWriter(data);
          setFollowersCount(data?.followersCount || 0);
          if (user && data?.id) {
            // Check if current user is following this writer
            setIsFollowing(Boolean(data?.isFollowing));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Writer not found.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWriter();

    return () => {
      isMounted = false;
    };
  }, [usernameOrId, user]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const writerId = writer?.id || writer?._id;
    if (!writerId) return;

    try {
      const res = await userService.toggleFollow(writerId);
      setIsFollowing(res?.isFollowing);
      setFollowersCount((prev) => (res?.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
    } catch {
      // Quiet fail
    }
  };

  if (loading) {
    return (
      <div className="writer-profile-loading">
        <Loading message="Loading writer profile..." size="lg" />
      </div>
    );
  }

  if (error || !writer) {
    return (
      <div className="container-narrow writer-profile-empty">
        <EmptyState
          title="Writer Not Found"
          description={error || 'This writer profile does not exist or has been removed.'}
          actionText="Explore Writers"
          actionLink="/explore"
        />
      </div>
    );
  }

  const {
    id,
    fullName,
    username,
    bio,
    avatarUrl,
    totalSubscribers = 0,
    publications = [],
    articles = []
  } = writer;

  const isSelf = user && (user._id === id || user.id === id || user.username === username);

  return (
    <div className="writer-profile-page">
      {/* Header Profile Section */}
      <section className="writer-profile-hero">
        <div className="container-narrow">
          <div className="writer-hero-inner">
            <div className="writer-hero-content">
              <h1 className="writer-fullname headline-editorial">{fullName}</h1>
              <p className="writer-handle">@{username}</p>

              {bio && <p className="writer-bio-description">{bio}</p>}

              {/* Real Platform Metrics */}
              <div className="writer-stats-row">
                <div className="writer-stat-item">
                  <span className="stat-number">{articles.length}</span>
                  <span className="stat-label">Articles</span>
                </div>
                <div className="writer-stat-item">
                  <span className="stat-number">{publications.length}</span>
                  <span className="stat-label">Publications</span>
                </div>
                <div className="writer-stat-item">
                  <span className="stat-number">{totalSubscribers}</span>
                  <span className="stat-label">Subscribers</span>
                </div>
                <div className="writer-stat-item">
                  <span className="stat-number">{followersCount}</span>
                  <span className="stat-label">Followers</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="writer-action-buttons">
                {isSelf ? (
                  <Link to="/dashboard" className="btn btn-primary btn-sm">
                    Open Dashboard
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Tabs Navigation */}
      <section className="writer-tabs-section">
        <div className="container-narrow">
          <div className="writer-tabs-bar">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`writer-tab-btn ${activeTab === 'articles' ? 'is-active' : ''}`}
            >
              Articles ({articles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('publications')}
              className={`writer-tab-btn ${activeTab === 'publications' ? 'is-active' : ''}`}
            >
              Publications ({publications.length})
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Content */}
      <section className="writer-content-section">
        <div className="container-narrow">
          {activeTab === 'articles' && (
            <div className="writer-articles-stream">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <ArticleCard key={article._id || article.id} article={article} />
                ))
              ) : (
                <EmptyState
                  title="No articles published"
                  description={`${fullName} has not published any public articles yet.`}
                />
              )}
            </div>
          )}

          {activeTab === 'publications' && (
            <div className="writer-publications-grid">
              {publications.length > 0 ? (
                publications.map((pub) => (
                  <PublicationCard key={pub._id || pub.id} publication={pub} />
                ))
              ) : (
                <EmptyState
                  title="No publications launched"
                  description={`${fullName} has not created any publications yet.`}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WriterProfile;