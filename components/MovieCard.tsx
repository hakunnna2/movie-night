import React, { useState } from 'react';
import { Film, Tv } from 'lucide-react';
import { MovieEntry } from '../types';
import { StarRating } from './StarRating';

interface MovieCardProps {
  entry: MovieEntry;
  onClick: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ entry, onClick }) => {
  const isWatched = entry.status === 'watched';
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Use 'story' for watched, 'reason' for upcoming.
  const displayText = isWatched ? entry.story : entry.reason;

  return (
    <div 
      className="group relative bg-night-800 rounded-xl overflow-hidden shadow-ticket hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full border border-night-700/50 w-full"
      onClick={onClick}
    >
      {/* Poster / Top Section */}
      <div className="h-40 w-full bg-night-900 relative overflow-hidden">
        {/* Loading Skeleton */}
        {!imgLoaded && !imgError && (
           <div className="absolute inset-0 bg-night-800 animate-pulse flex items-center justify-center z-10">
              <Film size={20} className="text-night-700 opacity-50" />
           </div>
        )}

        {entry.posterUrl && !imgError ? (
          <img 
            src={entry.posterUrl} 
            alt={entry.title} 
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-night-900">
            {entry.type === 'movie' ? <Film size={40} className="text-night-700" /> : <Tv size={40} className="text-night-700" />}
          </div>
        )}
        
        {/* Date Badge (Ticket Stamp) */}
        <div className="absolute top-0 right-4 bg-popcorn text-night-900 px-2 pt-1 pb-1.5 rounded-b-lg shadow-lg z-20">
          <div className="text-[10px] font-black uppercase tracking-wider text-center leading-none">
            {new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}
          </div>
          <div className="text-lg font-black text-center leading-none">
             {new Date(entry.date).getDate()}
          </div>
        </div>
      </div>

      {/* Perforation Line */}
      <div className="relative w-full h-4 bg-night-800 flex items-center justify-between">
        <div className="w-4 h-4 bg-night-900 rounded-full -ml-2"></div>
        <div className="h-[1px] w-full border-t-2 border-dashed border-night-700 mx-1"></div>
        <div className="w-4 h-4 bg-night-900 rounded-full -mr-2"></div>
      </div>

      {/* Content Section */}
      <div className="p-4 pt-1 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-ink-100 leading-tight line-clamp-2 group-hover:text-popcorn transition-colors">
            {entry.title}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-night-700 border border-night-700 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                {entry.type}
            </span>
        </div>

        <div className="mt-auto">
          {/* Rating - Only show if watched */}
          {isWatched && (
            <div className="mb-2">
              <StarRating rating={entry.rating || 0} size={14} />
            </div>
          )}
          
          {/* Text Content - Unified style for Story (watched) and Reason (upcoming) */}
          {displayText ? (
            <p className="text-sm text-ink-300 font-hand italic line-clamp-2 leading-snug">
              "{displayText}"
            </p>
          ) : (
             /* Placeholder for upcoming if no reason is added */
             !isWatched && (
               <p className="text-sm text-ink-300 font-hand italic opacity-50">
                 Planned...
               </p>
             )
          )}
        </div>
      </div>
    </div>
  );
};