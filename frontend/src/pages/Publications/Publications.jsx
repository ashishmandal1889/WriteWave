import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import publicationService from '../../services/publicationService';
import PublicationCard from '../../components/PublicationCard/PublicationCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import SearchBar from '../../components/SearchBar/SearchBar';
import './Publications.css';

export const Publications = () => {
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPublications = useCallback(async (search = searchQuery, category = selectedCategory) => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;

      const data = await publicationService.getPublications(params);
      setPublications(data?.publications || []);
    } catch {
      setPublications([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    loadPublications(searchQuery, selectedCategory);

    publicationService.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(['All', ...cats]);
      }
    }).catch(() => {});
  }, [loadPublications]);

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    loadPublications(query, selectedCategory);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    loadPublications(searchQuery, cat);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    loadPublications('', 'All');
  };

  return (
    <div className="publications-page">
      <header className="publications-header">
        <div className="container">
          <div className="publications-header-content">
            <h1 className="publications-title headline-editorial">
              Independent Publications
            </h1>
            <p className="publications-subtitle">
              Discover newsletters, essays, and serialized writing from passionate creators.
            </p>

            <div className="publications-search-box">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                placeholder="Search publications by title or topic..."
              />
            </div>
          </div>
        </div>
      </header>

      {/* Category Pills Bar */}
      <section className="publications-filter-section" aria-label="Publication Categories">
        <div className="container">
          <div className="publications-filter-bar">
            <span className="filter-label">Category:</span>
            <div className="filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`filter-pill ${selectedCategory === cat ? 'is-active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Publications Listing Grid */}
      <main className="publications-list-section">
        <div className="container">
          <div className="publications-action-bar">
            <span className="results-count">
              {publications.length} {publications.length === 1 ? 'publication' : 'publications'} available
            </span>
            <Link to="/create-publication" className="btn btn-primary btn-sm">
              Create Publication
            </Link>
          </div>

          {loading ? (
            <div className="section-loading">
              <Loading message="Loading publications..." size="lg" />
            </div>
          ) : publications.length > 0 ? (
            <div className="publications-grid">
              {publications.map((pub) => (
                <PublicationCard key={pub._id || pub.id} publication={pub} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={searchQuery || selectedCategory !== 'All' ? 'No matching publications found' : 'No publications yet'}
              description={
                searchQuery || selectedCategory !== 'All'
                  ? 'No publications matched your current search or category filter.'
                  : 'Start your own independent publication today and begin building your subscriber base.'
              }
              actionText={searchQuery || selectedCategory !== 'All' ? 'Clear Filters' : 'Create Publication'}
              actionLink={searchQuery || selectedCategory !== 'All' ? undefined : '/create-publication'}
              onAction={searchQuery || selectedCategory !== 'All' ? handleClearFilters : undefined}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Publications;
