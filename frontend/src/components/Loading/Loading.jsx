import React from 'react';
import './Loading.css';

export const Loading = ({ message = 'Loading...', size = 'md', fullPage = false }) => {
  const content = (
    <div className={`loading-container loading-${size}`} role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      {message && <p className="loading-text">{message}</p>}
      <span className="visually-hidden">{message}</span>
    </div>
  );

  if (fullPage) {
    return <div className="loading-overlay">{content}</div>;
  }

  return content;
};

export default Loading;
