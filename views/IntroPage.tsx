import React, { useMemo, useState } from 'react';
import { MovieEntry } from '../types';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { getEpisodeStatus } from '../services/storage';

interface IntroPageProps {
  entries: MovieEntry[];
  onContinue: () => void;
  selectedUser: 'jojo' | 'dodo' | null;
  onSelectUser: (user: 'jojo' | 'dodo' | null) => void;
}

// User credentials
const ADMIN_USERS = {
  jojo: '2004',
  dodo: 'LUPIN'
};

export const IntroPage = ({ entries, onContinue, selectedUser, onSelectUser }: IntroPageProps) => {
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [authenticatingUser, setAuthenticatingUser] = useState<'jojo' | 'dodo' | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleUserClick = (user: 'jojo' | 'dodo') => {
    setAuthenticatingUser(user);
    setPassword('');
    setAuthError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authenticatingUser && ADMIN_USERS[authenticatingUser] === password) {
      // Authentication successful
      onSelectUser(authenticatingUser);
      setShowUserSelector(false);
      setAuthenticatingUser(null);
      setPassword('');
      setAuthError('');
      onContinue();
    } else {
      // Authentication failed
      setAuthError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleCloseAuth = () => {
    setAuthenticatingUser(null);
    setPassword('');
    setAuthError('');
  };

  // Calculate time together
  const timeTogether = useMemo(() => {
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

    const watched = entries.filter(e => e.status === 'watched');
    
    let totalMinutes = 0;
    let totalRating = 0;
    let totalJojoRating = 0;
    let totalDodoRating = 0;
    let ratedCount = 0;
    let dualRatedCount = 0;
    const genreMap: Record<string, number> = {};
    let watchedTvEpisodeCount = 0;
    let earliestDate = new Date();
    let latestDate = new Date('2000-01-01');

    watched.forEach(entry => {
      if (entry.type === 'movie' && entry.duration) {
        totalMinutes += parseMovieMinutes(entry.duration);
      }

      if (entry.type === 'tv' && entry.episodeRuntimeMinutes) {
        let watchedEpisodes = 0;

        if (selectedUser && entry.episodes?.length) {
          watchedEpisodes = entry.episodes.filter(episode =>
            getEpisodeStatus(entry.id, episode.number, selectedUser) === 'watched'
          ).length;
        }

        if (watchedEpisodes === 0) {
          const fromEpisodes = entry.episodes?.length || 0;
          const fromVideos = entry.videos?.length || 0;
          const fromDuration = getEpisodeCountFromDuration(entry.duration);
          watchedEpisodes = fromEpisodes || fromVideos || fromDuration;
        }

        watchedTvEpisodeCount += watchedEpisodes;
        totalMinutes += watchedEpisodes * entry.episodeRuntimeMinutes;
      }

      if (entry.ratings) {
        const jojoRating = typeof entry.ratings.jojo === 'number' ? entry.ratings.jojo : 0;
        const dodoRating = typeof entry.ratings.dodo === 'number' ? entry.ratings.dodo : 0;
        totalJojoRating += jojoRating;
        totalDodoRating += dodoRating;
        dualRatedCount++;
      } else if (entry.rating) {
        totalRating += entry.rating;
        ratedCount++;
      }

      entry.genres?.forEach(genre => {
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      });

      // Track dates
      const entryDate = new Date(entry.date);
      if (entryDate < earliestDate) earliestDate = entryDate;
      if (entryDate > latestDate) latestDate = entryDate;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : (dualRatedCount > 0 ? ((totalJojoRating + totalDodoRating) / (dualRatedCount * 2)).toFixed(1) : '0');
    const avgJojoRating = dualRatedCount > 0 ? (totalJojoRating / dualRatedCount).toFixed(1) : '0';
    const avgDodoRating = dualRatedCount > 0 ? (totalDodoRating / dualRatedCount).toFixed(1) : '0';
    const days = watched.length > 0 ? Math.ceil((new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const perMonth = watched.length > 0 ? (watched.length / Math.max(1, Math.ceil(days / 30))).toFixed(1) : '0';
    const favoriteGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    const watchedMovieCount = watched.filter(entry => entry.type === 'movie').length;
    const watchedTvCount = watched.filter(entry => entry.type === 'tv').length;
    const memoryCount = watchedMovieCount + (watchedTvEpisodeCount > 0 ? watchedTvEpisodeCount : watchedTvCount);

    return { hours, minutes, avgRating, avgJojoRating, avgDodoRating, days, perMonth, favoriteGenre, titleCount: watched.length, memoryCount };
  }, [entries, selectedUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-purple-900/20 to-night-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full transition-all duration-1000 opacity-100 scale-100">
        <div className="flex justify-center items-center mb-4 md:mb-6 relative">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-popcorn to-yellow-400 flex items-center justify-center text-2xl md:text-3xl font-bold text-night-900 shadow-lg shadow-popcorn/50 relative z-10 avatar-A">
            A
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg shadow-purple-400/50 -ml-4 md:-ml-5 relative z-10 avatar-N">
            N
          </div>
          <div className="absolute w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-popcorn/30 to-purple-400/30 blur-xl rounded-full"></div>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xs md:text-sm font-light text-ink-300 uppercase tracking-[0.3em]">
            Our Private Cinema Journal
          </h2>
        </div>

        {/* Main stats card */}
        <div className="bg-gradient-to-br from-white/5 to-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl mb-6">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-popcorn via-pink-400 to-purple-400 bg-clip-text text-transparent">Moments Together</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 md:gap-6 mb-6">
            {/* Hours */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-popcorn mb-1">{timeTogether.hours}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Hours</div>
            </div>

            {/* Minutes */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-popcorn mb-1">{timeTogether.minutes}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Minutes</div>
            </div>

            {/* Titles */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-400 mb-1">{timeTogether.titleCount}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Titles</div>
            </div>

            {/* Days */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-400 mb-1">{timeTogether.days}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Days</div>
            </div>
          </div>

          {/* Detailed stats */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-center">
              <div className="text-[10px] md:text-xs text-[#fbbf24] tracking-widest font-semibold mb-1">JoJo's Avg</div>
              <div className="text-2xl md:text-3xl font-bold text-[#fbbf24]">{timeTogether.avgJojoRating} <span className="text-base md:text-xl">⭐</span></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-center">
              <div className="text-[10px] md:text-xs text-[#c084fc] tracking-widest font-semibold mb-1">DoDo's Avg</div>
              <div className="text-2xl md:text-3xl font-bold text-[#c084fc]">{timeTogether.avgDodoRating} <span className="text-base md:text-xl">⭐</span></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-center">
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold mb-1">Per Month</div>
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">{timeTogether.perMonth}</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-center">
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold mb-1">Favorite Genre</div>
              <div className="text-xl md:text-2xl font-bold text-purple-400">{timeTogether.favoriteGenre}</div>
            </div>
          </div>

          {/* Journey text */}
          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-sm md:text-base text-ink-200 mb-2">
              We've spent <span className="text-popcorn font-bold">{timeTogether.hours}h {timeTogether.minutes}m</span> together watching.
            </p>
            <p className="text-sm md:text-base text-ink-300">
              <span className="text-cyan-400">{timeTogether.titleCount} titles</span> shared. <span className="text-purple-400">{timeTogether.memoryCount} memories</span> made.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowUserSelector(true)}
            className="group bg-gradient-to-r from-popcorn to-pink-400 hover:shadow-2xl hover:shadow-popcorn/50 text-night-900 font-bold py-3 px-10 md:px-12 rounded-full transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            View Journal
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* User Selector Modal */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-8 text-popcorn">Choose Your View</h2>
            
            <div className="space-y-4">
              {/* N = JoJo Button */}
              <button
                onClick={() => handleUserClick('jojo')}
                className={`w-full p-6 rounded-xl transition-all duration-300 border-2 ${
                  selectedUser === 'jojo'
                    ? 'bg-[#c084fc]/20 border-[#c084fc] shadow-lg shadow-[#c084fc]/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#c084fc]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                    N
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-[#c084fc]">JoJo's History</p>
                    
                  </div>
                </div>
              </button>

              {/* A = DoDo Button */}
              <button
                onClick={() => handleUserClick('dodo')}
                className={`w-full p-6 rounded-xl transition-all duration-300 border-2 ${
                  selectedUser === 'dodo'
                    ? 'bg-[#fbbf24]/20 border-[#fbbf24] shadow-lg shadow-[#fbbf24]/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#fbbf24]/50'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-popcorn to-yellow-400 flex items-center justify-center text-lg font-bold text-night-900">
                    A
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-[#fbbf24]">DoDo's History</p>
                    
                  </div>
                </div>
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowUserSelector(false)}
              className="w-full mt-6 px-4 py-2 text-ink-400 hover:text-ink-200 text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Password Authentication Modal */}
      {authenticatingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-popcorn/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-popcorn/30">
                <Lock size={32} className="text-popcorn" />
              </div>
              <h2 className="text-2xl font-bold text-ink-100 text-center">
                {authenticatingUser === 'jojo' ? 'JoJo' : 'DoDo'}'s Access
              </h2>
              <p className="text-ink-400 text-sm mt-2 text-center">
                Enter password to continue
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl px-5 py-4 pr-12 text-ink-100 placeholder-night-600 focus:outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-popcorn hover:bg-popcorn-glow text-night-900 font-bold text-lg py-4 rounded-xl transition-all hover:shadow-glow uppercase tracking-wide"
              >
                Unlock Access
              </button>

              <button
                type="button"
                onClick={handleCloseAuth}
                className="w-full px-4 py-2 text-ink-400 hover:text-ink-200 text-sm transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes avatar-float-A {
          0% {
            transform: translate(-80px, -80px) scale(0.5);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes avatar-float-N {
          0% {
            transform: translate(80px, -80px) scale(0.5);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        .avatar-A {
          animation: avatar-float-A 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .avatar-N {
          animation: avatar-float-N 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default IntroPage;
