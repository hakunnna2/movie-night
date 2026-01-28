import React, { useState, useMemo } from 'react';
import { MovieEntry } from '../types';
import { ArrowRight } from 'lucide-react';

interface IntroPageProps {
  entries: MovieEntry[];
  onContinue: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ entries, onContinue }) => {
  const [isAnimating] = useState(true);

  // Calculate time together
  const timeTogether = useMemo(() => {
    const watched = entries.filter(e => e.status === 'watched');
    
    let totalMinutes = 0;
    let totalRating = 0;
    let ratedCount = 0;
    const genreMap: Record<string, number> = {};
    let earliestDate = new Date();
    let latestDate = new Date('2000-01-01');

    watched.forEach(entry => {
      if (entry.duration) {
        const match = entry.duration.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          totalMinutes += hours * 60 + minutes;
        }
      }

      if (entry.rating) {
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
    const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '0';
    const days = watched.length > 0 ? Math.ceil((new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const perMonth = watched.length > 0 ? (watched.length / Math.max(1, Math.ceil(days / 30))).toFixed(1) : '0';
    const favoriteGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    return { hours, minutes, avgRating, days, perMonth, favoriteGenre, filmCount: watched.length };
  }, [entries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-purple-900/20 to-night-900 flex items-center justify-center p-4">
      <div className={`max-w-3xl w-full transition-all duration-1000 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Animated avatars - Fusion */}
        <div className="flex justify-center items-center mb-4 relative">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-popcorn to-yellow-400 flex items-center justify-center text-2xl font-bold text-night-900 shadow-lg shadow-popcorn/50 relative z-10 ${isAnimating ? 'avatar-A' : ''}`}>
            A
          </div>
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-400/50 -ml-4 relative z-10 ${isAnimating ? 'avatar-N' : ''}`}>
            N
          </div>
          {/* Fusion glow effect */}
          <div className="absolute w-8 h-8 bg-gradient-to-r from-popcorn/30 to-purple-400/30 blur-xl rounded-full"></div>
        </div>

        {/* Header text */}
        <div className="text-center mb-6">
          <h2 className="text-xs md:text-sm font-light text-ink-300 uppercase tracking-[0.3em]">
            Our Private Cinema Journal
          </h2>
        </div>

        {/* Main stats card */}
        <div className="bg-gradient-to-br from-white/5 to-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl mb-6">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-popcorn via-pink-400 to-purple-400 bg-clip-text text-transparent">Moments Together</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Hours */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-popcorn mb-1">{timeTogether.hours}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Hours</div>
            </div>

            {/* Minutes */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-popcorn mb-1">{timeTogether.minutes}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Minutes</div>
            </div>

            {/* Films */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">{timeTogether.filmCount}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Films</div>
            </div>

            {/* Days */}
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">{timeTogether.days}</div>
              <div className="text-[10px] md:text-xs text-ink-400 uppercase tracking-widest font-semibold">Days</div>
            </div>
          </div>

          {/* Detailed stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[10px] text-ink-400 uppercase tracking-widest font-semibold mb-1">Avg Rating</div>
              <div className="text-2xl font-bold text-popcorn">{timeTogether.avgRating} <span className="text-base">⭐</span></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[10px] text-ink-400 uppercase tracking-widest font-semibold mb-1">Per Month</div>
              <div className="text-2xl font-bold text-cyan-400">{timeTogether.perMonth}</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-[10px] text-ink-400 uppercase tracking-widest font-semibold mb-1">Favorite Genre</div>
              <div className="text-xl font-bold text-purple-400">{timeTogether.favoriteGenre}</div>
            </div>
          </div>

          {/* Journey text */}
          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-ink-200 mb-2">
              We've spent <span className="text-popcorn font-bold">{timeTogether.hours}h {timeTogether.minutes}m</span> together watching films. 
            </p>
            <p className="text-sm text-ink-300">
              <span className="text-cyan-400">{timeTogether.filmCount} movies</span> shared. <span className="text-purple-400">{timeTogether.filmCount} memories</span> made.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="group bg-gradient-to-r from-popcorn to-pink-400 hover:shadow-2xl hover:shadow-popcorn/50 text-night-900 font-bold py-3 px-10 rounded-full transition-all duration-300 flex items-center gap-2 hover:scale-105"
          >
            View Journal
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default IntroPage;
