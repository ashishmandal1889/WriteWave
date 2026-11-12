import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import articleService from '../../services/articleService';
import commentService from '../../services/commentService';
import likeService from '../../services/likeService';
import bookmarkService from '../../services/bookmarkService';
import subscriptionService from '../../services/subscriptionService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './ArticleDetail.css';

export const ArticleDetail = () => {
  const { slugOrId, id } = useParams();
  const articleParam = slugOrId || id;
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Like & Bookmark state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Subscribe banner state
  const [subEmail, setSubEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subMessage, setSubMessage] = useState('');

  // Share state
  const [copiedLink, setCopiedLink] = useState(false);

  const commentsSectionRef = useRef(null);

  // Fetch article and comments
  useEffect(() => {
    let isMounted = true;

    const fetchArticleData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await articleService.getArticleBySlugOrId(articleParam);
        if (isMounted) {
          setArticle(data);
          setIsLiked(Boolean(data?.isLiked));
          setLikesCount(data?.likesCount || 0);
          setIsBookmarked(Boolean(data?.isBookmarked));

          // Fetch comments for this article ID
          const articleId = data?._id || data?.id;
          if (articleId) {
            try {
              const loadedComments = await commentService.getComments(articleId);
              if (isMounted) setComments(loadedComments);
            } catch {
              // Comments fetch failure should not break article reading
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            'The requested article could not be loaded or does not exist.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticleData();

    return () => {
      isMounted = false;
    };
  }, [articleParam]);

  // Toggle article like
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const articleId = article?._id || article?.id;
    if (!articleId) return;

    try {
      const res = await likeService.toggleArticleLike(articleId);
      setIsLiked(res?.liked);
      setLikesCount((prev) => (res?.liked ? prev + 1 : Math.max(0, prev - 1)));
    } catch {
      // Revert or show nothing
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const articleId = article?._id || article?.id;
    if (!articleId) return;

    try {
      const res = await bookmarkService.toggleBookmark(articleId);
      setIsBookmarked(res?.bookmarked);
    } catch {
      // Handle error quietly
    }
  };

  // Submit comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const articleId = article?._id || article?.id;
    if (!articleId) return;

    setSubmittingComment(true);
    setCommentError('');
    try {
      const newComment = await commentService.addComment(articleId, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentId));
    } catch {
      // Error deleting
    }
  };

  // In-article newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail.trim() || !article?.publication) return;

    setIsSubscribing(true);
    setSubMessage('');
    try {
      const pubId = article.publication._id || article.publication;
      const res = await subscriptionService.subscribe(pubId, subEmail.trim());
      setSubMessage(res?.message || 'Subscribed successfully!');
      setSubEmail('');
    } catch (err) {
      setSubMessage(err.response?.data?.message || 'Subscription failed. Please check your email.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Copy share link
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const scrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="article-detail-loading">
        <Loading message="Loading article..." size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-narrow article-detail-empty">
        <EmptyState
          title="Article Not Found"
          description={error || 'This article is unavailable or may have been deleted.'}
          actionText="Browse Articles"
          actionLink="/explore"
        />
      </div>
    );
  }

  const {
    title,
    subtitle,
    content = '',
    coverImageUrl,
    author,
    publication,
    readingTime,
    publishedAt,
    createdAt,
    isPremium
  } = article;

  const authorName = author?.fullName || 'Independent Writer';
  const authorUsername = author?.username || '';
  const authorBio = author?.bio || '';
  const pubName = publication?.name || '';
  const pubSlug = publication?.slug || '';
  const dateStr = formatDate(publishedAt || createdAt);
  const paragraphs = content.split('\n\n').filter((p) => p.trim());

  return (
    <article className="article-detail-page">
      {/* Publication Masthead Bar */}
      {pubName && (
        <div className="article-pub-bar">
          <div className="container-narrow pub-bar-inner">
            <Link to={`/publication/${pubSlug}`} className="pub-bar-link">
              <span className="pub-bar-label">Publication:</span>
              <span className="pub-bar-name">{pubName}</span>
            </Link>
            <Link to={`/publication/${pubSlug}`} className="btn btn-secondary btn-sm">
              View Publication
            </Link>
          </div>
        </div>
      )}

      <div className="container-narrow">
        {/* Top Navigation */}
        <div className="article-nav-actions">
          <Link to="/explore" className="btn btn-ghost btn-sm">
            Back to Explore
          </Link>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-secondary btn-sm"
          >
            {copiedLink ? 'Link Copied' : 'Share'}
          </button>
        </div>

        {/* Article Header */}
        <header className="article-header">
          {isPremium && <span className="article-badge-premium">Premium Story</span>}

          <h1 className="article-main-title headline-editorial">{title}</h1>

          {subtitle && <p className="article-main-subtitle">{subtitle}</p>}

          <div className="article-meta-row">
            <div className="article-writer-meta">
              {authorUsername ? (
                <Link to={`/profile/${authorUsername}`} className="writer-name-link">
                  {authorName}
                </Link>
              ) : (
                <span className="writer-name-static">{authorName}</span>
              )}
              <div className="meta-subline">
                {dateStr && <time className="meta-subitem">{dateStr}</time>}
                {readingTime && <span className="meta-subitem">{readingTime}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Action Bar (Substack-style, Text Only) */}
        <div className="article-action-bar">
          <div className="action-bar-left">
            <button
              type="button"
              onClick={handleToggleLike}
              className={`btn-action-pill ${isLiked ? 'is-active' : ''}`}
            >
              {isLiked ? `Liked (${likesCount})` : `Like (${likesCount})`}
            </button>
            <button
              type="button"
              onClick={scrollToComments}
              className="btn-action-pill"
            >
              Comment ({comments.length})
            </button>
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`btn-action-pill ${isBookmarked ? 'is-active' : ''}`}
            >
              {isBookmarked ? 'Saved' : 'Bookmark'}
            </button>
          </div>
          <div className="action-bar-right">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-action-pill"
            >
              {copiedLink ? 'Link Copied' : 'Share'}
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {coverImageUrl && (
          <div className="article-cover-box">
            <img src={coverImageUrl} alt={title} className="article-cover-image" />
          </div>
        )}

        {/* Article Long-Form Body */}
        <div className="article-body-content">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <p key={idx} className="article-body-paragraph">
                {p}
              </p>
            ))
          ) : (
            <p className="article-body-paragraph">{content}</p>
          )}
        </div>

        {/* In-Article Newsletter Subscription Callout */}
        {pubName && (
          <div className="article-newsletter-box card">
            <div className="newsletter-box-content">
              <span className="newsletter-preheading">Enjoyed this story?</span>
              <h3 className="newsletter-box-title headline-editorial">
                Subscribe to {pubName}
              </h3>
              <p className="newsletter-box-desc">
                Get new essays, analyses, and stories delivered directly to your inbox.
              </p>

              {subMessage && (
                <div className="newsletter-sub-alert">{subMessage}</div>
              )}

              <form onSubmit={handleSubscribe} className="newsletter-box-form">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="form-control"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubscribing || !subEmail.trim()}
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Writer Bio Footer Box */}
        <div className="writer-bio-box card">
          <div className="writer-bio-info">
            <span className="writer-bio-label">Published by</span>
            <h4 className="writer-bio-name">
              {authorUsername ? (
                <Link to={`/profile/${authorUsername}`}>{authorName}</Link>
              ) : (
                authorName
              )}
            </h4>
            {authorBio && <p className="writer-bio-text">{authorBio}</p>}
          </div>
          {authorUsername && (
            <Link to={`/profile/${authorUsername}`} className="btn btn-secondary btn-sm">
              View Profile
            </Link>
          )}
        </div>

        {/* Discussion / Comments Section */}
        <section
          ref={commentsSectionRef}
          className="article-comments-section"
          aria-label="Discussion"
        >
          <div className="comments-header">
            <h2 className="comments-heading headline-editorial">
              Discussion ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          <div className="comment-composer-card card">
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="comment-composer-form">
                {commentError && <ErrorMessage message={commentError} />}
                <div className="form-field">
                  <label htmlFor="comment-input" className="form-label">
                    Add to the discussion
                  </label>
                  <textarea
                    id="comment-input"
                    rows={4}
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      if (commentError) setCommentError('');
                    }}
                    placeholder="Write a thoughtful comment..."
                    className="form-control"
                    required
                  />
                </div>
                <div className="composer-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingComment || !commentText.trim()}
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="comment-login-prompt">
                <p className="prompt-text">Sign in to participate in the discussion.</p>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In to Comment
                </Link>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="comments-stream">
            {comments.length > 0 ? (
              comments.map((comment) => {
                const commentId = comment._id || comment.id;
                const cAuthorName = comment.author?.fullName || 'Reader';
                const cAuthorUsername = comment.author?.username || '';
                const isAuthor = user && (user._id === comment.author?._id || user.id === comment.author?.id);

                return (
                  <div key={commentId} className="comment-card card">
                    <div className="comment-card-header">
                      <div className="comment-user-info">
                        {cAuthorUsername ? (
                          <Link to={`/profile/${cAuthorUsername}`} className="comment-user-name">
                            {cAuthorName}
                          </Link>
                        ) : (
                          <span className="comment-user-name">{cAuthorName}</span>
                        )}
                        {comment.createdAt && (
                          <span className="comment-timestamp">
                            {formatDate(comment.createdAt)}
                          </span>
                        )}
                      </div>

                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(commentId)}
                          className="btn-text-action btn-text-danger"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <p className="comment-card-body">{comment.content}</p>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No comments yet"
                description="Be the first to share your thoughts on this story."
              />
            )}
          </div>
        </section>
      </div>
    </article>
  );
};

export default ArticleDetail;