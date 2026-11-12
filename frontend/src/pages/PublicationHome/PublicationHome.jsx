import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicationService from '../../services/publicationService';
import subscriptionService from '../../services/subscriptionService';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './PublicationHome.css';

export const PublicationHome = () => {
  const { slug } = useParams();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe form state
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subMessage, setSubMessage] = useState('');

  // Active tab: 'articles' or 'about'
  const [activeTab, setActiveTab] = useState('articles');

  useEffect(() => {
    let isMounted = true;

    const fetchPublication = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await publicationService.getPublicationBySlug(slug);
        if (isMounted) {
          setPublication(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Publication not found or unavailable.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublication();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !publication) return;

    setIsSubscribing(true);
    setSubMessage('');
    try {
      const res = await subscriptionService.subscribe(publication._id, email.trim());
      setSubMessage(res?.message || 'Successfully subscribed!');
      setEmail('');
      // Optimistically increment subscriber count
      setPublication((prev) => ({
        ...prev,
        subscriberCount: (prev?.subscriberCount || 0) + 1
      }));
    } catch (err) {
      setSubMessage(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="pub-home-loading">
        <Loading message="Loading publication..." size="lg" />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="container-narrow" style={{ padding: '80px 0' }}>
        <EmptyState
          title="Publication Not Found"
          description={error || 'The requested publication could not be found.'}
          actionText="Browse Publications"
          actionLink="/publications"
        />
      </div>
    );
  }

  const {
    name,
    description,
    about,
    category,
    coverImageUrl,
    author,
    subscriberCount = 0,
    articles = []
  } = publication;

  const authorName = author?.fullName || 'Writer';
  const authorUsername = author?.username || '';

  return (
    <div className="publication-home-page">
      {/* Cover Image Banner */}
      {coverImageUrl && (
        <div className="pub-cover-banner">
          <img src={coverImageUrl} alt={name} />
        </div>
      )}

      {/* Publication Masthead */}
      <header className="pub-masthead">
        <div className="container-narrow">
          <div className="pub-masthead-content">
            <span className="badge-category">{category || 'Publication'}</span>

            <h1 className="pub-masthead-name headline-editorial">{name}</h1>
            <p className="pub-masthead-description">{description}</p>

            <div className="pub-masthead-meta">
              <span>By {authorUsername ? (
                <Link to={`/profile/${authorUsername}`} className="pub-masthead-author-link">
                  {authorName}
                </Link>
              ) : authorName}</span>
              <span className="meta-sep">|</span>
              <span>{subscriberCount} subscribers</span>
              <span className="meta-sep">|</span>
              <span>{articles.length} articles</span>
            </div>

            {/* Newsletter Subscription Box */}
            <div className="pub-subscribe-box card">
              <h3 className="pub-subscribe-title">Subscribe to {name}</h3>
              <p className="pub-subscribe-text">
                Get new posts delivered directly to your inbox. Free subscription.
              </p>

              {subMessage ? (
                <div className="pub-subscribe-feedback">{subMessage}</div>
              ) : (
                <form onSubmit={handleSubscribe} className="pub-subscribe-form">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="form-control pub-sub-input"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary pub-sub-btn"
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Publication Sub-Navigation */}
      <nav className="pub-nav-bar" aria-label="Publication Navigation">
        <div className="container-narrow">
          <div className="pub-nav-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`pub-nav-tab ${activeTab === 'articles' ? 'is-active' : ''}`}
            >
              Articles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`pub-nav-tab ${activeTab === 'about' ? 'is-active' : ''}`}
            >
              About
            </button>
          </div>
        </div>
      </nav>

      {/* Main Publication Content */}
      <main className="pub-content-main">
        <div className="container-narrow">
          {activeTab === 'articles' ? (
            <div className="pub-articles-list">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <ArticleCard key={article._id || article.id} article={article} />
                ))
              ) : (
                <EmptyState
                  title="No articles published in this publication yet"
                  description="When the author publishes stories or newsletters, they will appear here."
                />
              )}
            </div>
          ) : (
            <div className="pub-about-card card">
              <h2 className="pub-about-title headline-editorial">About {name}</h2>
              <div className="pub-about-body">
                {about ? (
                  <p className="pub-about-text">{about}</p>
                ) : (
                  <p className="pub-about-text">{description}</p>
                )}
              </div>

              <div className="pub-about-author-section">
                <h3 className="pub-about-author-heading">About the Author</h3>
                <p className="pub-about-author-name">
                  <strong>{authorName}</strong>
                </p>
                {author?.bio && <p className="pub-about-author-bio">{author.bio}</p>}
                {authorUsername && (
                  <Link to={`/profile/${authorUsername}`} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                    View Writer Profile
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicationHome;
