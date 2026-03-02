import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieEntry, FilterType, SortOption } from '../types';
import { MovieCard } from '../components/MovieCard';
import { FilterBar } from '../components/FilterBar';
import { Search, X, Ticket, Film, Sparkles, Armchair } from 'lucide-react';

interface HomeProps {
  entries: MovieEntry[];
  onNavigate: (view: 'details', id?: string) => void;
  selectedUser?: 'jojo' | 'dodo' | null;
}

export const Home = ({ entries, onNavigate, selectedUser }: HomeProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [search, setSearch] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const processEntries = useCallback((status: 'watched' | 'upcoming') => {
    const searchLower = search.toLowerCase();
    return entries
      .filter(e => e.status === status)
      .filter(e => filter === 'all' || e.type === filter)
      .filter(e => {
        if (!search.trim()) return true;
        return e.title.toLowerCase().includes(searchLower) ||
               e.originalTitle?.toLowerCase().includes(searchLower) ||
               e.genres?.some(g => g.toLowerCase().includes(searchLower)) ||
               e.story?.toLowerCase().includes(searchLower);
      })
      .sort((a, b) => {
        if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [entries, filter, sort, search]);

  const watchedList = useMemo(() => processEntries('watched'), [processEntries]);
  const upcomingList = useMemo(() => processEntries('upcoming'), [processEntries]);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return [];
    const searchLower = search.toLowerCase();
    return entries
      .filter(e => 
        e.title.toLowerCase().includes(searchLower) ||
        e.originalTitle?.toLowerCase().includes(searchLower) ||
        e.genres?.some(g => g.toLowerCase().includes(searchLower))
      )
      .slice(0, 8);
  }, [entries, search]);

  // Calculate time together
  const timeTogether = useMemo(() => {
    const watched = entries.filter(e => e.status === 'watched').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const upcoming = entries.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let totalMinutes = 0;
    let totalRating = 0;
    let totalJojoRating = 0;
    let totalDodoRating = 0;
    let ratedCount = 0;
    let dualRatedCount = 0;
    const genreMap: Record<string, number> = {};
    let earliestDate = new Date();
    let latestDate = new Date('2000-01-01');
    let bestMovie = null;
    let bestRating = 0;
    let longestMovie = null;
    let longestDuration = 0;

    watched.forEach(entry => {
      // Calculate duration
      if (entry.duration) {
        const match = entry.duration.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const durationMinutes = hours * 60 + minutes;
          totalMinutes += durationMinutes;
          
          // Track longest movie
          if (durationMinutes > longestDuration) {
            longestDuration = durationMinutes;
            longestMovie = entry;
          }
        }
      }

      // Calculate average ratings (dual ratings preferred)
      if (entry.ratings) {
        totalJojoRating += entry.ratings.jojo;
        totalDodoRating += entry.ratings.dodo;
        dualRatedCount++;
        const avgRating = (entry.ratings.jojo + entry.ratings.dodo) / 2;
        if (avgRating > bestRating) {
          bestRating = avgRating;
          bestMovie = entry;
        }
      } else if (entry.rating) {
        totalRating += entry.rating;
        ratedCount++;
        if (entry.rating > bestRating) {
          bestRating = entry.rating;
          bestMovie = entry;
        }
      }

      // Track genres
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
    const days = watched.length > 0 ? Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : (dualRatedCount > 0 ? ((totalJojoRating + totalDodoRating) / (dualRatedCount * 2)).toFixed(1) : '0');
    const avgJojoRating = dualRatedCount > 0 ? (totalJojoRating / dualRatedCount).toFixed(1) : '0';
    const avgDodoRating = dualRatedCount > 0 ? (totalDodoRating / dualRatedCount).toFixed(1) : '0';
    const favoriteGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0];
    const avgPerMonth = watched.length > 0 && days > 0 ? (watched.length / (days / 30.44)).toFixed(1) : '0';
    const nextMovieDate = upcoming.length > 0 ? new Date(upcoming[0].date) : null;
    const daysUntilNext = nextMovieDate ? Math.ceil((nextMovieDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return {
      totalMinutes,
      hours,
      minutes,
      count: watched.length,
      days,
      avgRating,
      avgJojoRating,
      avgDodoRating,
      favoriteGenre: favoriteGenre ? favoriteGenre[0] : 'None',
      avgPerMonth,
      bestMovie,
      longestMovie,
      nextMovie: upcoming[0],
      daysUntilNext,
      recentMovies: watched.slice(0, 3)
    };
  }, [entries]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 pt-12">
      {/* Header */}
      <header className="mb-14 flex flex-col items-center text-center gap-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex -space-x-3">
            <div className="w-11 h-11 rounded-full bg-[#fbbf24] flex items-center justify-center text-night-900 text-sm font-black border-4 border-[#0f172a] shadow-xl avatar-A">A</div>
            <div className="w-11 h-11 rounded-full bg-[#c084fc] flex items-center justify-center text-night-900 text-sm font-black border-4 border-[#0f172a] shadow-xl avatar-N">N</div>
          </div>
        </div>
        

        <div className="space-y-2 header-content">
          <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-[0.5em] block">Our Private Cinema Journal</span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            Two Seats, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#c084fc]">One Screen</span>
          </h1>
          <p className="text-[#cbd5e1] font-hand text-3xl italic opacity-70 mt-2">
            Watching life, one frame at a time.
          </p>
        </div>

        {/* Premium Navigation */}
      </header>

      {/* Search Bar */}
      <div className="mb-8 relative z-50">
        <div className="relative flex items-center">
          <Search size={20} className="absolute left-4 text-ink-400 pointer-events-none" />
          <input
            type="text"
            role="searchbox"
            aria-label="Search movies, TV shows, genres, and stories"
            aria-expanded={showSuggestions && search.trim() !== '' && searchSuggestions.length > 0}
            aria-controls="search-suggestions"
            placeholder="Search movies, TV, genres, stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-night-800/50 border border-night-700/50 rounded-2xl pl-12 pr-4 py-3 text-ink-100 placeholder-ink-400 focus:outline-none focus:border-popcorn/50 focus:ring-2 focus:ring-popcorn/30 transition-colors font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-4 text-ink-400 hover:text-ink-100 focus:text-ink-100 focus:outline-none focus:ring-2 focus:ring-popcorn rounded transition-colors p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {showSuggestions && search.trim() !== '' && searchSuggestions.length > 0 && (
          <div 
            id="search-suggestions"
            role="listbox"
            aria-label="Search suggestions"
            className="absolute top-full left-0 right-0 mt-2 bg-night-800 border border-night-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {searchSuggestions.map((entry) => (
              <button
                key={entry.id}
                role="option"
                aria-label={`${entry.title} - ${entry.type === 'movie' ? 'Movie' : 'TV Show'}`}
                onClick={() => {
                  setSearch('');
                  setShowSuggestions(false);
                  onNavigate('details', entry.id);
                }}
                className="w-full px-4 py-3 hover:bg-night-700/50 focus:bg-night-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-popcorn/50 transition-colors text-left border-b border-night-700/30 last:border-b-0 flex items-center gap-3"
              >
                {entry.posterUrl && (
                  <img 
                    src={entry.posterUrl} 
                    alt={`${entry.title} poster`}
                    loading="lazy"
                    className="w-10 h-14 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-100 truncate">{entry.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-ink-400 capitalize">{entry.type}</span>
                    {entry.rating && (
                      <span className="text-[10px] text-[#fbbf24]">★ {entry.rating.toFixed(1)}</span>
                    )}
                    {entry.genres && entry.genres.length > 0 && (
                      <span className="text-[10px] text-ink-400">{entry.genres[0]}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {showSuggestions && search.trim() !== '' && searchSuggestions.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-night-800 border border-night-700/50 rounded-2xl shadow-2xl p-4 text-center">
            <p className="text-ink-400 text-sm">No movies found matching "{search}"</p>
          </div>
        )}
      </div>

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
                selectedUser={selectedUser}
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
                selectedUser={selectedUser}
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
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-widest text-ink-400 hover:text-popcorn transition-colors opacity-60 hover:opacity-100"
            >
              Admin Panel
            </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;