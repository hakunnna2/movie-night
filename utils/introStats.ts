import { MovieEntry } from '../types';

export interface IntroStats {
  hours: number;
  minutes: number;
  days: number;
  perMonth: string;
  favoriteGenre: string;
  titleCount: number;
  memoryCount: number;
}

const parseMovieMinutes = (duration: string): number => {
  const fullMatch = duration.match(/(\d+)h\s*(\d+)m/i);
  if (fullMatch) {
    const hours = parseInt(fullMatch[1], 10);
    const minutes = parseInt(fullMatch[2], 10);
    return hours * 60 + minutes;
  }

  const hoursOnlyMatch = duration.match(/(\d+)h/i);
  if (hoursOnlyMatch) {
    return parseInt(hoursOnlyMatch[1], 10) * 60;
  }

  const minutesOnlyMatch = duration.match(/(\d+)m/i);
  if (minutesOnlyMatch) {
    return parseInt(minutesOnlyMatch[1], 10);
  }

  return 0;
};

const getEpisodeCountFromDuration = (duration?: string): number => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)\s*Episodes?/i);
  return match ? parseInt(match[1], 10) : 0;
};

export const calculateIntroStats = (entries: MovieEntry[], nowTimestamp = Date.now()): IntroStats => {
  const watched = entries.filter((e) => e.status === 'watched');

  let totalMinutes = 0;
  const genreMap: Record<string, number> = {};
  let watchedTvEpisodeCount = 0;
  let earliestDate = new Date();

  entries.forEach((entry) => {
    if (entry.status === 'watched' && entry.type === 'movie' && entry.duration) {
      totalMinutes += parseMovieMinutes(entry.duration);
    }

    if (entry.type === 'tv') {
      let watchedEpisodes = 0;

      if (entry.episodes?.length) {
        watchedEpisodes = entry.episodes.filter((episode) => episode.status === 'watched').length;
      }

      if (watchedEpisodes === 0 && entry.status === 'watched') {
        const fromEpisodes = entry.episodes?.length || 0;
        const fromVideos = entry.videos?.length || 0;
        const fromDuration = getEpisodeCountFromDuration(entry.duration);
        watchedEpisodes = fromEpisodes || fromVideos || fromDuration;
      }

      watchedTvEpisodeCount += watchedEpisodes;
      if (entry.episodeRuntimeMinutes) {
        totalMinutes += watchedEpisodes * entry.episodeRuntimeMinutes;
      }
    }

    if (entry.status === 'watched') {
      entry.genres?.forEach((genre) => {
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      });

      const entryDate = new Date(entry.date);
      if (entryDate < earliestDate) earliestDate = entryDate;
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = watched.length > 0
    ? Math.max(0, Math.ceil((nowTimestamp - earliestDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const perMonth = watched.length > 0 ? (watched.length / Math.max(1, Math.ceil(days / 30))).toFixed(1) : '0';
  const favoriteGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  const watchedMovieCount = watched.filter((entry) => entry.type === 'movie').length;
  const memoryCount = watchedMovieCount + watchedTvEpisodeCount;

  return { hours, minutes, days, perMonth, favoriteGenre, titleCount: watched.length, memoryCount };
};
