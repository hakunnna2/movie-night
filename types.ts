export type MediaType = 'movie' | 'tv';
export type WatchStatus = 'watched' | 'upcoming';

export interface Episode {
  number: number;
  title: string;
  summary: string;
}

export interface VideoMedia {
  title: string;
  url: string; // Local file path or embed URL
  type?: 'local' | 'embed'; // 'local' for file path, 'embed' for YouTube
}

export interface MovieEntry {
  id: string;
  title: string;
  type: MediaType;
  status: WatchStatus;
  genres?: string[];
  date: string; // ISO string for sorting
  rating?: number; // 1-5, only for watched
  story?: string; // Memory/Story, only for watched
  reason?: string; // Reason to watch, only for upcoming
  posterUrl?: string; // Web URL (https://...) or Local Path (/images/movie.jpg)
  duration?: string; // e.g., "2h 11m"
  episodes?: Episode[]; // Array of episodes for TV shows
  captures?: string[]; // Array of image URLs for the gallery
  videos?: VideoMedia[]; // Array of video movies/trailers (local files or embeds)
}

export type SortOption = 'date-desc' | 'date-asc' | 'rating-desc';
export type FilterType = 'all' | 'movie' | 'tv';

export interface ViewState {
  current: 'home' | 'details';
  selectedId?: string;
}