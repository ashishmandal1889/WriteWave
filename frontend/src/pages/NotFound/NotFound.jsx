import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container-narrow not-found-container">
        <div className="not-found-card card">
          <div className="not-found-badge">404</div>
          <h1 className="not-found-title">Page Not Found</h1>
          <p className="not-found-desc">
            The page you are looking for may have been moved, renamed, or doesn't exist.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
            <Link to="/explore" className="btn btn-secondary">
              Explore Blogs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
