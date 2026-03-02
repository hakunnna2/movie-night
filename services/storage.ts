 import { MovieEntry } from '../types';
import { CommentMessage, loadUserProgress, updateWatchProgress as firebaseUpdateProgress, updateRating as firebaseUpdateRating, updateEpisodeProgress as firebaseUpdateEpisodeProgress, updateEpisodeRating as firebaseUpdateEpisodeRating, updateEpisodeStatus as firebaseUpdateEpisodeStatus, updateComment as firebaseUpdateComment, saveMovieEntries, loadMovieEntries } from './firebase.service';

const MOVIES_DATA: MovieEntry[] = [
  {
    "id": "1",
    "title": "Exit 2019",
    "type": "movie",
    "status": "watched",
    "date": "2025-12-04",
    "rating": 4,
    "ratings": {
      "jojo": 4,
      "dodo": 4
    },
    "genres": ["Action", "Comedy", "Drama"],
    "duration": "1h 43m",
    "story": "We expected a light and funny movie night, but EXIT surprised us. When a strange toxic gas spreads through the city, two ordinary people are forced to escape using creativity, teamwork, and courage. The movie balances tension and humor really well, keeping us stressed and smiling at the same time. By the end, it felt hopeful and energetic, the kind of movie that makes a movie night memorable.",
    "posterUrl": "/assets/exit 2019/captures/exit 2019.jpg",
    "captures": [
      "/assets/exit 2019/captures/exit 2019.jpg",
      "/assets/exit 2019/captures/1.jpg",
      "/assets/exit 2019/captures/2.jpg",
      "/assets/exit 2019/captures/3.jpg",
      "/assets/exit 2019/captures/4.jpg",
      "/assets/exit 2019/captures/5.jpg",
      "/assets/exit 2019/captures/6.jpg",
      "/assets/exit 2019/captures/7.jpg",
      "/assets/exit 2019/captures/8.jpg"
    ],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1j2M3kB9Ie1jEHNGTyIxJ1JegYjUAedXm/view?usp=sharing", "type": "local" }
    ]
  },
  {
    "id": "2",
    "title": "Tunnel 2016",
    "type": "movie",
    "status": "watched",
    "date": "2025-12-12",
    "rating": 4,
    "ratings": {
      "jojo": 4,
      "dodo": 4
    },
    "genres": ["Drama", "Thriller"],
    "duration": "2h 06m",
    "story": "What started as a normal drive quickly turned into a tense movie night. After a tunnel suddenly collapses, one man is trapped underground with limited time and hope. While rescue teams struggle outside, the movie focuses on patience, mental strength, and the quiet fight to stay alive. It's a slow, heavy story that left us silent for a moment after it ended.",
    "posterUrl": "/assets/tunnel 2016/captures/tunnel 2016.jpg",
    "captures": [
      "/assets/tunnel 2016/captures/tunnel 2016.jpg",
      "/assets/tunnel 2016/captures/1.jpg",
      "/assets/tunnel 2016/captures/2.jpg",
      "/assets/tunnel 2016/captures/3.jpg"
    ],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1_S_3ksKV5ctu1_kjQXPXz2oh-hhwozKd/view?usp=sharing", "type": "local" }
    ]
  },
  {
    "id": "3",
    "title": "Walking to School 2009",
    "type": "movie",
    "status": "watched",
    "date": "2025-12-19",
    "rating": 5,
    "ratings": {
      "jojo": 5,
      "dodo": 5
    },
    "genres": ["Drama", "Family"],
    "duration": "1h 33m",
    "story": "This movie night was beautiful and emotional. It tells the story of two young siblings who travel a long, difficult path just to reach school in a remote mountain village. What starts as a simple journey becomes a powerful story about childhood, education, and the sacrifices people make to learn. It reminded us how lucky we are and left us quietly thinking after the credits rolled.",
    "posterUrl": "/assets/walking to school 2009/captures/walking to school 2009.jpg",
    "captures": [
      "/assets/walking to school 2009/captures/walking to school 2009.jpg"
    ],
    "videos": [
      { "title": "Movie", "url": "https://www.youtube.com/embed/TwMve9_LtbE?si=L3XOHO_pDZEhYzxZ", "type": "embed" }
    ]
  },
  {
    "id": "4",
    "title": "Home Alone 1990",
    "type": "movie",
    "status": "watched",
    "date": "2025-12-26",
    "rating": 5,
    "ratings": {
      "jojo": 5,
      "dodo": 5
    },
    "genres": ["Comedy", "Family"],
    "duration": "1h 43m",
    "story": "A perfect Christmas movie night! Home Alone is a classic we watched together, full of humor, clever traps, and holiday spirit. The story of young Kevin defending his home from two clumsy burglars never gets old, no matter how many times we've seen it. It's funny, heartwarming, and reminded us why this movie is a tradition for so many families around the world.",
    "posterUrl": "/assets/home alone 1990/captures/home alone 1990.jpg",
    "captures": [
      "/assets/home alone 1990/captures/home alone 1990.jpg",
      "/assets/home alone 1990/captures/1.jpg",
      "/assets/home alone 1990/captures/2.jpg",
      "/assets/home alone 1990/captures/3.jpg",
      "/assets/home alone 1990/captures/4.jpg"
    ],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1yF7GT_59NEPbfwZ2H59gWABF8pk5nzFH/view?usp=sharing", "type": "local" }
    ]
  },
  {
    "id": "5",
    "title": "Like Stars on Earth 2007",
    "type": "movie",
    "status": "upcoming",
    "date": "2026-01-02",
    "genres": ["Drama", "Family"],
    "duration": "2h 42m",
    "story": "This was one of those movie nights that stays with you. Like Stars on Earth follows a young boy struggling in school because he sees the world differently. When a teacher finally understands him, the movie becomes a touching story about empathy, learning, and recognizing the unique strengths in every child. We finished the movie in silence, moved by its message and its emotional ending.",
    "posterUrl": "/assets/like on stars on earth 2007/captures/Like Stars on Earth 2007.jpg",
    "captures": [
      "/assets/like on stars on earth 2007/captures/Like Stars on Earth 2007.jpg"
    ],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1kL7mH9Ii8JfGHNiJxKLlMnNoPqRsTuVw/preview", "type": "local" }
    ]
  },
  {
    "id": "6",
    "title": "Home Alone 2",
    "type": "movie",
    "status": "watched",
    "date": "2026-01-09",
    "rating": 5,
    "ratings": {
      "jojo": 5,
      "dodo": 5
    },
    "genres": ["Comedy", "Family"],
    "duration": "2h 00m",
    "story": "We continued the Home Alone tradition with the second part, and it was just as fun as the first. This time Kevin is lost in New York City during Christmas, facing the same burglars with even crazier traps and more laughs. The movie kept the same charm, humor, and heart, making it another perfect movie night filled with smiles and holiday spirit.",
    "posterUrl": "/assets/home alone 1992/captures/home alone 2.jpeg",
    "captures": [
      "/assets/home alone 1992/captures/home alone 2.jpeg"
    ],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1UvsqdxC-xjDJCorr7ON4rYndnzfQOHsE/view?usp=sharing", "type": "local" }
    ]
  },
  {
    "id": "7",
    "title": "Brother (Abi)",
    "originalTitle": "Abi",
    "type": "tv",
    "status": "watched",
    "date": "2026-03-04",
    "rating": 5,
    "ratings": {
      "jojo": 5,
      "dodo": 5
    },
    "genres": ["Drama", "Family", "Psychological"],
    "duration": "Weekly Series • 8 Episodes Available",
    "episodeRuntimeMinutes": 150,
    "story": "The Turkish series Abi (My Brother) revolves around the idea that family is a true test. It follows the story of Çağla, a lawyer who was pushed into her profession by the harshness of life and the absence of a real family. On the other side stands Doğan, a man from a large and wealthy family who ran away in an attempt to escape a past filled with secrets. But life forces a confrontation, and the doors to a deep relationship open, where each of them carries postponed wounds—wounds they can neither open nor close… wounds called family. New episodes air weekly.",
    "posterUrl": "/assets/ABIM/abi.png",
    "captures": [
      "/assets/ABIM/abi.png"
    ],
    "episodes": [
      {
        "number": 1,
        "title": "Episode 1",
        "summary": "The beginning of Çağla and Doğan's story. A chance encounter brings together two people from completely different worlds, setting the stage for a complex relationship built on secrets and unspoken wounds.",
        "date": "2026-01-13"
      },
      {
        "number": 2,
        "title": "Episode 2",
        "summary": "As their lives become more intertwined, Çağla and Doğan must confront the weight of their pasts. Family loyalties are tested, and the cracks in their facades begin to show.",
        "date": "2026-01-20"
      },
      {
        "number": 3,
        "title": "Episode 3",
        "summary": "Deeper revelations emerge about Doğan's wealthy family and the reasons he left. Çağla's professional and personal boundaries blur as she gets drawn further into his world.",
        "date": "2026-01-27"
      },
      {
        "number": 4,
        "title": "Episode 4",
        "summary": "The past refuses to stay buried. Both characters face choices that will define their futures, while the question of whether family is a blessing or a burden becomes more urgent.",
        "date": "2026-02-03"
      },
      {
        "number": 5,
        "title": "Episode 5",
        "summary": "Trust becomes the central theme as secrets threaten to destroy everything they've built. Both Çağla and Doğan must decide how much they're willing to sacrifice for the truth.",
        "date": "2026-02-10"
      },
      {
        "number": 6,
        "title": "Episode 6",
        "summary": "Confrontations reach a boiling point. The wounds they've carried for so long can no longer be ignored, forcing both characters to make difficult decisions about forgiveness and family.",
        "date": "2026-02-17"
      },
      {
        "number": 7,
        "title": "Episode 7",
        "summary": "The culmination of their journey together. Çağla and Doğan must finally face whether the wounds called family can ever truly heal, or if some scars run too deep.",
        "date": "2026-02-24"
      },
      {
        "number": 8,
        "title": "Episode 8",
        "summary": "New revelations come to light as Çağla and Doğan navigate the aftermath of their confrontation, discovering that true healing requires more than just understanding—it demands forgiveness and acceptance."
      }
    ],
    "videos": [
      { "title": "Episode 1", "url": "https://drive.google.com/file/d/1VsWGSd-Sy1VqZ2Gy90JW-nzQ19yN-zJf/view?usp=sharing", "type": "local" },
      { "title": "Episode 2", "url": "https://drive.google.com/file/d/1oxrtikqjBdJFlJLt8XmCBqNxpf4REZMI/view?usp=sharing", "type": "local" },
      { "title": "Episode 3", "url": "https://drive.google.com/file/d/1MlEfhG2BzMPfSWbDaixSV5Tk7OZbFlG4/view?usp=sharing", "type": "local" },
      { "title": "Episode 4", "url": "https://drive.google.com/file/d/1vsNJckTfvIBbb6Nz2YfitMEXYwPcUeUv/view?usp=sharing", "type": "local" },
      { "title": "Episode 5", "url": "https://drive.google.com/file/d/1ACOFv8X12EEtZUBDCa--q0dda15R0Idx/view?usp=sharing", "type": "local" },
      { "title": "Episode 6", "url": "https://drive.google.com/file/d/1Nap6XwDmNv5vH9qlsQNEl9Ee3JutK6c2/view?usp=sharing", "type": "local" },
      { "title": "Episode 7", "url": "https://drive.google.com/file/d/1V3UHqPG1Lv3t4SUDDrv61uAJ6thmT_7/view?usp=sharing", "type": "local" }
    ]
  },
  {
    "id": "8",
    "title": "Top Gun",
    "type": "movie",
    "status": "upcoming",
    "date": "2026-02-01",
    "genres": ["Action", "Drama", "Aviation"],
    "duration": "1h 50m",
    "story": "An iconic aviation film that follows the story of Pete 'Maverick' Mitchell, a talented but reckless fighter pilot who attends the Navy's elite fighter weapons school. Full of aerial combat sequences, personal growth, and unforgettable moments that defined a generation of aviation cinema.",
    "posterUrl": "/assets/top gun 1/top gun 1.jpg",
    "captures": ["/assets/top gun 1/top gun 1.jpg"],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1cPE4HoZQtyEkeFB2tZTH3Iy5qcTtSn11/view?usp=sharing", "type": "local" }
    ]
  },
  {
    "id": "9",
    "title": "Top Gun: Maverick",
    "type": "movie",
    "status": "upcoming",
    "date": "2026-02-08",
    "genres": ["Action", "Drama", "Aviation"],
    "duration": "2h 11m",
    "reason": "After more than thirty years of service, Maverick returns as a top naval aviator, pushing the envelope as a test pilot while training a new generation of fighter pilots for a specialized mission. A stunning continuation that combines nostalgia with breathtaking modern aerial cinematography.",
    "posterUrl": "/assets/top gun 2/top gun 2.jpg",
    "captures": ["/assets/top gun 2/top gun 2.jpg"]
  },
  {
    "id": "10",
    "title": "Sully",
    "type": "movie",
    "status": "upcoming",
    "date": "2026-02-22",
    "genres": ["Drama", "Biography", "Aviation"],
    "duration": "1h 36m",
    "reason": "Tom Hanks stars as Captain Chesley 'Sully' Sullenberger in this gripping true story of the 'Miracle on the Hudson.' When US Airways Flight 1549 loses both engines after a bird strike, Sully makes the life-or-death decision to land on the Hudson River, saving all 155 passengers and crew. A suspenseful and riveting tale of heroism, quick thinking, and the investigation that followed.",
    "posterUrl": "/assets/sully/captures/sully.jpg",
    "captures": ["/assets/sully/captures/sully.jpg"],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1z6sVMA_2PixRBtIw660HMqwyY-r6uyMx/view?usp=sharing", "type": "local" }
    ]
  },
  {
    "id": "11",
    "title": "The Aviator",
    "type": "movie",
    "status": "upcoming",
    "date": "2026-03-01",
    "genres": ["Drama", "Biography", "Aviation"],
    "duration": "2h 50m",
    "story": "Leonardo DiCaprio delivers an Oscar-nominated performance as Howard Hughes, the legendary aviation pioneer, filmmaker, and business tycoon. The film chronicles his ambitious aviation projects, record-breaking flights, and his descent into mental illness. A sweeping epic directed by Martin Scorsese that captures the golden age of aviation and Hollywood.",
    "posterUrl": "/assets/the aviator/captures/the aviator.jpg",
    "captures": ["/assets/the aviator/captures/the aviator.jpg"],
    "videos": [
      { "title": "Movie", "url": "https://drive.google.com/file/d/1bdEHEaiTUTkIjpMOaHVC6dd4EB8PbLn9/view?usp=sharing", "type": "local" }
    ]
  }
];

