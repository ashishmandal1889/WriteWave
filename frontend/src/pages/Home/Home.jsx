import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Feather, Compass, ArrowRight, BookOpen } from 'lucide-react';
import blogService from '../../services/blogService';
import BlogCard from '../../components/BlogCard/BlogCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import heroIllustration from '../../assets/images/hero-illustration.svg';
import './Home.css';

export const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await blogService.getLatestBlogs(6);
        if (isMounted) {
          // Handle array directly or paginated structure response.content / response.data
          const blogList = Array.isArray(response) ? response : (response?.content || response?.blogs || []);
          setBlogs(blogList);
        }
      } catch (err) {
        if (isMounted) {
          // In development without backend running, catch cleanly and keep empty list
          // so empty state renders gracefully rather than crashing
          setBlogs([]);
          // Only show error notice if it's an explicit API failure, not just offline setup
          if (err.response) {
            setError(err.response?.data?.message || 'Failed to fetch latest blogs.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">
              <Feather size={14} />
              <span>Modern Blogging Platform</span>
            </span>

            <h1 id="hero-heading" className="hero-title">
              Share Your Thoughts. <br />
              <span className="hero-title-accent">Inspire the World.</span>
            </h1>

            <p className="hero-description">
              WriteWave is a modern platform for writers and readers to create, publish, and discuss amazing ideas through blogs.
            </p>

            <div className="hero-actions">
              <Link to="/create-blog" className="btn btn-primary btn-lg">
                <Feather size={18} />
                <span>Start Writing</span>
              </Link>
              <Link to="/explore" className="btn btn-secondary btn-lg">
                <Compass size={18} />
                <span>Explore Blogs</span>
              </Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <img
              src={heroIllustration}
              alt="WriteWave writing illustration"
              className="hero-illustration-img"
            />
          </div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="latest-blogs-section" aria-labelledby="latest-blogs-heading">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 id="latest-blogs-heading" className="section-title">Latest Blogs</h2>
              <p className="section-subtitle">Discover fresh perspectives and recently published insights</p>
            </div>
            <Link to="/explore" className="view-all-link">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Dynamic Content Area: Data-driven or clean empty state */}
          {loading ? (
            <div className="latest-blogs-loading">
              <Loading message="Fetching latest stories..." />
            </div>
          ) : blogs.length > 0 ? (
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <BlogCard key={blog.id || blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No blogs published yet."
              description="No blogs published yet. Be the first to share your thoughts!"
              actionText="Start Writing"
              actionLink="/create-blog"
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
