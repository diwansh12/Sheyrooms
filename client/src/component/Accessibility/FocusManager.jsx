// components/Accessibility/FocusManager.jsx - Focus Management
import React, { useEffect, useRef } from 'react';

const FocusManager = ({ children, restoreFocus = true, autoFocus = false }) => {
  const containerRef = useRef();
  const previousActiveElement = useRef();

  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement;
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus, autoFocus]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Interactive content"
    >
      {children}
    </div>
  );
};

export default FocusManager;