const PROGRESS_STORAGE_KEY = 'movie-night-progress';
let firebaseHydrated = false;

export const getEntries = (): MovieEntry[] => {
  const entries = [...MOVIES_DATA];
  const progress = getProgressFromStorage();
  const ratings = getRatingsFromStorage();
  
  return entries.map(entry => {
    const storedRating = ratings[entry.id];
    const normalizedStoredRating = storedRating
      ? {
          jojo: typeof storedRating.jojo === 'number' ? storedRating.jojo : 0,
          dodo: typeof storedRating.dodo === 'number' ? storedRating.dodo : 0,
        }
      : undefined;

    const normalizedEntryRating = entry.ratings
      ? {
          jojo: typeof entry.ratings.jojo === 'number' ? entry.ratings.jojo : 0,
          dodo: typeof entry.ratings.dodo === 'number' ? entry.ratings.dodo : 0,
        }
      : undefined;

    return {
      ...entry,
      watchProgress: progress[entry.id] || 0,
      // Override with stored ratings if available
      ratings: normalizedStoredRating || normalizedEntryRating
    };
  });
};

export const getEntriesAsync = async (): Promise<MovieEntry[]> => {
  await hydrateLocalStorageFromFirebase();
  
  // Try to load entries from Firebase first
  const firebaseEntries = await loadMovieEntries();
  
  if (firebaseEntries && firebaseEntries.length > 0) {
    // Use Firebase data
    const progress = getProgressFromStorage();
    const ratings = getRatingsFromStorage();
    
    return firebaseEntries.map(entry => {
      const storedRating = ratings[entry.id];
      const normalizedStoredRating = storedRating
        ? {
            jojo: typeof storedRating.jojo === 'number' ? storedRating.jojo : 0,
            dodo: typeof storedRating.dodo === 'number' ? storedRating.dodo : 0,
          }
        : undefined;

      const normalizedEntryRating = entry.ratings
        ? {
            jojo: typeof entry.ratings.jojo === 'number' ? entry.ratings.jojo : 0,
            dodo: typeof entry.ratings.dodo === 'number' ? entry.ratings.dodo : 0,
          }
        : undefined;

      return {
        ...entry,
        watchProgress: progress[entry.id] || 0,
        ratings: normalizedStoredRating || normalizedEntryRating
      };
    });
  }
  
  // If no Firebase data, migrate hardcoded data to Firebase (one-time)
  if (MOVIES_DATA.length > 0) {
    await saveMovieEntries(MOVIES_DATA);
  }
  
  return getEntries();
};

