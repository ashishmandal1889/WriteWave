/**
 * Formats a date string into a clean, human-readable format.
 * Returns a fallback if the date is missing or invalid.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return '';
  }
};

/**
 * Calculates estimated reading time from word count.
 */
export const calculateReadingTime = (content) => {
  if (!content) return '1 min read';
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};
