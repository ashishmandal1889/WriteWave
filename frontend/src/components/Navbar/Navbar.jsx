import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Feather, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logoSvg from '../../assets/images/writewave-logo.svg';
import './Navbar.css';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu on resize to desktop
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
        {/* Brand Logo & Name */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img src={logoSvg} alt="WriteWave Logo" className="navbar-logo-img" />
          <div className="navbar-brand-text">
            <span className="brand-name">WriteWave</span>
          </div>
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
            to="/my-blogs"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            My Blogs
          </NavLink>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="navbar-actions desktop-actions">
          {isAuthenticated ? (
            <div className="auth-profile-group">
              <Link to="/create-blog" className="btn btn-primary btn-sm">
                <Feather size={14} />
                <span>Write</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <NavLink
                to="/login"
                className={({ isActive }) => `btn btn-ghost btn-sm nav-auth-link ${isActive ? 'active' : ''}`}
              >
                <LogIn size={14} />
                <span>Login</span>
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => `btn btn-primary btn-sm nav-auth-link ${isActive ? 'active' : ''}`}
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <Link to="/" className="navbar-brand" onClick={closeMenu}>
                <img src={logoSvg} alt="WriteWave Logo" className="navbar-logo-img" />
                <span className="brand-name">WriteWave</span>
              </Link>
              <button
                type="button"
                className="mobile-close-btn"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X size={22} />
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
                to="/my-blogs"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                My Blogs
              </NavLink>
            </nav>

            <div className="mobile-drawer-footer">
              {isAuthenticated ? (
                <div className="mobile-auth-actions">
                  <Link
                    to="/create-blog"
                    onClick={closeMenu}
                    className="btn btn-primary mobile-full-btn"
                  >
                    <Feather size={16} />
                    <span>Create New Blog</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-secondary mobile-full-btn"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="btn btn-secondary mobile-full-btn"
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="btn btn-primary mobile-full-btn"
                  >
                    <UserPlus size={16} />
                    <span>Sign Up</span>
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
