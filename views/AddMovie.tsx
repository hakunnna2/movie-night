import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Check } from 'lucide-react';
import { addMovieEntryToFirebase } from '../services/firebase.service';
import { MovieEntry } from '../types';

export const AddMovie = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [status, setStatus] = useState<'watched' | 'upcoming'>('upcoming');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [story, setStory] = useState('');
  const [reason, setReason] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [genres, setGenres] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');

    const newEntry: MovieEntry = {
      id: `manual_${Date.now()}`,
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      type,
      status,
      date,
      story: status === 'watched' ? story.trim() || undefined : undefined,
      reason: status === 'upcoming' ? reason.trim() || undefined : undefined,
      posterUrl: posterUrl.trim() || undefined,
      genres: genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
      duration: duration.trim() || undefined,
      videos: [],
      captures: [],
    };

    try {
      await addMovieEntryToFirebase(newEntry);
      setSaved(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (submitError) {
      console.error('Error adding movie entry', submitError);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-night-900 text-ink-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-night-800 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold font-serif text-popcorn">Add Entry</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 bg-night-800 border border-night-700 rounded-2xl p-5">
          <div>
            <label htmlFor="title" className="block text-sm text-ink-300 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
              placeholder="e.g., Home Alone"
              required
            />
          </div>

          <div>
            <label htmlFor="originalTitle" className="block text-sm text-ink-300 mb-1">Original Title (optional)</label>
            <input
              id="originalTitle"
              type="text"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm text-ink-300 mb-1">Type</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'movie' | 'tv')}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
              >
                <option value="movie">Movie</option>
                <option value="tv">TV</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm text-ink-300 mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'watched' | 'upcoming')}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
              >
                <option value="upcoming">Upcoming</option>
                <option value="watched">Watched</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm text-ink-300 mb-1">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm text-ink-300 mb-1">Duration (optional)</label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
                placeholder="e.g., 2h 11m"
              />
            </div>
          </div>

          <div>
            <label htmlFor="genres" className="block text-sm text-ink-300 mb-1">Genres (comma-separated)</label>
            <input
              id="genres"
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
              placeholder="Comedy, Family"
            />
          </div>

          <div>
            <label htmlFor="posterUrl" className="block text-sm text-ink-300 mb-1">Poster URL (optional)</label>
            <input
              id="posterUrl"
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-popcorn"
              placeholder="https://..."
            />
          </div>

          {status === 'watched' ? (
            <div>
              <label htmlFor="story" className="block text-sm text-ink-300 mb-1">Memory / Story</label>
              <textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-1 focus:ring-popcorn"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="reason" className="block text-sm text-ink-300 mb-1">Reason to Watch</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-night-900 border border-night-700 rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-1 focus:ring-popcorn"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || saved}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                saved ? 'bg-green-500/20 text-green-400' : 'bg-popcorn text-night-900 hover:bg-yellow-400'
              }`}
            >
              {saving ? (
                <span className="animate-pulse">Saving...</span>
              ) : saved ? (
                <>
                  <Check size={16} /> Saved
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