export const saveEntries = async (entries: MovieEntry[]): Promise<void> => {
  try {
    await saveMovieEntries(entries);
  } catch (error) {
    console.error('Failed to save entries to Firebase:', error);
    throw error;
  }
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  try {
    const entries = await getEntriesAsync();
    const updated = entries.filter(e => e.id !== entryId);
    await saveEntries(updated);
    
    // Also delete relevant stored data for this entry
    try {
      const ratings = getRatingsFromStorage();
      delete ratings[entryId];
      localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));

      const progress = getProgressFromStorage();
      delete progress[entryId];
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));

      // Delete comment threads for this entry
      localStorage.removeItem(`${COMMENT_STORAGE_KEY}-${entryId}`);
      localStorage.removeItem(`${COMMENT_STORAGE_KEY}-${entryId}-shared`);
      localStorage.removeItem(`${COMMENT_STORAGE_KEY}-${entryId}-jojo`);
      localStorage.removeItem(`${COMMENT_STORAGE_KEY}-${entryId}-dodo`);

      // Delete episode-related data for TV entries
      const episodeProgress = JSON.parse(localStorage.getItem(EPISODE_PROGRESS_KEY) || '{}');
      delete episodeProgress[entryId];
      localStorage.setItem(EPISODE_PROGRESS_KEY, JSON.stringify(episodeProgress));

      const episodeRatings = JSON.parse(localStorage.getItem(EPISODE_RATING_KEY) || '{}');
      delete episodeRatings[entryId];
      localStorage.setItem(EPISODE_RATING_KEY, JSON.stringify(episodeRatings));

      const episodeStatus = JSON.parse(localStorage.getItem(EPISODE_STATUS_KEY) || '{}');
      delete episodeStatus[entryId];
      localStorage.setItem(EPISODE_STATUS_KEY, JSON.stringify(episodeStatus));
    } catch (storageError) {
      console.warn('Failed to clean up stored data:', storageError);
    }
  } catch (error) {
    console.error('Failed to delete entry:', error);
    throw error;
  }
};

export const saveWatchProgress = (entryId: string, seconds: number): void => {
  try {
    const progress = getProgressFromStorage();
    progress[entryId] = seconds;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    
    // Sync to Firebase in the background
    firebaseUpdateProgress(entryId, seconds).catch(error => {
      console.warn('Firebase sync failed, continuing with local storage:', error);
    });
  } catch (error) {
    console.error('Failed to save watch progress:', error);
  }
};

export const getWatchProgress = (entryId: string): number => {
  try {
    const progress = getProgressFromStorage();
    return progress[entryId] || 0;
  } catch (error) {
    console.error('Failed to get watch progress:', error);
    return 0;
  }
};

const getProgressFromStorage = (): Record<string, number> => {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse watch progress:', error);
    return {};
  }
};

const hydrateLocalStorageFromFirebase = async (): Promise<void> => {
  if (firebaseHydrated) return;

  try {
    const cloudData = await loadUserProgress();
    if (!cloudData) {
      firebaseHydrated = true;
      return;
    }

    if (cloudData.watchProgress) {
      const localProgress = getProgressFromStorage();
      const mergedProgress = { ...cloudData.watchProgress, ...localProgress };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(mergedProgress));
    }

    if (cloudData.ratings) {
      const localRatings = getRatingsFromStorage();
      const cloudRatings = Object.fromEntries(
        Object.entries(cloudData.ratings).map(([entryId, rating]) => [
          entryId,
          {
            jojo: typeof rating?.jojo === 'number' ? rating.jojo : 0,
            dodo: typeof rating?.dodo === 'number' ? rating.dodo : 0,
          },
        ])
      );
      const localNormalized = Object.fromEntries(
        Object.entries(localRatings).map(([entryId, rating]) => [
          entryId,
          {
            jojo: typeof rating?.jojo === 'number' ? rating.jojo : 0,
            dodo: typeof rating?.dodo === 'number' ? rating.dodo : 0,
          },
        ])
      );
      const mergedRatings = { ...cloudRatings, ...localNormalized };
      localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(mergedRatings));
    }

    if (cloudData.comments) {
      const localComments = getCommentsFromStorage();
      const cloudCommentsFlat: Record<string, CommentMessage[]> = {};

      Object.entries(cloudData.comments).forEach(([entryId, scopes]) => {
        if (scopes.shared) cloudCommentsFlat[`${entryId}-shared`] = normalizeCommentThread(scopes.shared, 'shared');
        if (scopes.jojo) cloudCommentsFlat[`${entryId}-jojo`] = normalizeCommentThread(scopes.jojo, 'jojo');
        if (scopes.dodo) cloudCommentsFlat[`${entryId}-dodo`] = normalizeCommentThread(scopes.dodo, 'dodo');
      });

      const mergedComments = { ...cloudCommentsFlat, ...localComments };
      localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(mergedComments));
    }

    if (cloudData.episodeProgress) {
      const localEpisodeProgress = getEpisodeProgressFromStorage();
      const cloudEpisodeProgressFlat: Record<string, number> = {};

      Object.entries(cloudData.episodeProgress).forEach(([entryId, users]) => {
        if (typeof users.jojo === 'number') cloudEpisodeProgressFlat[`${entryId}-jojo`] = users.jojo;
        if (typeof users.dodo === 'number') cloudEpisodeProgressFlat[`${entryId}-dodo`] = users.dodo;
      });

      const mergedEpisodeProgress = { ...cloudEpisodeProgressFlat, ...localEpisodeProgress };
      localStorage.setItem(EPISODE_PROGRESS_KEY, JSON.stringify(mergedEpisodeProgress));
    }

    if (cloudData.episodeRatings) {
      const localEpisodeRatings = getEpisodeRatingsFromStorage();
      const cloudEpisodeRatingsFlat: Record<string, { jojo: number; dodo: number }> = {};

      Object.entries(cloudData.episodeRatings).forEach(([entryId, episodes]) => {
        Object.entries(episodes).forEach(([episodeKey, rating]) => {
          cloudEpisodeRatingsFlat[`${entryId}-${episodeKey}`] = {
            jojo: rating.jojo || 0,
            dodo: rating.dodo || 0,
          };
        });
      });

      const mergedEpisodeRatings = { ...cloudEpisodeRatingsFlat, ...localEpisodeRatings };
      localStorage.setItem(EPISODE_RATING_KEY, JSON.stringify(mergedEpisodeRatings));
    }

    if (cloudData.episodeStatus) {
      const localEpisodeStatus = getEpisodeStatusesFromStorage();
      const cloudEpisodeStatusFlat: Record<string, 'watched' | 'upcoming'> = {};

      Object.entries(cloudData.episodeStatus).forEach(([entryId, episodes]) => {
        Object.entries(episodes).forEach(([episodeKey, statusByUser]) => {
          if (statusByUser.jojo) {
            cloudEpisodeStatusFlat[`${entryId}-${episodeKey}-jojo`] = statusByUser.jojo;
          }
          if (statusByUser.dodo) {
            cloudEpisodeStatusFlat[`${entryId}-${episodeKey}-dodo`] = statusByUser.dodo;
          }
        });
      });

      const mergedEpisodeStatus = { ...cloudEpisodeStatusFlat, ...localEpisodeStatus };
      localStorage.setItem(EPISODE_STATUS_KEY, JSON.stringify(mergedEpisodeStatus));
    }
  } catch (error) {
    console.warn('Failed to hydrate local data from Firebase:', error);
  } finally {
    firebaseHydrated = true;
  }
};

// Rating management with Firebase sync
const RATING_STORAGE_KEY = 'movie-night-ratings';
const COMMENT_STORAGE_KEY = 'movie-night-comments';

export const saveRating = async (entryId: string, person: 'jojo' | 'dodo', rating: number): Promise<void> => {
  try {
    // Save to localStorage first
    const ratings = getRatingsFromStorage();
    if (!ratings[entryId]) {
      ratings[entryId] = { jojo: 0, dodo: 0 };
    }
    ratings[entryId][person] = rating;
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));
    
    // Firebase sync happens automatically when components update ratings
    await firebaseUpdateRating(entryId, person, rating);
  } catch (error) {
    console.warn('Firebase rating sync failed:', error);
    // Continue even if Firebase fails - ratings are still local
  }
};

export const getRating = (entryId: string): { jojo: number; dodo: number } | null => {
  try {
    const ratings = getRatingsFromStorage();
    return ratings[entryId] || null;
  } catch (error) {
    console.error('Failed to get rating:', error);
    return null;
  }
};

const getRatingsFromStorage = (): Record<string, { jojo: number; dodo: number }> => {
  try {
    const data = localStorage.getItem(RATING_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse ratings:', error);
    return {};
  }
};

export const saveComment = (entryId: string, comment: string, user?: 'jojo' | 'dodo' | null): void => {
  try {
    const comments = getCommentsFromStorage();
    const scope = (user || 'shared') as 'shared' | 'jojo' | 'dodo';
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;
    const key = `${entryId}-${scope}`;
    const thread = comments[key] || [];
    const nextMessage: CommentMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: trimmedComment,
      sender: scope,
      createdAt: Date.now(),
    };
    const updatedThread = [...thread, nextMessage];
    comments[key] = updatedThread;
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(comments));

    firebaseUpdateComment(entryId, scope, updatedThread).catch(error => {
      console.warn('Firebase comment sync failed, continuing with local storage:', error);
    });
  } catch (error) {
    console.error('Failed to save comment:', error);
  }
};

