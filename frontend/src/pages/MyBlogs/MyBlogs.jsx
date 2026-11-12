import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, BookOpen, Trash2, Plus, AlertCircle } from 'lucide-react';
import blogService from '../../services/blogService';
import BlogCard from '../../components/BlogCard/BlogCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './MyBlogs.css';

export const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const loadMyBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getMyBlogs();
      const list = Array.isArray(response) ? response : (response?.content || response?.blogs || []);
      setBlogs(list);
    } catch (err) {
      if (err.response) {
        setError(err.response?.data?.message || 'Failed to load your blogs.');
      } else {
        // Backend offline / not connected yet
        setBlogs([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyBlogs();
  }, [loadMyBlogs]);

  const handleEdit = (blog) => {
    const blogId = blog.id || blog._id;
    navigate(`/edit-blog/${blogId}`);
  };

  const confirmDelete = (blogId) => {
    setDeleteCandidate(blogId);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await blogService.deleteBlog(deleteCandidate);
      setBlogs((prev) => prev.filter((b) => (b.id || b._id) !== deleteCandidate));
      setDeleteCandidate(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete blog. Please check backend connection.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="my-blogs-page">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Blogs</h1>
            <p className="dashboard-subtitle">
              Manage, edit, and publish your personal articles and essays.
            </p>
          </div>

          <Link to="/create-blog" className="btn btn-primary">
            <Plus size={16} />
            <span>Create New Blog</span>
          </Link>
        </div>

        {error && (
          <ErrorMessage
            title="Unable to load your dashboard"
            message={error}
            onRetry={loadMyBlogs}
          />
        )}

        {/* Dashboard Content */}
        {loading ? (
          <div className="my-blogs-loading">
            <Loading message="Loading your articles..." size="lg" />
          </div>
        ) : blogs.length > 0 ? (
          <div className="my-blogs-grid">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id || blog._id}
                blog={blog}
                showActions
                onEdit={handleEdit}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="You haven't published anything yet"
            description="Your author dashboard is empty. Put pen to digital paper and share your unique voice with the WriteWave community!"
            actionText="Create New Blog"
            actionLink="/create-blog"
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="delete-dialog-overlay" onClick={() => !isDeleting && setDeleteCandidate(null)}>
          <div className="delete-dialog-card card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <div className="delete-dialog-icon">
                <Trash2 size={24} />
              </div>
              <h3 className="delete-dialog-title">Delete this blog?</h3>
            </div>
            <p className="delete-dialog-desc">
              Are you sure you want to permanently delete this blog post? This action cannot be undone.
            </p>
            <div className="delete-dialog-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirmed}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Blog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBlogs;
