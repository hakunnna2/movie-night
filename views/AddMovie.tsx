import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, Plus, Check } from 'lucide-react';
import { tmdbService, TMDBMovieResult, TMDBTVResult } from '../services/tmdb.service';
import { addMovieEntryToFirebase } from '../services/firebase.service';
import { MovieEntry } from '../types';

export const AddMovie = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(TMDBMovieResult | TMDBTVResult)[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // Let's just search movies for now to keep it simple, but we can extend this!
    const movieResults = await tmdbService.searchMovie(query);
    setResults(movieResults);
    setLoading(false);
  };

  const handleAdd = async (item: TMDBMovieResult | TMDBTVResult) => {
    setSavingId(item.id);

    const isMovie = 'title' in item;
    const title = isMovie ? (item as TMDBMovieResult).title : (item as TMDBTVResult).name;
    const originalTitle = isMovie ? (item as TMDBMovieResult).original_title : (item as TMDBTVResult).original_name;
    const date = isMovie ? (item as TMDBMovieResult).release_date : (item as TMDBTVResult).first_air_date;

    const newEntry: MovieEntry = {
      id: `tmdb_${item.id}_${Date.now()}`,
      title,
      originalTitle,
      type: isMovie ? 'movie' : 'tv',
      status: 'upcoming', // Default to upcoming so you can plan a movie night!
      date: date || new Date().toISOString().split('T')[0],
      story: item.overview,
      posterUrl: tmdbService.getImageUrl(item.poster_path),
      genres: [], // We can pull this later if needed
      videos: [],
      captures: []
    };

    try {
      await addMovieEntryToFirebase(newEntry);
      setSuccessId(item.id);
      setTimeout(() => {
        setSuccessId(null);
        navigate('/'); // Go back home after adding!
      }, 1500);
    } catch (error) {
      console.error('Error adding movie', error);
      alert('Failed to add movie. Check console.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-night-900 text-ink-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-night-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold font-serif text-popcorn">Add New Movie</h1>
        </header>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie (e.g., Home Alone)..."
            className="w-full bg-night-800 border border-night-700 rounded-2xl py-4 pl-12 pr-4 text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-popcorn focus:ring-1 focus:ring-popcorn transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" size={20} />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-popcorn text-night-900 px-4 py-1.5 rounded-xl font-medium hover:bg-yellow-400 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="space-y-4">
          {loading && <p className="text-center text-ink-400 py-8">Searching TMDB...</p>}
          
          {!loading && results.length === 0 && query && (
            <p className="text-center text-ink-400 py-8">No results found. Try a different title.</p>
          )}

          {results.map((item) => (
            <div key={item.id} className="bg-night-800 rounded-2xl p-4 flex gap-4 overflow-hidden border border-night-700">
              {item.poster_path ? (
                <img 
                  src={tmdbService.getImageUrl(item.poster_path, 'w200')} 
                  alt={'title' in item ? item.title : item.name}
                  className="w-24 h-36 object-cover rounded-xl shrink-0"
                />
              ) : (
                <div className="w-24 h-36 bg-night-700 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-ink-600 text-xs text-center px-2">No Poster</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-lg font-bold text-ink-100 truncate">
                  {'title' in item ? item.title : item.name}
                </h3>
                <p className="text-sm text-ink-400 mb-2">
                  {'release_date' in item ? item.release_date?.split('-')[0] : item.first_air_date?.split('-')[0]}
                </p>
                <p className="text-sm text-ink-300 line-clamp-3 mb-4">
                  {item.overview || 'No overview available.'}
                </p>
                
                <div className="mt-auto flex justify-end">
                  <button
                    onClick={() => handleAdd(item)}
                    disabled={savingId === item.id || successId === item.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      successId === item.id 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-night-700 hover:bg-night-600 text-ink-200'
                    }`}
                  >
                    {savingId === item.id ? (
                      <span className="animate-pulse">Adding...</span>
                    ) : successId === item.id ? (
                      <>
                        <Check size={16} /> Added!
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add to Watchlist
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
