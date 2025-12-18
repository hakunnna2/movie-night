import React, { useState, useMemo } from 'react';
import { MovieEntry, FilterType, SortOption } from '../types';
import { MovieCard } from '../components/MovieCard';
import { FilterBar } from '../components/FilterBar';
import { Sparkles, Ticket, Armchair } from 'lucide-react';

interface HomeProps {
  entries: MovieEntry[];
  onNavigate: (view: 'details', id?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ entries, onNavigate }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortOption>('date-desc');

  const processEntries = (status: 'watched' | 'upcoming') => {
    return entries
      .filter(e => e.status === status)
      .filter(e => filter === 'all' ? true : e.type === filter)
      .sort((a, b) => {
        if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  };

  const watchedList = useMemo(() => processEntries('watched'), [entries, filter, sort]);
  const upcomingList = useMemo(() => processEntries('upcoming'), [entries, filter, sort]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 pt-12">
      {/* Header */}
      <header className="mb-14 flex flex-col items-center text-center gap-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex -space-x-3">
            <div className="w-11 h-11 rounded-full bg-[#fbbf24] flex items-center justify-center text-night-900 text-sm font-black border-4 border-[#0f172a] shadow-xl">A</div>
            <div className="w-11 h-11 rounded-full bg-[#c084fc] flex items-center justify-center text-night-900 text-sm font-black border-4 border-[#0f172a] shadow-xl">N</div>
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-[0.5em] block">Our Private Cinema Journal</span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            Two Seats, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#c084fc]">One Screen</span>
          </h1>
          <p className="text-[#cbd5e1] font-hand text-3xl italic opacity-70 mt-2">
            Watching life, one frame at a time.
          </p>
        </div>
      </header>

      <FilterBar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} />

      {/* Upcoming Section (Next Movie Night) */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-[#c084fc]/10 rounded-xl text-[#c084fc] border border-[#c084fc]/20 shadow-inner">
             <Ticket size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Next Movie Night</h2>
            <p className="text-[10px] font-black text-ink-300 uppercase tracking-[0.3em] opacity-50">Queued for the couch</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 bg-[#1e293b] px-3 py-1 rounded-full border border-white/5">
             <span className="w-2 h-2 rounded-full bg-[#c084fc] animate-pulse"></span>
             <span className="text-[10px] font-black text-ink-100 uppercase tracking-widest">{upcomingList.length} PLANNED</span>
          </div>
        </div>
        
        {upcomingList.length === 0 ? (
          <div className="py-24 bg-white/5 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center">
            <Armchair size={56} className="text-night-700 mb-5" />
            <p className="text-ink-200 font-black uppercase tracking-[0.2em] text-sm">Library Quiet</p>
            <p className="text-ink-300 text-xs mt-2 opacity-50 italic">No future movie nights scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingList.map(entry => (
              <MovieCard 
                key={entry.id} 
                entry={entry} 
                onClick={() => onNavigate('details', entry.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Watched Section */}
      <section>
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-[#fbbf24]/10 rounded-xl text-[#fbbf24] border border-[#fbbf24]/20 shadow-inner">
             <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Watched Together</h2>
            <p className="text-[10px] font-black text-ink-300 uppercase tracking-[0.3em] opacity-50">Our Shared Cinematic History</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 bg-[#1e293b] px-3 py-1 rounded-full border border-white/5">
             <span className="text-[10px] font-black text-ink-100 uppercase tracking-widest">{watchedList.length} LOGGED</span>
          </div>
        </div>

        {watchedList.length === 0 ? (
          <div className="py-24 bg-white/5 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center">
             <div className="text-6xl mb-6 grayscale opacity-20">🍿</div>
            <p className="text-ink-200 font-black uppercase tracking-[0.2em] text-sm">Reels are Empty</p>
            <p className="text-ink-300 text-xs mt-2 opacity-50 italic">Time to grab some popcorn and hit play.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {watchedList.map(entry => (
              <MovieCard 
                key={entry.id} 
                entry={entry} 
                onClick={() => onNavigate('details', entry.id)}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-32 pt-10 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-ink-300 text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
                <span>&copy; {new Date().getFullYear()}</span>
                <span>•</span>
                <span>Two Seats, One Screen</span>
            </div>
            <p className="font-hand text-xl text-ink-300 opacity-40">Made with 💛 for movie nights.</p>
        </div>
      </footer>
    </div>
  );
};