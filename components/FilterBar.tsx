import { FilterType, SortOption } from '../types';

interface FilterBarProps {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
}

export const FilterBar = ({ filter, setFilter, sort, setSort }: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-night-800/50 p-2 rounded-2xl border border-night-700/50">
      <div className="flex gap-1" role="group" aria-label="Filter movies and TV shows">
        {(['all', 'movie', 'tv'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-label={`Filter by ${f === 'all' ? 'all content' : f === 'movie' ? 'movies only' : 'TV shows only'}`}
            aria-pressed={filter === f}
            className={`px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all duration-300 capitalize focus:outline-none focus:ring-2 focus:ring-popcorn/50 active:scale-95 ${
              filter === f 
                ? 'bg-night-700 text-popcorn shadow-sm' 
                : 'text-ink-300 hover:text-ink-100 hover:bg-night-800'
            }`}
          >
            {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
        ))}
      </div>

      <div className="relative flex items-center gap-2 px-3">
        <label htmlFor="sort-select" className="text-xs text-ink-300 font-bold uppercase tracking-wider">Sort by</label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Sort movies and TV shows"
          className="bg-transparent text-ink-100 font-bold text-sm min-h-[44px] py-2 focus:outline-none focus:ring-2 focus:ring-popcorn/50 rounded cursor-pointer hover:text-popcorn transition-colors"
        >
          <option value="date-desc" className="bg-night-800">Newest</option>
          <option value="date-asc" className="bg-night-800">Oldest</option>
          <option value="rating-desc" className="bg-night-800">Top Rated</option>
        </select>
      </div>
    </div>
  );
};