import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, FileQuestion } from 'lucide-react';
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
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
            <Link to="/explore" className="btn btn-secondary">
              <Compass size={16} />
              <span>Explore Blogs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
