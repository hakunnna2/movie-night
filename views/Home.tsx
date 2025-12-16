import React, { useState, useMemo } from 'react';
import { MovieEntry, FilterType, SortOption } from '../types';
import { MovieCard } from '../components/MovieCard';
import { FilterBar } from '../components/FilterBar';
import { Armchair, Ticket } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 pb-20 pt-10">
      {/* Header */}
      <header className="mb-10 flex flex-col items-center text-center gap-6 border-b border-night-800 pb-8">
        <div>
           <div className="flex items-center justify-center gap-3 mb-4">
             {/* Tiny Avatar Placeholders */}
             <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-popcorn flex items-center justify-center text-night-900 text-sm font-bold border-4 border-night-900 shadow-lg">A</div>
                <div className="w-10 h-10 rounded-full bg-dream flex items-center justify-center text-night-900 text-sm font-bold border-4 border-night-900 shadow-lg">N</div>
             </div>
           </div>
           <span className="text-ink-300 text-xs font-bold uppercase tracking-[0.3em] mb-2 block">Our Shared Library</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-ink-100 mb-4">
            Two Seats, <span className="text-transparent bg-clip-text bg-gradient-to-r from-popcorn to-popcorn-light">One Screen</span>
          </h1>
          <p className="text-ink-200 font-hand text-2xl">
            Different couch, Same stories.
          </p>
        </div>
      </header>

      <FilterBar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} />

      {/* Upcoming Section */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Ticket className="text-dream" size={20} />
          <h2 className="text-2xl font-bold text-ink-100">Next Movie Night</h2>
          <span className="ml-auto text-xs font-bold text-night-900 bg-dream px-2 py-1 rounded-md">{upcomingList.length}</span>
        </div>
        
        {upcomingList.length === 0 ? (
          <div className="py-12 bg-night-800/30 rounded-2xl border border-dashed border-night-700 flex flex-col items-center justify-center text-center">
            <Armchair size={48} className="text-night-700 mb-4" />
            <p className="text-ink-200 font-medium">Our watchlist is empty.</p>
            <p className="text-ink-300 text-sm mt-1">Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="flex items-center gap-3 mb-6">
          <Armchair className="text-popcorn" size={20} />
          <h2 className="text-2xl font-bold text-ink-100">Watched Together</h2>
          <span className="ml-auto text-xs font-bold text-night-900 bg-popcorn px-2 py-1 rounded-md">{watchedList.length}</span>
        </div>

        {watchedList.length === 0 ? (
          <div className="py-12 bg-night-800/30 rounded-2xl border border-dashed border-night-700 flex flex-col items-center justify-center text-center">
             <div className="text-4xl mb-4 grayscale opacity-30">🍿</div>
            <p className="text-ink-200 font-medium">No shared memories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <footer className="mt-20 pt-8 border-t border-night-800 text-center text-ink-300 text-sm">
        <p>&copy; Two Seats, One Screen.</p>
      </footer>
    </div>
  );
};