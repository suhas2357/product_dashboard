import { useEffect, useState } from 'react';

/**
 * Returns a debounced value that only updates after `delay` ms of no changes.
 * Used so we don't fire a search request on every keystroke.
 */
export const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};