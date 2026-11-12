import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, Heart } from 'lucide-react';
import logoSvg from '../../assets/images/writewave-logo.svg';
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
              <img src={logoSvg} alt="WriteWave Logo" className="footer-logo-img" />
              <span className="brand-name">WriteWave</span>
            </Link>
            <p className="footer-tagline">
              Share Your Thoughts. Inspire the World.
            </p>
            <p className="footer-desc">
              A modern, focused blogging platform designed for creators, thinkers, and avid readers.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/explore">Explore Blogs</Link></li>
              <li><Link to="/create-blog">Start Writing</Link></li>
              <li><Link to="/my-blogs">My Dashboard</Link></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links-list">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* Tech Readiness Notice */}
          <div className="footer-status-col">
            <h4 className="footer-heading">Architecture</h4>
            <div className="footer-status-card">
              <span className="status-badge">REST API Ready</span>
              <p className="status-text">
                Prepared for Spring Boot JWT authentication & MongoDB persistence.
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} WriteWave. All rights reserved.
          </p>
          <p className="footer-crafted">
            Built with modern React and clean UI architecture.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
