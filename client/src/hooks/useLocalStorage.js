// hooks/useLocalStorage.js - Local Storage Hook with Error Handling
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The key to store the value under in localStorage
 * @param {any} initialValue - The initial value to use if no value is found in localStorage
 * @returns {Array} - [storedValue, setValue] similar to useState
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Hook for managing arrays in localStorage (useful for favorites, cart items, etc.)
 * @param {string} key - The key to store the array under in localStorage
 * @param {Array} initialValue - The initial array value
 * @returns {Object} - Object with array operations
 */
export const useLocalStorageArray = (key, initialValue = []) => {
  const [items, setItems] = useLocalStorage(key, initialValue);

  const addItem = (item) => {
    setItems(prevItems => {
      if (!prevItems.includes(item)) {
        return [...prevItems, item];
      }
      return prevItems;
    });
  };

  const removeItem = (item) => {
    setItems(prevItems => prevItems.filter(i => i !== item));
  };

  const toggleItem = (item) => {
    setItems(prevItems => {
      if (prevItems.includes(item)) {
        return prevItems.filter(i => i !== item);
      } else {
        return [...prevItems, item];
      }
    });
  };

  const clearItems = () => {
    setItems([]);
  };

  const hasItem = (item) => {
    return items.includes(item);
  };

  return {
    items,
    setItems,
    addItem,
    removeItem,
    toggleItem,
    clearItems,
    hasItem,
    count: items.length
  };
};

/**
 * Hook for managing objects in localStorage with merge functionality
 * @param {string} key - The key to store the object under in localStorage
 * @param {Object} initialValue - The initial object value
 * @returns {Array} - [storedObject, updateObject, resetObject]
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
  const [storedObject, setStoredObject] = useLocalStorage(key, initialValue);

  const updateObject = (updates) => {
    setStoredObject(prevObject => ({
      ...prevObject,
      ...updates
    }));
  };

  const resetObject = () => {
    setStoredObject(initialValue);
  };

  const updateProperty = (property, value) => {
    setStoredObject(prevObject => ({
      ...prevObject,
      [property]: value
    }));
  };

  return [storedObject, updateObject, resetObject, updateProperty];
};

/**
 * Hook for managing user preferences in localStorage
 * @returns {Object} - Object with preference management functions
 */
export const useUserPreferences = () => {
  const [preferences, updatePreferences, resetPreferences] = useLocalStorageObject('userPreferences', {
    theme: 'light',
    currency: 'INR',
    language: 'en',
    viewMode: 'grid',
    notificationsEnabled: true,
    autoSave: true
  });

  const setTheme = (theme) => updatePreferences({ theme });
  const setCurrency = (currency) => updatePreferences({ currency });
  const setLanguage = (language) => updatePreferences({ language });
  const setViewMode = (viewMode) => updatePreferences({ viewMode });
  const toggleNotifications = () => updatePreferences({ 
    notificationsEnabled: !preferences.notificationsEnabled 
  });

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    setTheme,
    setCurrency,
    setLanguage,
    setViewMode,
    toggleNotifications
  };
};

/**
 * Hook for managing recent searches
 * @param {number} maxItems - Maximum number of recent searches to keep
 * @returns {Object} - Object with recent search management
 */
export const useRecentSearches = (maxItems = 10) => {
  const [searches, setSearches] = useLocalStorage('recentSearches', []);

  const addSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return;

    setSearches(prevSearches => {
      const filteredSearches = prevSearches.filter(term => 
        term.toLowerCase() !== searchTerm.toLowerCase()
      );
      
      const newSearches = [searchTerm, ...filteredSearches];
      return newSearches.slice(0, maxItems);
    });
  };

  const removeSearch = (searchTerm) => {
    setSearches(prevSearches => 
      prevSearches.filter(term => term !== searchTerm)
    );
  };

  const clearSearches = () => {
    setSearches([]);
  };

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches
  };
};

/**
 * Hook for managing form data persistence
 * @param {string} formName - Unique name for the form
 * @param {Object} initialData - Initial form data
 * @returns {Object} - Object with form data management
 */
export const usePersistedForm = (formName, initialData = {}) => {
  const [formData, setFormData] = useLocalStorage(`form_${formName}`, initialData);

  const updateField = (fieldName, value) => {
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
  };

  const updateFields = (updates) => {
    setFormData(prevData => ({
      ...prevData,
      ...updates
    }));
  };

  const resetForm = () => {
    setFormData(initialData);
  };

  const clearForm = () => {
    setFormData({});
  };

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm,
    clearForm
  };
};

// Export default hook
export default useLocalStorage;