export const getComment = (entryId: string, user?: 'jojo' | 'dodo' | null): string => {
  try {
    const thread = getCommentThread(entryId, user);
    return thread[thread.length - 1]?.text || '';
  } catch (error) {
    console.error('Failed to get comment:', error);
    return '';
  }
};

export const getCommentThread = (entryId: string, user?: 'jojo' | 'dodo' | null): CommentMessage[] => {
  try {
    const comments = getCommentsFromStorage();

    const sharedThread = comments[`${entryId}-shared`] || [];
    const jojoThread = comments[`${entryId}-jojo`] || [];
    const dodoThread = comments[`${entryId}-dodo`] || [];

    const combinedThread = [...sharedThread, ...jojoThread, ...dodoThread]
      .sort((a, b) => a.createdAt - b.createdAt);

    return combinedThread;
  } catch (error) {
    console.error('Failed to get comment thread:', error);
    return [];
  }
};

const getCommentsFromStorage = (): Record<string, CommentMessage[]> => {
  try {
    const data = localStorage.getItem(COMMENT_STORAGE_KEY);
    const raw = data ? JSON.parse(data) as Record<string, CommentMessage[] | string> : {};
    const normalized: Record<string, CommentMessage[]> = {};

    Object.entries(raw).forEach(([key, value]) => {
      const senderFromKey = key.endsWith('-jojo') ? 'jojo' : key.endsWith('-dodo') ? 'dodo' : 'shared';
      normalized[key] = normalizeCommentThread(value, senderFromKey);
    });

    return normalized;
  } catch (error) {
    console.error('Failed to parse comments:', error);
    return {};
  }
};

const normalizeCommentThread = (value: CommentMessage[] | string, sender: 'shared' | 'jojo' | 'dodo'): CommentMessage[] => {
  if (Array.isArray(value)) {
    return value
      .filter(message => message && typeof message.text === 'string')
      .map(message => ({
        id: message.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: message.text,
        sender: message.sender || sender,
        createdAt: typeof message.createdAt === 'number' ? message.createdAt : Date.now(),
      }));
  }

  if (typeof value === 'string' && value.trim()) {
    return [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: value,
      sender,
      createdAt: Date.now(),
    }];
  }

  return [];
};

// Episode progress tracking for TV shows
const EPISODE_PROGRESS_KEY = 'movie-night-episode-progress';

export const saveEpisodeProgress = (entryId: string, user: 'jojo' | 'dodo', episodeIndex: number): void => {
  try {
    const progress = getEpisodeProgressFromStorage();
    const key = `${entryId}-${user}`;
    progress[key] = episodeIndex;
    localStorage.setItem(EPISODE_PROGRESS_KEY, JSON.stringify(progress));
    
    // Sync to Firebase in the background
    firebaseUpdateEpisodeProgress(entryId, user, episodeIndex).catch(error => {
      console.warn('Firebase episode progress sync failed, continuing with local storage:', error);
    });
  } catch (error) {
    console.error('Failed to save episode progress:', error);
  }
};

export const getLastWatchedEpisode = (entryId: string, user: 'jojo' | 'dodo'): number => {
  try {
    const progress = getEpisodeProgressFromStorage();
    const key = `${entryId}-${user}`;
    return progress[key] ?? 0;
  } catch (error) {
    console.error('Failed to get episode progress:', error);
    return 0;
  }
};

