import React, { useState } from 'react';
import { Film, Tv, Clock, Star } from 'lucide-react';
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

  // Use 'story' as primary, fallback to 'reason'
  const displayText = entry.story || entry.reason;
  
  // Use first capture if available, otherwise fallback to poster
  const captureImage = (entry.captures && entry.captures.length > 0) 
    ? entry.captures[0] 
    : entry.posterUrl;

  return (
    <div 
      className="group relative bg-[#1a2332] rounded-2xl overflow-hidden shadow-2xl hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full border border-white/5 w-full"
      onClick={onClick}
    >
      {/* Header Section: Poster + Capture */}
      <div className="relative h-44 w-full bg-[#0f172a] overflow-hidden flex">
        {/* Capture Image Background (Right Side) */}
        <div className="absolute inset-0 left-1/4">
           {captureImage && !imgError ? (
            <img 
              src={captureImage} 
              alt={`${entry.title} capture`} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-[#0f172a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-transparent"></div>
        </div>

        {/* Poster Image (Left Side - "Main" element) */}
        <div className="relative z-10 w-1/3 h-full p-2">
            <div className="w-full h-full rounded-md overflow-hidden shadow-lg border border-white/10">
                <img 
                  src={entry.posterUrl || 'https://via.placeholder.com/150x225'} 
                  alt={entry.title} 
                  className="w-full h-full object-cover"
                />
            </div>
        </div>

        {/* Duration Badge (Top Left) */}
        <div className="absolute top-3 left-1/3 ml-2 z-20">
          <div className="bg-black/60 backdrop-blur-md text-[#fbbf24] text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1.5 border border-white/10 uppercase tracking-widest shadow-lg">
             {entry.type === 'movie' ? <Clock size={10} /> : <Film size={10} />}
             {entry.type === 'movie' ? (entry.duration || 'N/A') : `${entry.episodes?.length || 0} EPS`}
          </div>
        </div>

        {/* Date Badge (Top Right) */}
        <div className="absolute top-0 right-4 bg-[#fbbf24] text-night-900 px-2.5 pt-1.5 pb-2 rounded-b-lg shadow-xl z-20">
          <div className="text-[10px] font-black uppercase tracking-widest text-center leading-none mb-0.5">
            {new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}
          </div>
          <div className="text-lg font-black text-center leading-none">
             {new Date(entry.date).getDate()}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow bg-[#1a2332]">
        <h3 className="text-lg font-extrabold text-white leading-tight mb-1 group-hover:text-[#fbbf24] transition-colors">
          {entry.title}
        </h3>
        
        {/* Genre Row */}
        <div className="flex items-center gap-2 mb-4">
             <span className="text-[10px] text-ink-300 font-black uppercase tracking-[0.2em]">
                 {entry.genres?.[0] || 'DRAMA'}
             </span>
        </div>

        <div className="mt-auto space-y-4">
          {/* Your Star Rating (Only for Watched) */}
          {isWatched && (
            <div className="flex">
              <StarRating rating={entry.rating || 0} size={14} />
            </div>
          )}
          
          {/* Story Snippet */}
          {displayText && (
            <p className="text-sm text-ink-300 font-hand italic line-clamp-2 leading-relaxed opacity-80 border-l-2 border-white/5 pl-3">
              "{displayText}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};