export interface TMDBMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
}

export interface TMDBTVResult {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
}

const API_KEY = (import.meta as any).env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbService = {
  /**
   * Search for a movie by title
   */
  async searchMovie(query: string): Promise<TMDBMovieResult[]> {
    if (!API_KEY || API_KEY === 'your_tmdb_api_key_here') {
      console.warn('TMDB API Key is missing. Please add it to your .env file.');
      return [];
    }
    
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      return [];
    }
  },

  /**
   * Search for a TV show by title
   */
  async searchTV(query: string): Promise<TMDBTVResult[]> {
    if (!API_KEY || API_KEY === 'your_tmdb_api_key_here') {
      console.warn('TMDB API Key is missing. Please add it to your .env file.');
      return [];
    }

    try {
      const response = await fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      return [];
    }
  },

  /**
   * Returns the full URL for a TMDB image path
   */
  getImageUrl(path: string | null, size: 'w200' | 'w500' | 'original' = 'w500'): string {
    if (!path) return ''; // Add a placeholder image path here if you want
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
};
