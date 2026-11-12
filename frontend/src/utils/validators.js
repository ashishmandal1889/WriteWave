/**
 * Common validation utilities for WriteWave forms.
 */

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  // Standard RFC 5322 compatible regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Enter a valid email address (e.g. name@example.com).';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return '';
};

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return 'Full name is required.';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return '';
};

export const validateBlogTitle = (title) => {
  if (!title || !title.trim()) {
    return 'Blog title is required.';
  }
  if (title.trim().length < 5) {
    return 'Title must be at least 5 characters long.';
  }
  if (title.trim().length > 150) {
    return 'Title must not exceed 150 characters.';
  }
  return '';
};

export const validateBlogContent = (content) => {
  if (!content || !content.trim()) {
    return 'Blog content is required.';
  }
  if (content.trim().length < 20) {
    return 'Blog content must be at least 20 characters long.';
  }
  return '';
};

export const validateUrl = (url) => {
  if (!url || !url.trim()) return ''; // Optional
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Image URL must start with http:// or https://.';
    }
    return '';
  } catch {
    return 'Please enter a valid web URL.';
  }
};
