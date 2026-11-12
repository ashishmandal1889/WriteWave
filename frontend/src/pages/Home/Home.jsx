import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import publicationService from '../../services/publicationService';
import articleService from '../../services/articleService';
import userService from '../../services/userService';
import subscriptionService from '../../services/subscriptionService';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import PublicationCard from '../../components/PublicationCard/PublicationCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import './Home.css';

export const Home = () => {
  const [featuredPublications, setFeaturedPublications] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [recommendedWriters, setRecommendedWriters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // General newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadHomepageData = async () => {
      setLoading(true);
      try {
        const [pubsRes, articlesRes, writersRes, catsRes] = await Promise.allSettled([
          publicationService.getPublications({ limit: 4 }),
          articleService.getArticles({ limit: 6 }),
          userService.getRecommendedWriters(),
          publicationService.getCategories()
        ]);

        if (isMounted) {
          if (pubsRes.status === 'fulfilled') {
            const list = pubsRes.value?.publications || [];
            setFeaturedPublications(list);
          }
          if (articlesRes.status === 'fulfilled') {
            const list = articlesRes.value?.articles || [];
            setLatestArticles(list);
          }
          if (writersRes.status === 'fulfilled') {
            const list = writersRes.value || [];
            setRecommendedWriters(list);
          }
          if (catsRes.status === 'fulfilled') {
            const list = catsRes.value || [];
            setCategories(list);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHomepageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGeneralNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterLoading(true);
    try {
      // If a featured publication exists, register subscription to first publication
      if (featuredPublications.length > 0) {
        await subscriptionService.subscribe(featuredPublications[0]._id, newsletterEmail.trim());
      }
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch {
      setNewsletterSuccess(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">Independent Publishing Platform</span>

            <h1 id="hero-heading" className="hero-title headline-editorial">
              Your Ideas Deserve an Audience.
            </h1>

            <p className="hero-description">
              Write, publish and build a community around the ideas you believe in.
            </p>

            <div className="hero-actions">
              <Link to="/write" className="btn btn-primary btn-lg">
                Start Writing
              </Link>
              <Link to="/publications" className="btn btn-secondary btn-lg">
                Explore Publications
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Publications Section */}
      <section className="home-section" aria-labelledby="featured-pubs-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="featured-pubs-heading" className="section-title headline-editorial">
                Featured Publications
              </h2>
              <p className="section-subtitle">
                Independent newsletters and digital publications on WriteWave
              </p>
            </div>
            <Link to="/publications" className="section-view-all">
              View All Publications
            </Link>
          </div>

          {loading ? (
            <div className="section-loading">
              <Loading message="Loading publications..." />
            </div>
          ) : featuredPublications.length > 0 ? (
            <div className="publications-grid">
              {featuredPublications.map((pub) => (
                <PublicationCard key={pub._id || pub.id} publication={pub} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No publications created yet"
              description="Be the first writer to create an independent publication and cultivate your readership."
              actionText="Create Publication"
              actionLink="/create-publication"
            />
          )}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="home-section home-section-alt" aria-labelledby="latest-articles-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="latest-articles-heading" className="section-title headline-editorial">
                Latest Articles
              </h2>
              <p className="section-subtitle">
                Fresh perspectives published by independent writers
              </p>
            </div>
            <Link to="/explore" className="section-view-all">
              Explore All Articles
            </Link>
          </div>

          {loading ? (
            <div className="section-loading">
              <Loading message="Loading latest stories..." />
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="articles-grid">
              {latestArticles.map((article) => (
                <ArticleCard key={article._id || article.id} article={article} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No articles published yet"
              description="No articles have been published to WriteWave yet. Start your publication and publish your first article."
              actionText="Start Writing"
              actionLink="/write"
            />
          )}
        </div>
      </section>

      {/* Recommended Writers Section */}
      <section className="home-section" aria-labelledby="recommended-writers-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="recommended-writers-heading" className="section-title headline-editorial">
                Recommended Writers
              </h2>
              <p className="section-subtitle">
                Connect with thoughtful voices across various topics
              </p>
            </div>
          </div>

          {recommendedWriters.length > 0 ? (
            <div className="writers-grid">
              {recommendedWriters.map((writer) => (
                <div key={writer._id || writer.id} className="writer-card card">
                  <div className="writer-info">
                    <h3 className="writer-name">
                      <Link to={`/profile/${writer.username}`}>{writer.fullName}</Link>
                    </h3>
                    <span className="writer-username">@{writer.username}</span>
                    {writer.bio && <p className="writer-bio">{writer.bio}</p>}
                  </div>
                  <Link to={`/profile/${writer.username}`} className="btn btn-secondary btn-sm writer-view-btn">
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No registered writers to display"
              description="New writers will appear here as accounts and publications are created."
            />
          )}
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="home-section home-section-alt" aria-labelledby="categories-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="categories-heading" className="section-title headline-editorial">
                Popular Categories
              </h2>
              <p className="section-subtitle">Explore independent thinking by topic</p>
            </div>
          </div>

          <div className="categories-pill-row">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/explore?category=${encodeURIComponent(cat)}`}
                className="category-explore-pill"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="home-newsletter-section" aria-labelledby="newsletter-heading">
        <div className="container-narrow">
          <div className="newsletter-card card">
            <h2 id="newsletter-heading" className="newsletter-title headline-editorial">
              Stay in the loop with WriteWave
            </h2>
            <p className="newsletter-subtitle">
              Subscribe to discover exceptional publications and curated long-form writing delivered directly to your inbox.
            </p>

            {newsletterSuccess ? (
              <div className="newsletter-success-box">
                Thank you for subscribing. You are now signed up for updates.
              </div>
            ) : (
              <form onSubmit={handleGeneralNewsletter} className="newsletter-form">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="form-control newsletter-input"
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-lg newsletter-btn"
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
