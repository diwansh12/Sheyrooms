// components/Accessibility/SkipToContent.jsx - Accessibility Component
import React from 'react';

const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-3 rounded-br-lg z-50 transition-all"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
