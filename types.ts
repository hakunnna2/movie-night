export type MediaType = 'movie' | 'tv';
export type WatchStatus = 'watched' | 'upcoming';

export interface MovieEntry {
  id: string;
  title: string;
  type: MediaType;
  status: WatchStatus;
  date: string; // ISO string for sorting
  rating?: number; // 1-5, only for watched
  story?: string; // Memory/Story, only for watched
  reason?: string; // Reason to watch, only for upcoming
  posterUrl?: string; // Optional image URL
}

export type SortOption = 'date-desc' | 'date-asc' | 'rating-desc';
export type FilterType = 'all' | 'movie' | 'tv';

export interface ViewState {
  current: 'home' | 'add' | 'details';
  selectedId?: string;
}