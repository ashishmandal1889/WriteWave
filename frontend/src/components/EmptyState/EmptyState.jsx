import React from 'react';
import { Link } from 'react-router-dom';
import './EmptyState.css';

export const EmptyState = ({
  icon: Icon,
  title = 'No data available',
  description = 'There are no items to display at this time.',
  actionText,
  actionLink,
  onAction,
  className = ''
}) => {
  return (
    <div className={`empty-state-card ${className}`}>
      {Icon && (
        <div className="empty-state-icon-wrapper" aria-hidden="true">
          <Icon className="empty-state-icon" size={36} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      {(actionText && actionLink) && (
        <Link to={actionLink} className="btn btn-primary empty-state-action">
          {actionText}
        </Link>
      )}

      {(actionText && onAction && !actionLink) && (
        <button type="button" onClick={onAction} className="btn btn-primary empty-state-action">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
