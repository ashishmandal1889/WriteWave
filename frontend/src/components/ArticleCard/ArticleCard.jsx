import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import './ArticleCard.css';

export const ArticleCard = ({
  article,
  showActions = false,
  onEdit,
  onDelete,
  onBookmark,
  isBookmarked = false,
  className = ''
}) => {
  if (!article) return null;

  const {
    _id,
    id,
    title,
    subtitle,
    slug,
    coverImageUrl,
    author,
    publication,
    readingTime,
    publishedAt,
    createdAt,
    isPremium
  } = article;

  const articleIdentifier = slug || _id || id;
  const authorName = author?.fullName || 'Writer';
  const authorUsername = author?.username || '';
  const publicationName = publication?.name || '';
  const publicationSlug = publication?.slug || '';
  const dateStr = formatDate(publishedAt || createdAt);

  return (
    <article className={`article-card card ${className}`}>
      {coverImageUrl && (
        <div className="article-card-cover">
          <img src={coverImageUrl} alt={title} loading="lazy" />
        </div>
      )}

      <div className="article-card-content">
        <div className="article-card-header">
          {publicationName && (
            <Link to={`/publication/${publicationSlug}`} className="article-pub-link">
              {publicationName}
            </Link>
          )}
          {isPremium && <span className="badge-premium">Premium</span>}
        </div>

        <h3 className="article-card-title headline-editorial">
          <Link to={`/article/${articleIdentifier}`}>{title}</Link>
        </h3>

        {subtitle && <p className="article-card-subtitle">{subtitle}</p>}

        <div className="article-card-footer">
          <div className="article-card-meta">
            {authorUsername ? (
              <Link to={`/profile/${authorUsername}`} className="article-author-link">
                {authorName}
              </Link>
            ) : (
              <span className="article-author-name">{authorName}</span>
            )}
            {dateStr && <span className="article-meta-date">{dateStr}</span>}
            {readingTime && <span className="article-meta-read">{readingTime}</span>}
          </div>

          <div className="article-card-actions">
            {onBookmark && (
              <button
                type="button"
                onClick={() => onBookmark(article)}
                className="btn-text-action"
              >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            )}

            {showActions ? (
              <div className="article-admin-actions">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(article)}
                    className="btn-text-action"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(article)}
                    className="btn-text-action btn-text-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            ) : (
              <Link to={`/article/${articleIdentifier}`} className="article-read-link">
                Read
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
