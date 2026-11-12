import React, { useState, useEffect } from 'react';
import bookmarkService from '../../services/bookmarkService';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './Bookmarks.css';

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookmarkService.getMyBookmarks();
      setBookmarks(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (article) => {
    const articleId = article._id || article.id;
    if (!articleId) return;

    try {
      await bookmarkService.toggleBookmark(articleId);
      setBookmarks((prev) => prev.filter((a) => (a._id || a.id) !== articleId));
    } catch {
      // Quiet fail
    }
  };

  if (loading) {
    return (
      <div className="bookmarks-loading">
        <Loading message="Loading your saved stories..." size="lg" />
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <header className="bookmarks-header-section">
        <div className="container-narrow">
          <h1 className="bookmarks-heading headline-editorial">Saved Stories</h1>
          <p className="bookmarks-subheading">
            Stories, essays, and articles you have bookmarked to read later.
          </p>
        </div>
      </header>

      <main className="bookmarks-content-section">
        <div className="container-narrow">
          {error && <ErrorMessage message={error} onRetry={fetchBookmarks} />}

          {bookmarks.length > 0 ? (
            <div className="bookmarks-stream">
              {bookmarks.map((article) => (
                <ArticleCard
                  key={article._id || article.id}
                  article={article}
                  isBookmarked={true}
                  onBookmark={handleRemoveBookmark}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved stories yet"
              description="When reading articles on WriteWave, click 'Bookmark' to save them here for easy reading."
              actionText="Explore Stories"
              actionLink="/explore"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookmarks;