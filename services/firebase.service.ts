import { database } from './firebase.config';
import { ref, set, get, onValue } from 'firebase/database';
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

const getDbRef = (path: string) => {
  if (!database) return null;
  return ref(database, path);
};

const logFirebaseUnavailable = (context: string): void => {
  console.warn(`${context}: Firebase Realtime Database is not configured.`);
};

// Save user progress to Firebase
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  const userProgressRef = getDbRef(`users/${deviceId}`);
  if (!userProgressRef) {
    logFirebaseUnavailable('saveUserProgress');
    return;
  }

  try {
    await set(userProgressRef, progress);
  } catch (error) {
    console.error('Error saving progress to Firebase:', error);
    throw error;
  }
};

// Load user progress from Firebase
export const loadUserProgress = async (): Promise<UserProgress | null> => {
  const userProgressRef = getDbRef(`users/${deviceId}`);
  const sharedRatingsRef = getDbRef('shared/ratings');
  if (!userProgressRef || !sharedRatingsRef) {
    logFirebaseUnavailable('loadUserProgress');
    return null;
  }

  try {
    const snapshot = await get(userProgressRef);
    const baseProgress = snapshot.exists() ? (snapshot.val() as UserProgress) : {};

    // Ratings are shared across all users/devices.
    const sharedRatingsSnapshot = await get(sharedRatingsRef);
    if (sharedRatingsSnapshot.exists()) {
      return {
        ...baseProgress,
        ratings: sharedRatingsSnapshot.val() as UserProgress['ratings'],
      };
    }

    // Fallback/migration from older per-device ratings path.
    const legacyRatingsRef = getDbRef(`users/${deviceId}/ratings`);
    if (!legacyRatingsRef) {
      return Object.keys(baseProgress).length > 0 ? baseProgress : null;
    }
    const legacyRatingsSnapshot = await get(legacyRatingsRef);
    if (legacyRatingsSnapshot.exists()) {
      const legacyRatings = legacyRatingsSnapshot.val() as UserProgress['ratings'];
      try {
        await set(sharedRatingsRef, legacyRatings);
      } catch (migrationError) {
        console.warn('Failed to migrate legacy ratings to shared path:', migrationError);
      }
      return {
        ...baseProgress,
        ratings: legacyRatings,
      };
    }

    return Object.keys(baseProgress).length > 0 ? baseProgress : null;
  } catch (error) {
    console.error('Error loading progress from Firebase:', error);
    return null;
  }
};

// Update specific rating (JoJo or DoDo)
export const updateRating = async (movieId: string, person: 'jojo' | 'dodo', rating: number): Promise<void> => {
  const ratingRef = getDbRef(`shared/ratings/${movieId}/${person}`);
  if (!ratingRef) {
    logFirebaseUnavailable('updateRating');
    return;
  }

  try {
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

export const subscribeSharedRating = (
  movieId: string,
  onUpdate: (rating: { jojo: number; dodo: number }) => void
): (() => void) => {
  const ratingRef = getDbRef(`shared/ratings/${movieId}`);
  if (!ratingRef) {
    logFirebaseUnavailable('subscribeSharedRating');
    onUpdate({ jojo: 0, dodo: 0 });
    return () => {};
  }

  try {
    const unsubscribe = onValue(
      ratingRef,
      (snapshot) => {
        const value = snapshot.val() as { jojo?: number; dodo?: number } | null;
        onUpdate({
          jojo: typeof value?.jojo === 'number' ? value.jojo : 0,
          dodo: typeof value?.dodo === 'number' ? value.dodo : 0,
        });
      },
      (error) => {
        console.warn('Realtime rating subscription failed:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to start realtime rating subscription:', error);
    return () => {};
  }
};

// Update watch progress
export const updateWatchProgress = async (movieId: string, progress: number): Promise<void> => {
  const progressRef = getDbRef(`users/${deviceId}/watchProgress/${movieId}`);
  if (!progressRef) {
    logFirebaseUnavailable('updateWatchProgress');
    return;
  }

  try {
    await set(progressRef, progress);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating watch progress (Firebase may not be enabled):', error);
  }
};

// Update watch status
export const updateWatchStatus = async (movieId: string, isWatched: boolean): Promise<void> => {
  const statusRef = getDbRef(`users/${deviceId}/watchStatus/${movieId}`);
  if (!statusRef) {
    logFirebaseUnavailable('updateWatchStatus');
    return;
  }

  try {
    await set(statusRef, isWatched);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating watch status (Firebase may not be enabled):', error);
  }
};

// Update episode progress for TV shows (per user)
export const updateEpisodeProgress = async (movieId: string, user: 'jojo' | 'dodo', episodeIndex: number): Promise<void> => {
  const episodeRef = getDbRef(`users/${deviceId}/episodeProgress/${movieId}/${user}`);
  if (!episodeRef) {
    logFirebaseUnavailable('updateEpisodeProgress');
    return;
  }

  try {
    await set(episodeRef, episodeIndex);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating episode progress (Firebase may not be enabled):', error);
  }
};

// Update episode rating for TV shows
export const updateEpisodeRating = async (movieId: string, episodeNumber: number, user: 'jojo' | 'dodo', rating: number): Promise<void> => {
  const episodeRatingRef = getDbRef(`users/${deviceId}/episodeRatings/${movieId}/ep${episodeNumber}/${user}`);
  if (!episodeRatingRef) {
    logFirebaseUnavailable('updateEpisodeRating');
    return;
  }

  try {
    await set(episodeRatingRef, rating);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating episode rating (Firebase may not be enabled):', error);
  }
};

// Update episode status for TV shows (watched/upcoming)
export const updateEpisodeStatus = async (movieId: string, episodeNumber: number, user: 'jojo' | 'dodo', status: 'watched' | 'upcoming'): Promise<void> => {
  const episodeStatusRef = getDbRef(`users/${deviceId}/episodeStatus/${movieId}/ep${episodeNumber}/${user}`);
  if (!episodeStatusRef) {
    logFirebaseUnavailable('updateEpisodeStatus');
    return;
  }

  try {
    await set(episodeStatusRef, status);
  } catch (error) {
    // Firebase not available - continue gracefully
    console.warn('Error updating episode status (Firebase may not be enabled):', error);
  }
};

// Update comment thread for movie/series (shared or per user)
export const updateComment = async (movieId: string, scope: 'shared' | 'jojo' | 'dodo', comments: CommentMessage[]): Promise<void> => {
  const commentRef = getDbRef(`users/${deviceId}/comments/${movieId}/${scope}`);
  if (!commentRef) {
    logFirebaseUnavailable('updateComment');
    return;
  }

  try {
    await set(commentRef, comments);
  } catch (error) {
    console.warn('Error updating comment (Firebase may not be enabled):', error);
  }
};

// Save movie entries to Firebase
export const saveMovieEntries = async (entries: MovieEntry[]): Promise<void> => {
  const sharedMovieEntriesRef = getDbRef('shared/movieEntries');
  if (!sharedMovieEntriesRef) {
    logFirebaseUnavailable('saveMovieEntries');
    return;
  }

  try {
    await set(sharedMovieEntriesRef, entries);
  } catch (error) {
    console.warn('Error saving movie entries to Firebase:', error);
    throw error;
  }
};

// Load movie entries from Firebase
export const loadMovieEntries = async (): Promise<MovieEntry[] | null> => {
  const sharedMovieEntriesRef = getDbRef('shared/movieEntries');
  if (!sharedMovieEntriesRef) {
    logFirebaseUnavailable('loadMovieEntries');
    return null;
  }

  try {
    const snapshot = await get(sharedMovieEntriesRef);
    if (snapshot.exists()) {
      return snapshot.val() as MovieEntry[];
    }

    // Fallback for older data that was saved per-device before shared entries existed.
    const legacyEntriesRef = getDbRef(`users/${deviceId}/movieEntries`);
    if (!legacyEntriesRef) {
      return null;
    }
    const legacySnapshot = await get(legacyEntriesRef);
    if (legacySnapshot.exists()) {
      const legacyEntries = legacySnapshot.val() as MovieEntry[];
      try {
        await set(sharedMovieEntriesRef, legacyEntries);
      } catch (migrationError) {
        console.warn('Failed to migrate legacy movie entries to shared path:', migrationError);
      }
      return legacyEntries;
    }

    return null;
  } catch (error) {
    console.warn('Error loading movie entries from Firebase:', error);
    return null;
  }
};

export const addMovieEntryToFirebase = async (entry: MovieEntry): Promise<void> => {
  try {
    const currentEntries = await loadMovieEntries() || [];
    currentEntries.push(entry);
    await saveMovieEntries(currentEntries);
  } catch (error) {
    console.warn('Error adding movie entry to Firebase:', error);
    throw error;
  }
};

