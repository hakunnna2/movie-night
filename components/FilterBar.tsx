import { FilterType, SortOption } from '../types';

interface FilterBarProps {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
}

export const FilterBar = ({ filter, setFilter, sort, setSort }: FilterBarProps) => {
  const getFilterLabel = (value: FilterType) => {
    if (value === 'all') return 'All';
    if (value === 'movie') return 'Movies';
    if (value === 'tv') return 'TV Shows';
    return 'Documentary';
  };

  const getFilterAriaLabel = (value: FilterType) => {
    if (value === 'all') return 'Filter by all content';
    if (value === 'movie') return 'Filter by movies only';
    if (value === 'tv') return 'Filter by TV shows only';
    return 'Filter by documentary titles only';
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-8 bg-night-800/50 p-3 rounded-2xl border border-night-700/50">
      <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto" role="group" aria-label="Filter movies and TV shows">
        {(['all', 'movie', 'tv', 'documentary'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-label={getFilterAriaLabel(f)}
            aria-pressed={filter === f}
            className={`px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all duration-300 capitalize focus:outline-none focus:ring-2 focus:ring-popcorn/50 active:scale-95 w-full sm:w-auto ${
              filter === f 
                ? 'bg-night-700 text-popcorn shadow-sm' 
                : 'text-ink-300 hover:text-ink-100 hover:bg-night-800'
            }`}
          >
            {getFilterLabel(f)}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-between sm:justify-start gap-2 px-1 sm:px-3 w-full sm:w-auto pt-1 sm:pt-0 border-t border-night-700/40 sm:border-t-0">
        <label htmlFor="sort-select" className="text-xs text-ink-300 font-bold uppercase tracking-wider">Sort by</label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Sort movies and TV shows"
          className="bg-transparent text-ink-100 font-bold text-sm min-h-[44px] py-2 focus:outline-none focus:ring-2 focus:ring-popcorn/50 rounded cursor-pointer hover:text-popcorn transition-colors text-right sm:text-left"
        >
          <option value="date-desc" className="bg-night-800">Newest</option>
          <option value="date-asc" className="bg-night-800">Oldest</option>

        </select>
      </div>
    </div>
  );
};