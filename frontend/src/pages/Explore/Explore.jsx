import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import articleService from '../../services/articleService';
import publicationService from '../../services/publicationService';
import SearchBar from '../../components/SearchBar/SearchBar';
import ArticleCard from '../../components/ArticleCard/ArticleCard';
import PublicationCard from '../../components/PublicationCard/PublicationCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './Explore.css';

const DEFAULT_CATEGORIES = ['All', 'Technology', 'Writing', 'Culture', 'Design', 'Productivity', 'Business'];

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || 'All';
  const urlType = searchParams.get('type') || 'stories'; // 'stories' | 'publications'

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [exploreType, setExploreType] = useState(urlType);

  const [articles, setArticles] = useState([]);
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with search params changes
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setExploreType(searchParams.get('type') || 'stories');
  }, [searchParams]);

  // Load Categories on mount
  useEffect(() => {
    publicationService.getCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(['All', ...cats]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch articles or publications
  const loadContent = useCallback(async (query, category, type) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (category && category !== 'All') params.category = category;

      if (type === 'publications') {
        const data = await publicationService.getPublications(params);
        setPublications(data?.publications || []);
      } else {
        const data = await articleService.getArticles(params);
        setArticles(data?.articles || []);
      }
    } catch (err) {
      if (type === 'publications') {
        setPublications([]);
      } else {
        setArticles([]);
      }
      setError(err.response?.data?.message || 'Failed to fetch content from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent(searchQuery, selectedCategory, exploreType);
  }, [loadContent, searchQuery, selectedCategory, exploreType]);

  const updateFilters = (newQuery, newCategory, newType) => {
    const params = {};
    if (newQuery) params.q = newQuery;
    if (newCategory && newCategory !== 'All') params.category = newCategory;
    if (newType && newType !== 'stories') params.type = newType;
    setSearchParams(params);
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    updateFilters(query, selectedCategory, exploreType);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateFilters(searchQuery, category, exploreType);
  };

  const handleTypeChange = (type) => {
    setExploreType(type);
    updateFilters(searchQuery, selectedCategory, type);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    updateFilters('', 'All', exploreType);
  };

  return (
    <div className="explore-page">
      {/* Explore Header */}
      <section className="explore-header-section">
        <div className="container">
          <div className="explore-header-content">
            <h1 className="explore-title headline-editorial">Explore Stories and Publications</h1>
            <p className="explore-subtitle">
              Discover independent publications, long-form essays, and ideas from worldwide creators.
            </p>

            <div className="explore-search-wrapper">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                placeholder="Search by title, topic, or keyword..."
              />
            </div>

            {/* Type Switcher: Stories vs Publications */}
            <div className="explore-type-switcher">
              <button
                type="button"
                onClick={() => handleTypeChange('stories')}
                className={`type-switcher-btn ${exploreType === 'stories' ? 'is-active' : ''}`}
              >
                Stories
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('publications')}
                className={`type-switcher-btn ${exploreType === 'publications' ? 'is-active' : ''}`}
              >
                Publications
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter UI */}
      <section className="category-filter-section" aria-label="Explore Categories">
        <div className="container">
          <div className="category-filter-bar">
            <span className="category-filter-label">Category:</span>
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

      {/* Content Stream */}
      <main className="explore-content-section">
        <div className="container">
          {error && (
            <ErrorMessage
              title="Unable to load content"
              message={error}
              onRetry={() => loadContent(searchQuery, selectedCategory, exploreType)}
            />
          )}

          {loading ? (
            <div className="explore-loading-wrapper">
              <Loading
                message={exploreType === 'publications' ? 'Loading publications...' : 'Loading stories...'}
                size="lg"
              />
            </div>
          ) : exploreType === 'publications' ? (
            publications.length > 0 ? (
              <div className="explore-pubs-grid">
                {publications.map((pub) => (
                  <PublicationCard key={pub._id || pub.id} publication={pub} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={searchQuery || selectedCategory !== 'All' ? 'No publications found' : 'No publications launched yet'}
                description={
                  searchQuery || selectedCategory !== 'All'
                    ? 'No publications matched your search criteria. Try a different query or reset your filters.'
                    : 'Be the first writer to launch an independent publication on WriteWave!'
                }
                actionText={searchQuery || selectedCategory !== 'All' ? 'Reset Filters' : 'Launch Publication'}
                actionLink={searchQuery || selectedCategory !== 'All' ? undefined : '/create-publication'}
                onAction={searchQuery || selectedCategory !== 'All' ? handleClearFilters : undefined}
              />
            )
          ) : articles.length > 0 ? (
            <div className="explore-articles-stream">
              {articles.map((article) => (
                <ArticleCard key={article._id || article.id} article={article} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={searchQuery || selectedCategory !== 'All' ? 'No matching stories found' : 'No stories published yet'}
              description={
                searchQuery || selectedCategory !== 'All'
                  ? 'We could not find any stories matching your current filters. Try searching with a different keyword or resetting your filter.'
                  : 'No stories have been published yet. Be the first writer to share an inspiring story!'
              }
              actionText={searchQuery || selectedCategory !== 'All' ? 'Reset Filters' : 'Start Writing'}
              actionLink={searchQuery || selectedCategory !== 'All' ? undefined : '/write'}
              onAction={searchQuery || selectedCategory !== 'All' ? handleClearFilters : undefined}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Explore;