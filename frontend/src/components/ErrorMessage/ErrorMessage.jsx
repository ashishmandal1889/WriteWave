import React from 'react';
import './ErrorMessage.css';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`error-message-box ${className}`} role="alert">
      <div className="error-message-content">
        <div className="error-message-text">
          <strong className="error-message-title">{title}</strong>
          <p className="error-message-desc">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-sm btn-secondary error-retry-btn">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
