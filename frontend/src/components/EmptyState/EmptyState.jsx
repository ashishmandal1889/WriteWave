import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Feather, Search } from 'lucide-react';
import './EmptyState.css';

export const EmptyState = ({
  icon: Icon = FileText,
  title = 'No data available',
  description = 'There are no items to display at this time.',
  actionText,
  actionLink,
  onAction,
  className = ''
}) => {
  return (
    <div className={`empty-state-card ${className}`}>
      <div className="empty-state-icon-wrapper" aria-hidden="true">
        <Icon className="empty-state-icon" size={36} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      {(actionText && actionLink) && (
        <Link to={actionLink} className="btn btn-primary empty-state-action">
          <Feather size={16} />
          <span>{actionText}</span>
        </Link>
      )}

      {(actionText && onAction && !actionLink) && (
        <button type="button" onClick={onAction} className="btn btn-primary empty-state-action">
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
