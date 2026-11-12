import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import blogService from '../../services/blogService';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { formatDate, calculateReadingTime } from '../../utils/formatDate';
import './BlogDetails.css';

export const BlogDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comment Form State
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await blogService.getBlogById(id);
        if (isMounted) {
          setBlog(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            'The requested blog post is unavailable or could not be found.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setCommentError('Comment text cannot be empty.');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError('');
    try {
      const newComment = await blogService.addComment(id, {
        comment: commentText.trim()
      });

      setBlog((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), newComment || {
          id: Date.now(),
          comment: commentText.trim(),
          authorName: user?.fullName || 'You',
          createdAt: new Date().toISOString()
        }]
      }));

      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err) {
      setCommentError(
        err.response?.data?.message ||
        'Failed to submit comment. Please ensure backend server is reachable.'
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="blog-details-loading-page">
        <Loading message="Loading blog article..." size="lg" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container-narrow blog-details-empty-wrapper">
        <EmptyState
          title="Blog unavailable"
          description={error || 'The blog article you requested does not exist or has been removed.'}
          actionText="Explore All Blogs"
          actionLink="/explore"
        />
      </div>
    );
  }

  const {
    title,
    content = '',
    coverImageUrl,
    authorName,
    author,
    createdAt,
    category,
    comments = []
  } = blog;

  const authorDisplay = authorName || (typeof author === 'object' ? author?.name : author) || 'Author';
  const formattedDate = formatDate(createdAt);
  const readingTime = calculateReadingTime(content);

  const paragraphs = content.split('\n\n').filter((p) => p.trim());

  return (
    <article className="blog-details-page">
      <div className="container-narrow">
        {/* Top Navigation */}
        <div className="blog-details-nav">
          <Link to="/explore" className="btn btn-ghost btn-sm">
            Back to Explore
          </Link>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-secondary btn-sm"
            aria-label="Share this blog link"
          >
            {copiedLink ? 'Copied Link' : 'Share'}
          </button>
        </div>

        {/* Blog Header */}
        <header className="blog-header">
          {category && (
            <span className="blog-category-badge">{category}</span>
          )}

          <h1 className="blog-details-title">{title}</h1>

          <div className="blog-author-bar">
            <div className="author-info">
              <div className="author-meta">
                <span className="author-full-name">{authorDisplay}</span>
                <div className="blog-meta-sub">
                  {formattedDate && (
                    <time dateTime={createdAt} className="meta-item">{formattedDate}</time>
                  )}
                  <span className="meta-item">{readingTime}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {coverImageUrl && (
          <div className="blog-cover-wrapper">
            <img
              src={coverImageUrl}
              alt={title}
              className="blog-cover-img"
            />
          </div>
        )}

        {/* Blog Full Content */}
        <div className="blog-content-body">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index} className="blog-paragraph">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="blog-paragraph">{content}</p>
          )}
        </div>

        {/* Comments Section */}
        <section className="blog-comments-section" aria-labelledby="comments-heading">
          <div className="comments-header">
            <h2 id="comments-heading" className="comments-title">
              Discussion ({comments.length})
            </h2>
          </div>

          {/* Add Comment Form */}
          <div className="add-comment-card card">
            <h3 className="add-comment-heading">Leave a comment</h3>

            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                {commentError && (
                  <ErrorMessage message={commentError} />
                )}
                {commentSuccess && (
                  <div className="comment-success-notice">
                    Your comment has been added!
                  </div>
                )}
                <div className="form-field">
                  <textarea
                    rows={4}
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      if (commentError) setCommentError('');
                    }}
                    placeholder="Share your constructive thoughts on this article..."
                    className="form-control form-textarea"
                    required
                  />
                </div>
                <div className="comment-form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmittingComment || !commentText.trim()}
                  >
                    {isSubmittingComment ? 'Posting...' : 'Submit Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="comment-auth-gate">
                <p>Join the conversation. Sign in to post a comment.</p>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In to Comment
                </Link>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment, idx) => (
                <div key={comment.id || idx} className="comment-item card">
                  <div className="comment-item-header">
                    <div>
                      <span className="comment-author-name">
                        {comment.authorName || (typeof comment.author === 'object' ? comment.author?.name : comment.author) || 'User'}
                      </span>
                      {comment.createdAt && (
                        <span className="comment-date">
                          {formatDate(comment.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="comment-body-text">{comment.comment || comment.content || comment.text}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No comments yet"
                description="Be the first to share your thoughts and start the discussion!"
                className="comments-empty-state"
              />
            )}
          </div>
        </section>
      </div>
    </article>
  );
};

export default BlogDetails;
