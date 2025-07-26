// hooks/useIntersectionObserver.js - Intersection Observer Hook
import { useEffect, useState, useRef } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef();

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

// LazyImage component using intersection observer
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.jpg',
  ...props 
}) => {
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div ref={targetRef} className={`relative overflow-hidden ${className}`}>
      {hasIntersected && (
        <>
          {/* Placeholder while loading */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          {/* Main image */}
          <img
            src={optimizeImageUrl(src)}
            alt={alt}
            className={`transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            {...props}
          />
          
          {/* Error fallback */}
          {imageError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Failed to load</div>
            </div>
          )}
        </>
      )}
      
      {!hasIntersected && (
        <div className="w-full h-full bg-gray-200" />
      )}
    </div>
  );
};
