export type MediaType = 'movie' | 'tv';
export type WatchStatus = 'watched' | 'upcoming';

export interface Episode {
  number: number;
  title: string;
  summary: string;
  date?: string; // ISO date string when the episode was watched
  ratings?: DualRating; // Individual ratings for this episode
  status?: 'watched' | 'upcoming'; // Per-user episode watch status stored separately
}

export interface VideoMedia {
  title: string;
  url: string; // Local file path or embed URL
  type?: 'local' | 'embed'; // 'local' for file path, 'embed' for YouTube
}

export interface Comment {
  id: string;
  user: 'jojo' | 'dodo';
  text: string;
  date: string; // ISO date string
}

export interface DualRating {
  jojo: number; // 1-5 rating from JoJo
  dodo: number; // 1-5 rating from DoDo
}

export interface MovieEntry {
  id: string;
  title: string;
  originalTitle?: string; // Original title in another language
  type: MediaType;
  status: WatchStatus;
  genres?: string[];
  date: string; // ISO string for sorting
  rating?: number; // 1-5, average rating (for backward compatibility)
  ratings?: DualRating; // Individual ratings from JoJo and DoDo
  story?: string; // Memory/Story, only for watched
  reason?: string; // Reason to watch, only for upcoming
  posterUrl?: string; // Web URL (https://...) or Local Path (/images/movie.jpg)
  duration?: string; // e.g., "2h 11m"
  episodeRuntimeMinutes?: number; // Per-episode runtime for TV shows, e.g., 120
  episodes?: Episode[]; // Array of episodes for TV shows
  captures?: string[]; // Array of image URLs for the gallery
  videos?: VideoMedia[]; // Array of video movies/trailers (local files or embeds)
  watchProgress?: number; // Seconds watched for resume feature
  comments?: Comment[]; // Array of comments on the entry
}

export type SortOption = 'date-desc' | 'date-asc' | 'rating-desc';
export type FilterType = 'all' | 'movie' | 'tv';

export interface ViewState {
  current: 'home' | 'details';
  selectedId?: string;
}