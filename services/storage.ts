import { MovieEntry } from '../types';

let cachedEntries: MovieEntry[] | null = null;

// Load entries from JSON file (public/movies.json)
export const loadEntriesFromJSON = async (): Promise<MovieEntry[]> => {
  try {
    const response = await fetch('/movies.json');
    if (!response.ok) {
      throw new Error('Failed to load movies data');
    }
    const data = await response.json();
    cachedEntries = data;
    return data;
  } catch (error) {
    console.error('Error loading movies:', error);
    return [];
  }
};

// Helper to get entries (sync version - returns cached or empty)
export const getEntries = (): MovieEntry[] => {
  return cachedEntries || [];
};

// Async version for initial load
export const getEntriesAsync = async (): Promise<MovieEntry[]> => {
  if (cachedEntries) {
    return cachedEntries;
  }
  return await loadEntriesFromJSON();
};

// No-op for saveEntries since we use static JSON
export const saveEntries = (entries: MovieEntry[]): void => {
  console.log("Static mode: changes are not saved. Edit public/movies.json directly.");
};
