// hooks/useInfiniteScroll.js - Infinite Scroll Hook
import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = ({
  fetchMore,
  hasNextPage = true,
  threshold = 200,
  rootMargin = '100px',
  enabled = true
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScroll = useCallback(() => {
    if (!enabled || !hasNextPage || isFetching || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

    if (isNearBottom) {
      setIsFetching(true);
    }
  }, [enabled, hasNextPage, isFetching, isLoading, threshold]);

  const loadMore = useCallback(async () => {
    if (!isFetching || !fetchMore) return;

    try {
      setIsLoading(true);
      setError(null);
      await fetchMore();
    } catch (err) {
      console.error('Error loading more items:', err);
      setError(err.message || 'Failed to load more items');
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [isFetching, fetchMore]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (!enabled) return;

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [handleScroll, enabled]);

  const reset = useCallback(() => {
    setIsFetching(false);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isFetching,
    isLoading,
    error,
    reset
  };
};

// Enhanced version with Intersection Observer API
export const useInfiniteScrollObserver = ({
  fetchMore,
  hasNextPage = true,
  enabled = true,
  rootMargin = '100px',
  threshold = 0.1
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetRef, setTargetRef] = useState(null);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasNextPage || isFetching || isLoading || !fetchMore) return;

    try {
      setIsFetching(true);
      setIsLoading(true);
      setError(null);
      await fetchMore();
    } catch (err) {
      console.error('Error loading more items:', err);
      setError(err.message || 'Failed to load more items');
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [enabled, hasNextPage, isFetching, isLoading, fetchMore]);

  useEffect(() => {
    if (!targetRef || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetching && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    );

    observer.observe(targetRef);

    return () => {
      if (targetRef) {
        observer.unobserve(targetRef);
      }
    };
  }, [targetRef, enabled, hasNextPage, isFetching, isLoading, loadMore, rootMargin, threshold]);

  const reset = useCallback(() => {
    setIsFetching(false);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    targetRef: setTargetRef,
    isFetching,
    isLoading,
    error,
    reset
  };
};

// Utility throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// React component for infinite scroll trigger
export const InfiniteScrollTrigger = ({ 
  onLoadMore, 
  hasNextPage, 
  loading, 
  error,
  className = '',
  children 
}) => {
  const { targetRef, isLoading, error: scrollError } = useInfiniteScrollObserver({
    fetchMore: onLoadMore,
    hasNextPage,
    enabled: !loading
  });

  return (
    <div ref={targetRef} className={`infinite-scroll-trigger ${className}`}>
      {children || (
        <div className="text-center py-4">
          {(loading || isLoading) && (
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span>Loading more rooms...</span>
            </div>
          )}
          
          {(error || scrollError) && (
            <div className="alert alert-warning">
              <small>{error || scrollError}</small>
            </div>
          )}
          
          {!hasNextPage && !loading && !isLoading && (
            <small className="text-muted">No more rooms to load</small>
          )}
        </div>
      )}
    </div>
  );
};

export default useInfiniteScroll;
