/**
 * Loads data from localStorage with a fallback default value.
 * @param {string} key - The localStorage key.
 * @param {any} defaultValue - Fallback value if no data exists.
 * @returns {any} The parsed data or default value.
 */
export const loadState = (key, defaultValue) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return defaultValue;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error(`Error loading state for key "${key}":`, err);
    return defaultValue;
  }
};

/**
 * Saves data to localStorage.
 * @param {string} key - The localStorage key.
 * @param {any} state - The data to save.
 */
export const saveState = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    console.error(`Error saving state for key "${key}":`, err);
  }
};
