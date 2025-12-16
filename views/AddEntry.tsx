import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Film, Tv, Calendar } from 'lucide-react';
import { MediaType, MovieEntry, WatchStatus } from '../types';
import { StarRating } from '../components/StarRating';

interface AddEntryProps {
  onBack: () => void;
  onSave: (entry: MovieEntry) => void;
  existingEntry?: MovieEntry;
}

export const AddEntry: React.FC<AddEntryProps> = ({ onBack, onSave, existingEntry }) => {
  const [title, setTitle] = useState(existingEntry?.title || '');
  const [type, setType] = useState<MediaType>(existingEntry?.type || 'movie');
  const [status, setStatus] = useState<WatchStatus>(existingEntry?.status || 'watched');
  const [date, setDate] = useState(existingEntry?.date ? new Date(existingEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(existingEntry?.rating || 3);
  const [story, setStory] = useState(existingEntry?.story || '');
  const [reason, setReason] = useState(existingEntry?.reason || '');
  const [posterUrl, setPosterUrl] = useState(existingEntry?.posterUrl || '');

  useEffect(() => {
    if (existingEntry && existingEntry.status === 'upcoming') {
      setStatus('watched');
    }
  }, [existingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MovieEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      title,
      type,
      status,
      date,
      posterUrl,
      ...(status === 'watched' ? { rating, story } : { reason }),
    };
    onSave(entry);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center text-ink-300 hover:text-popcorn transition-colors mb-8 font-bold text-sm uppercase tracking-wide"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Library
      </button>

      <div className="bg-night-800 rounded-2xl p-6 md:p-10 shadow-xl border border-night-700">
        <h2 className="text-3xl font-bold text-ink-100 mb-8 text-center">
          {existingEntry ? (existingEntry.status === 'upcoming' ? 'Marking as Watched' : 'Edit Entry') : 'New Log Entry'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Status Toggle */}
          {!existingEntry && (
            <div className="flex justify-center">
                <div className="flex bg-night-900 rounded-lg p-1 border border-night-700">
                <button
                    type="button"
                    onClick={() => setStatus('watched')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${status === 'watched' ? 'bg-popcorn text-night-900' : 'text-ink-300 hover:text-ink-100'}`}
                >
                    Watched
                </button>
                <button
                    type="button"
                    onClick={() => setStatus('upcoming')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${status === 'upcoming' ? 'bg-dream text-night-900' : 'text-ink-300 hover:text-ink-100'}`}
                >
                    Plan to Watch
                </button>
                </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Movie or Show Name"
              className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl px-5 py-4 text-lg text-ink-100 placeholder-night-700 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType('movie')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border transition-all font-bold ${type === 'movie' ? 'bg-night-700 border-popcorn text-popcorn' : 'bg-night-900 border-night-700 text-ink-300 hover:border-night-600'}`}
                >
                  <Film size={18} /> Movie
                </button>
                <button
                  type="button"
                  onClick={() => setType('tv')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border transition-all font-bold ${type === 'tv' ? 'bg-night-700 border-popcorn text-popcorn' : 'bg-night-900 border-night-700 text-ink-300 hover:border-night-600'}`}
                >
                  <Tv size={18} /> TV
                </button>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">
                {status === 'watched' ? 'Date Watched' : 'Planned Date'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" size={18} />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl pl-12 pr-4 py-4 text-ink-100 focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Poster URL */}
          <div>
            <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">Poster URL (Optional)</label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://image.tmdb.org/..."
              className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl px-5 py-4 text-ink-100 placeholder-night-700 focus:outline-none transition-colors"
            />
          </div>

          {/* Conditional Fields based on Status */}
          {status === 'watched' ? (
            <div className="bg-night-900/50 p-6 rounded-2xl border border-night-700">
              <div className="mb-6">
                <label className="block text-xs font-bold text-ink-300 uppercase mb-3">Our Rating</label>
                <div className="inline-block bg-night-800 px-4 py-3 rounded-xl border border-night-700">
                  <StarRating rating={rating} interactive onRate={setRating} size={28} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">The Story</label>
                <textarea
                  rows={4}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="What will we remember about this night?"
                  className="w-full bg-night-800 border border-night-700 rounded-xl px-5 py-4 text-ink-100 placeholder-night-600 focus:outline-none focus:border-dream transition-colors font-hand text-xl"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">Why this one?</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Heard good things? Next in the franchise?"
                className="w-full bg-night-900 border border-night-700 focus:border-dream rounded-xl px-5 py-4 text-ink-100 placeholder-night-700 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-popcorn hover:bg-popcorn-glow text-night-900 font-extrabold text-lg py-4 rounded-xl transition-all hover:shadow-glow flex items-center justify-center gap-3 uppercase tracking-wide"
            >
              <Save size={20} />
              Save to Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};