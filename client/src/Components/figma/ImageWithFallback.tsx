// src/Components/figma/ImageWithFallback.tsx
import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string | object | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  style,
  fallback = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop'
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // ✅ Debug what's being passed as src
    console.log('🖼️ ImageWithFallback received src:', src, 'Type:', typeof src);
    
    // Convert src to string if it's an object
    if (typeof src === 'string') {
      return src;
    }
    
    if (typeof src === 'object' && src !== null) {
      console.warn('⚠️ Object received as image src:', src);
      
      // Handle different object shapes
      if ('url' in src && typeof src.url === 'string') return src.url;
      if ('src' in src && typeof src.src === 'string') return src.src;
      if ('href' in src && typeof src.href === 'string') return src.href;
      
      // Handle character array URLs
      const chars: string[] = [];
      let index = 0;
      while (src[index as keyof typeof src] !== undefined) {
        chars.push(String(src[index as keyof typeof src]));
        index++;
      }
      const url = chars.join('');
      if (url.startsWith('http')) {
        console.log('✅ Reconstructed URL from object:', url);
        return url;
      }
      
      console.error('❌ Could not convert object to valid URL:', src);
    }
    
    console.warn('⚠️ Using fallback image for:', src);
    return fallback;
  });

  const handleError = () => {
    console.warn('❌ Image failed to load:', imgSrc);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', imgSrc);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

