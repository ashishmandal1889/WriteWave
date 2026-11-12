import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-root">
      <div className="container footer-container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <span className="brand-name">WriteWave</span>
            </Link>
            <p className="footer-tagline">
              Your Ideas. Your Audience. Your Publication.
            </p>
            <p className="footer-desc">
              An independent publishing platform where writers create publications, build direct relationships with subscribers, and distribute newsletters.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/explore">Explore</Link></li>
              <li><Link to="/publications">Publications</Link></li>
              <li><Link to="/write">Start Writing</Link></li>
              <li><Link to="/dashboard">Writer Dashboard</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links-list">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/bookmarks">Saved Bookmarks</Link></li>
              <li><Link to="/subscriptions">My Subscriptions</Link></li>
            </ul>
          </div>

          {/* Architecture Status */}
          <div className="footer-status-col">
            <h4 className="footer-heading">Publishing Engine</h4>
            <div className="footer-status-card">
              <span className="status-badge">Independent Publishing</span>
              <p className="status-text">
                Full-stack architecture with Node.js, Express, and MongoDB Atlas.
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            Copyright {currentYear} WriteWave. All rights reserved.
          </p>
          <p className="footer-crafted">
            Clean editorial reading and publishing platform.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
