import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
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
        <AlertCircle className="error-message-icon" size={22} aria-hidden="true" />
        <div className="error-message-text">
          <strong className="error-message-title">{title}</strong>
          <p className="error-message-desc">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-sm btn-secondary error-retry-btn">
          <RotateCcw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
