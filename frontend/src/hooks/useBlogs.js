import { useState, useEffect, useCallback } from 'react';

/**
 * Reusable hook for loading async blog data with loading, error, and empty states.
 * @param {Function} fetchFn - An async function that returns blog data from blogService
 * @param {Array} deps - Dependency array to trigger refetching
 */
export const useBlogs = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      // Clean error presentation for when backend is offline or returns error
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load blogs from the server. Please verify backend connection.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export default useBlogs;
