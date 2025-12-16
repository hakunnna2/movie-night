import React from 'react';
import { ArrowLeft, Calendar, Film, Tv, Ticket } from 'lucide-react';
import { MovieEntry } from '../types';
import { StarRating } from '../components/StarRating';

interface DetailsProps {
  entry: MovieEntry;
  onBack: () => void;
}

export const Details: React.FC<DetailsProps> = ({ entry, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-ink-300 hover:text-popcorn transition-colors mb-6 font-bold text-sm uppercase tracking-wide"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Library
      </button>

      <div className="bg-night-800 rounded-2xl overflow-hidden shadow-2xl border border-night-700">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-5/12 min-h-[400px] bg-night-900 relative">
            {entry.posterUrl ? (
              <img 
                src={entry.posterUrl} 
                alt={entry.title} 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-night-700">
                 {entry.type === 'movie' ? <Film size={64} className="mb-4" /> : <Tv size={64} className="mb-4" />}
                 <span className="font-bold uppercase tracking-wider text-sm opacity-50">No Poster</span>
              </div>
            )}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-night-800 md:bg-gradient-to-r md:from-transparent md:to-night-800 opacity-50"></div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-10 md:w-7/12 flex flex-col relative">
            <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-night-900 text-popcorn border border-night-700">
                    <Ticket size={12} />
                    {entry.type === 'movie' ? 'Movie' : 'TV Show'}
                </span>
                <div className="text-ink-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                    <Calendar size={14} />
                    {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-ink-100 mb-6 leading-tight">
              {entry.title}
            </h1>

            {entry.status === 'watched' ? (
              <div className="mb-8">
                <div className="mb-8 flex items-center gap-4 bg-night-900/50 p-4 rounded-xl w-fit border border-night-700">
                    <span className="text-ink-300 font-bold text-xs uppercase tracking-wider">Our Rating</span>
                    <div className="h-4 w-[1px] bg-night-700"></div>
                    <StarRating rating={entry.rating || 0} size={20} />
                </div>
                
                {entry.story && (
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-popcorn to-dream rounded-full opacity-50"></div>
                    <p className="text-xl text-ink-200 font-hand leading-relaxed italic pl-2">
                      "{entry.story}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-8 p-6 bg-night-900 rounded-xl border border-night-700/50">
                <h3 className="text-dream text-xs font-bold uppercase mb-2 tracking-widest">Can't wait, are you excited!!</h3>
                <p className="text-ink-200 leading-relaxed">{entry.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};