import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, calculateReadingTime } from '../../utils/formatDate';
import './BlogCard.css';

/**
 * Reusable data-driven BlogCard component.
 * Displays blog data dynamically provided by the backend API.
 * Never displays hardcoded dummy blog records.
 */
export const BlogCard = ({
  blog,
  showActions = false,
  onEdit,
  onDelete,
  className = ''
}) => {
  if (!blog) return null;

  const {
    id,
    _id,
    title,
    content = '',
    coverImageUrl,
    authorName,
    author,
    createdAt,
    category
  } = blog;

  const blogId = id || _id;
  const authorDisplay = authorName || (typeof author === 'object' ? author?.name : author) || 'Anonymous';
  const readingTime = calculateReadingTime(content);
  const formattedDate = formatDate(createdAt);
  const excerpt = content ? (content.length > 140 ? `${content.substring(0, 140).trim()}...` : content) : '';

  return (
    <article className={`blog-card card ${className}`}>
      {coverImageUrl && (
        <div className="blog-card-media">
          <img
            src={coverImageUrl}
            alt={title ? `Cover for ${title}` : 'Blog cover'}
            loading="lazy"
            className="blog-card-image"
          />
        </div>
      )}

      <div className="blog-card-body">
        <div className="blog-card-header">
          {category && (
            <span className="blog-card-category">{category}</span>
          )}
          <span className="blog-card-read-time">{readingTime}</span>
        </div>

        <h3 className="blog-card-title">
          <Link to={`/blogs/${blogId}`} className="blog-card-title-link">
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="blog-card-excerpt">{excerpt}</p>
        )}

        <div className="blog-card-footer">
          <div className="blog-card-meta">
            <span className="author-name">{authorDisplay}</span>
            {formattedDate && (
              <time dateTime={createdAt} className="blog-card-date">{formattedDate}</time>
            )}
          </div>

          {showActions ? (
            <div className="blog-card-actions">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(blog)}
                  className="btn btn-sm btn-secondary blog-action-btn"
                  title="Edit blog"
                  aria-label={`Edit ${title}`}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(blogId)}
                  className="btn btn-sm btn-danger blog-action-btn"
                  title="Delete blog"
                  aria-label={`Delete ${title}`}
                >
                  Delete
                </button>
              )}
            </div>
          ) : (
            <Link to={`/blogs/${blogId}`} className="blog-card-arrow" aria-label={`Read ${title}`}>
              Read
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
