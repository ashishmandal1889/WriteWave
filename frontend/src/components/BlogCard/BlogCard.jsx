import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Edit3, Trash2, ArrowRight } from 'lucide-react';
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
          <span className="blog-card-read-time">
            <Clock size={12} />
            <span>{readingTime}</span>
          </span>
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
            <div className="blog-card-author">
              <div className="author-avatar" aria-hidden="true">
                <User size={14} />
              </div>
              <span className="author-name">{authorDisplay}</span>
            </div>

            {formattedDate && (
              <div className="blog-card-date">
                <Calendar size={13} />
                <time dateTime={createdAt}>{formattedDate}</time>
              </div>
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
                  <Edit3 size={14} />
                  <span>Edit</span>
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
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          ) : (
            <Link to={`/blogs/${blogId}`} className="blog-card-arrow" aria-label={`Read ${title}`}>
              <span>Read</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
