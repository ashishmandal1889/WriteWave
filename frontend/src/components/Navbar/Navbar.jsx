import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`navbar-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* WriteWave Brand Name in Plain Text - No decorative symbols */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-name">WriteWave</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Explore
          </NavLink>
          <NavLink
            to="/publications"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Publications
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Search
          </NavLink>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="navbar-actions desktop-actions">
          {isAuthenticated ? (
            <div className="auth-profile-group">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? 'active' : ''}`}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/bookmarks"
                className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? 'active' : ''}`}
              >
                Bookmarks
              </NavLink>
              <Link to="/write" className="btn btn-primary btn-sm">
                Start Writing
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <NavLink
                to="/login"
                className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? 'active' : ''}`}
              >
                Login
              </NavLink>
              <Link to="/write" className="btn btn-primary btn-sm">
                Start Writing
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Plain Text Toggle Button */}
        <button
          type="button"
          className="mobile-menu-text-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <Link to="/" className="navbar-brand" onClick={closeMenu}>
                <span className="brand-name">WriteWave</span>
              </Link>
              <button
                type="button"
                className="mobile-close-text-btn"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            <nav className="mobile-nav-links" aria-label="Mobile Navigation">
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Home
              </NavLink>
              <NavLink
                to="/explore"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Explore
              </NavLink>
              <NavLink
                to="/publications"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Publications
              </NavLink>
              <NavLink
                to="/search"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                Search
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={closeMenu}
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/bookmarks"
                    onClick={closeMenu}
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  >
                    Bookmarks
                  </NavLink>
                </>
              )}
            </nav>

            <div className="mobile-drawer-footer">
              {isAuthenticated ? (
                <div className="mobile-auth-actions">
                  <Link
                    to="/write"
                    onClick={closeMenu}
                    className="btn btn-primary mobile-full-btn"
                  >
                    Start Writing
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-secondary mobile-full-btn"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="btn btn-secondary mobile-full-btn"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="btn btn-primary mobile-full-btn"
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
