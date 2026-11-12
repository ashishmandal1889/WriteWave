import React, { useState, useEffect, useCallback } from 'react';
import { Search, Compass, RefreshCw, Filter } from 'lucide-react';
import blogService from '../../services/blogService';
import SearchBar from '../../components/SearchBar/SearchBar';
import BlogCard from '../../components/BlogCard/BlogCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './Explore.css';

// Preset category tags for filter UI (strictly categories, without invented articles)
const DEFAULT_CATEGORIES = ['All', 'Technology', 'Writing', 'Design', 'Productivity', 'Culture', 'Life'];

export const Explore = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs from API based on query and category
  const loadBlogs = useCallback(async (query = searchQuery, category = selectedCategory) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (category && category !== 'All') params.category = category;

      const response = await blogService.getBlogs(params);
      const blogList = Array.isArray(response) ? response : (response?.content || response?.blogs || []);
      setBlogs(blogList);
    } catch (err) {
      // In development / API integration phase, capture API response errors cleanly
      if (err.response) {
        setError(err.response?.data?.message || 'Failed to fetch blogs from the server.');
      } else {
        // If server connection is offline, keep list empty and show friendly empty state
        setBlogs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  // Initial load and category API synchronization
  useEffect(() => {
    loadBlogs(searchQuery, selectedCategory);

    // Attempt to load dynamic category list from backend if provided
    blogService.getCategories()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(['All', ...data]);
        }
      })
      .catch(() => {
        // Fallback to default categories if backend category endpoint is not configured yet
      });
  }, [loadBlogs]);

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    loadBlogs(query, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    loadBlogs(searchQuery, category);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    loadBlogs('', 'All');
  };

  return (
    <div className="explore-page">
      {/* Explore Header */}
      <section className="explore-header-section">
        <div className="container">
          <div className="explore-header-content">
            <h1 className="explore-title">Explore Stories & Ideas</h1>
            <p className="explore-subtitle">
              Browse through articles, tutorials, and perspectives from writers worldwide.
            </p>

            <div className="explore-search-wrapper">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                placeholder="Search blogs by title, topic, or keyword..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter UI */}
      <section className="category-filter-section" aria-label="Blog Categories">
        <div className="container">
          <div className="category-filter-bar">
            <span className="category-filter-label">
              <Filter size={14} />
              <span>Category:</span>
            </span>
            <div className="category-pills">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`category-pill ${selectedCategory === category ? 'is-active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Listing Section */}
      <section className="explore-content-section">
        <div className="container">
          {error && (
            <ErrorMessage
              title="Unable to load blogs"
              message={error}
              onRetry={() => loadBlogs(searchQuery, selectedCategory)}
            />
          )}

          {loading ? (
            <div className="explore-loading-wrapper">
              <Loading message="Loading blogs from server..." size="lg" />
            </div>
          ) : blogs.length > 0 ? (
            <div className="explore-grid">
              {blogs.map((blog) => (
                <BlogCard key={blog.id || blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Compass}
              title={searchQuery || selectedCategory !== 'All' ? 'No matching blogs found' : 'No blogs available yet'}
              description={
                searchQuery || selectedCategory !== 'All'
                  ? `We couldn't find any blogs matching your current filters. Try searching for a different keyword or resetting your filter.`
                  : 'No blogs have been published to the platform yet. Be the first writer to publish an inspiring story!'
              }
              actionText={searchQuery || selectedCategory !== 'All' ? 'Reset Filters' : 'Start Writing'}
              actionLink={searchQuery || selectedCategory !== 'All' ? undefined : '/create-blog'}
              onAction={searchQuery || selectedCategory !== 'All' ? handleClearFilters : undefined}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Explore;