export const getResumeEpisodeIndex = (entryId: string, preferredUser?: 'jojo' | 'dodo' | null): number => {
  try {
    const progress = getEpisodeProgressFromStorage();

    if (preferredUser) {
      const preferredKey = `${entryId}-${preferredUser}`;
      return progress[preferredKey] ?? 0;
    }

    const jojoKey = `${entryId}-jojo`;
    const dodoKey = `${entryId}-dodo`;
    return Math.max(progress[jojoKey] ?? 0, progress[dodoKey] ?? 0);
  } catch (error) {
    console.error('Failed to get resume episode index:', error);
    return 0;
  }
};

const getEpisodeProgressFromStorage = (): Record<string, number> => {
  try {
    const data = localStorage.getItem(EPISODE_PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse episode progress:', error);
    return {};
  }
};

// Episode rating tracking for TV shows
const EPISODE_RATING_KEY = 'movie-night-episode-ratings';

export const saveEpisodeRating = async (entryId: string, episodeNumber: number, person: 'jojo' | 'dodo', rating: number): Promise<void> => {
  try {
    const ratings = getEpisodeRatingsFromStorage();
    const key = `${entryId}-ep${episodeNumber}`;
    
    if (!ratings[key]) {
      ratings[key] = { jojo: 0, dodo: 0 };
    }
    
    ratings[key][person] = rating;
    localStorage.setItem(EPISODE_RATING_KEY, JSON.stringify(ratings));
    
    // Sync to Firebase in the background
    firebaseUpdateEpisodeRating(entryId, episodeNumber, person, rating).catch(error => {
      console.warn('Firebase episode rating sync failed:', error);
    });
  } catch (error) {
    console.error('Failed to save episode rating:', error);
  }
};

export const getEpisodeRating = (entryId: string, episodeNumber: number): { jojo: number; dodo: number } => {
  try {
    const ratings = getEpisodeRatingsFromStorage();
    const key = `${entryId}-ep${episodeNumber}`;
    return ratings[key] || { jojo: 0, dodo: 0 };
  } catch (error) {
    console.error('Failed to get episode rating:', error);
    return { jojo: 0, dodo: 0 };
  }
};

const getEpisodeRatingsFromStorage = (): Record<string, { jojo: number; dodo: number }> => {
  try {
    const data = localStorage.getItem(EPISODE_RATING_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse episode ratings:', error);
    return {};
  }
};

// Episode status tracking for TV shows (per user)
const EPISODE_STATUS_KEY = 'movie-night-episode-status';

export const saveEpisodeStatus = (entryId: string, episodeNumber: number, user: 'jojo' | 'dodo', status: 'watched' | 'upcoming'): void => {
  try {
    const statuses = getEpisodeStatusesFromStorage();
    const key = `${entryId}-ep${episodeNumber}-${user}`;
    statuses[key] = status;
    localStorage.setItem(EPISODE_STATUS_KEY, JSON.stringify(statuses));
    
    // Sync to Firebase in background
    firebaseUpdateEpisodeStatus(entryId, episodeNumber, user, status).catch(err => {
      console.warn('Firebase sync failed for episode status:', err);
    });
  } catch (error) {
    console.error('Failed to save episode status:', error);
  }
};

export const getEpisodeStatus = (entryId: string, episodeNumber: number, user: 'jojo' | 'dodo'): 'watched' | 'upcoming' => {
  try {
    const statuses = getEpisodeStatusesFromStorage();
    const key = `${entryId}-ep${episodeNumber}-${user}`;
    return statuses[key] || 'upcoming';
  } catch (error) {
    console.error('Failed to get episode status:', error);
    return 'upcoming';
  }
};

const getEpisodeStatusesFromStorage = (): Record<string, 'watched' | 'upcoming'> => {
  try {
    const data = localStorage.getItem(EPISODE_STATUS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to parse episode statuses:', error);
    return {};
  }
};

// Initialize episodes 1-7 as watched for both users
export const initializeEpisodeStatuses = (entryId: string): void => {
  const statuses = getEpisodeStatusesFromStorage();
  const users: ('jojo' | 'dodo')[] = ['jojo', 'dodo'];
  
  // Force episodes 1-7 to watched
  for (let ep = 1; ep <= 7; ep++) {
    users.forEach(user => {
      const key = `${entryId}-ep${ep}-${user}`;
      statuses[key] = 'watched';
    });
  }
  
  localStorage.setItem(EPISODE_STATUS_KEY, JSON.stringify(statuses));
};