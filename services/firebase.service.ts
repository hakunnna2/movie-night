import { database } from './firebase.config';
import { ref, set, get, update } from 'firebase/database';
import { MovieEntry } from '../types';

export interface CommentMessage {
  id: string;
  text: string;
  sender: 'shared' | 'jojo' | 'dodo';
  createdAt: number;
}

export interface UserProgress {
  ratings?: {
    [movieId: string]: {
      jojo?: number;
      dodo?: number;
    };
  };
  watchProgress?: {
    [movieId: string]: number; // percentage watched
  };
  watchStatus?: {
    [movieId: string]: boolean; // watched or not
  };
  episodeProgress?: {
    [movieId: string]: {
      jojo?: number;
      dodo?: number;
    };
  };
  episodeRatings?: {
    [movieId: string]: {
      [episodeKey: string]: {
        jojo?: number;
        dodo?: number;
      };
    };
  };
  episodeStatus?: {
    [movieId: string]: {
      [episodeKey: string]: {
        jojo?: 'watched' | 'upcoming';
        dodo?: 'watched' | 'upcoming';
      };
    };
  };
  comments?: {
    [movieId: string]: {
      shared?: CommentMessage[] | string;
      jojo?: CommentMessage[] | string;
      dodo?: CommentMessage[] | string;
    };
  };
}

// Generate or get a unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device-id');
  if (!deviceId) {
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device-id', deviceId);
  }
  return deviceId;
};

const deviceId = getDeviceId();
const userProgressRef = ref(database, `users/${deviceId}`);

// Save user progress to Firebase
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    await set(userProgressRef, progress);
  } catch (error) {
    console.error('Error saving progress to Firebase:', error);
    throw error;
  }
};

// Load user progress from Firebase
export const loadUserProgress = async (): Promise<UserProgress | null> => {
  try {
    const snapshot = await get(userProgressRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserProgress;
    }
    return null;
  } catch (error) {
    console.error('Error loading progress from Firebase:', error);
    return null;
  }
};

// Update specific rating (JoJo or DoDo)
export const updateRating = async (movieId: string, person: 'jojo' | 'dodo', rating: number): Promise<void> => {
  try {
    const ratingRef = ref(database, `users/${deviceId}/ratings/${movieId}/${person}`);
    await set(ratingRef, rating);
  } catch (error) {
    // Firebase database might not be enabled, but continue gracefully
    if (error instanceof Error && error.message.includes('PERMISSION_DENIED')) {
      console.warn('Firebase permission denied. Database rules may not be configured.');
    } else {
      console.warn('Error updating rating:', error);
    }
    // Don't throw - let the app continue even if Firebase fails
  }
};

// Update watch progress
export const updateWatchProgress = async (movieId: string, progress: number): Promise<void> => {
  try {
    const progressRef = ref(database, `users/${deviceId}/watchProgress/${movieId}`);
    await set(progressRef, progress);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating watch progress (Firebase may not be enabled):', error);
  }
};

// Update watch status
export const updateWatchStatus = async (movieId: string, isWatched: boolean): Promise<void> => {
  try {
    const statusRef = ref(database, `users/${deviceId}/watchStatus/${movieId}`);
    await set(statusRef, isWatched);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating watch status (Firebase may not be enabled):', error);
  }
};

// Update episode progress for TV shows (per user)
export const updateEpisodeProgress = async (movieId: string, user: 'jojo' | 'dodo', episodeIndex: number): Promise<void> => {
  try {
    const episodeRef = ref(database, `users/${deviceId}/episodeProgress/${movieId}/${user}`);
    await set(episodeRef, episodeIndex);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating episode progress (Firebase may not be enabled):', error);
  }
};

// Update episode rating for TV shows
export const updateEpisodeRating = async (movieId: string, episodeNumber: number, user: 'jojo' | 'dodo', rating: number): Promise<void> => {
  try {
    const episodeRatingRef = ref(database, `users/${deviceId}/episodeRatings/${movieId}/ep${episodeNumber}/${user}`);
    await set(episodeRatingRef, rating);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating episode rating (Firebase may not be enabled):', error);
  }
};

// Update episode status for TV shows (watched/upcoming)
export const updateEpisodeStatus = async (movieId: string, episodeNumber: number, user: 'jojo' | 'dodo', status: 'watched' | 'upcoming'): Promise<void> => {
  try {
    const episodeStatusRef = ref(database, `users/${deviceId}/episodeStatus/${movieId}/ep${episodeNumber}/${user}`);
    await set(episodeStatusRef, status);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating episode status (Firebase may not be enabled):', error);
  }
};

// Update comment thread for movie/series (shared or per user)
export const updateComment = async (movieId: string, scope: 'shared' | 'jojo' | 'dodo', comments: CommentMessage[]): Promise<void> => {
  try {
    const commentRef = ref(database, `users/${deviceId}/comments/${movieId}/${scope}`);
    await set(commentRef, comments);
  } catch (error) {
    console.warn('Error updating comment (Firebase may not be enabled):', error);
  }
};

// Save movie entries to Firebase
export const saveMovieEntries = async (entries: MovieEntry[]): Promise<void> => {
  try {
    const entriesRef = ref(database, `users/${deviceId}/movieEntries`);
    await set(entriesRef, entries);
  } catch (error) {
    console.warn('Error saving movie entries to Firebase:', error);
    throw error;
  }
};

// Load movie entries from Firebase
export const loadMovieEntries = async (): Promise<MovieEntry[] | null> => {
  try {
    const entriesRef = ref(database, `users/${deviceId}/movieEntries`);
    const snapshot = await get(entriesRef);
    if (snapshot.exists()) {
      return snapshot.val() as MovieEntry[];
    }
    return null;
  } catch (error) {
    console.warn('Error loading movie entries from Firebase:', error);
    return null;
  }
};
