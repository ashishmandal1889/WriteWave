import React from 'react';
import './SearchBar.css';

export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search blogs by title, topic, or keyword...',
  className = ''
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    if (onSubmit) {
      onSubmit('');
    }
  };

  return (
    <form className={`search-bar-form ${className}`} onSubmit={handleSubmit} role="search">
      <div className="search-bar-inner">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search blogs"
          className="search-bar-input"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="search-bar-clear-btn"
            aria-label="Clear search input"
          >
            Clear
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary search-submit-btn">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
