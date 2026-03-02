import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { MovieEntry, Episode } from '../types';

interface EditEpisodesProps {
  entry: MovieEntry;
  onBack: () => void;
  onSave: (entry: MovieEntry) => void;
}

export const EditEpisodes: React.FC<EditEpisodesProps> = ({ entry, onBack, onSave }) => {
  const [episodes, setEpisodes] = useState<Episode[]>(entry.episodes || []);
  const [episodeRuntimeMinutes, setEpisodeRuntimeMinutes] = useState(entry.episodeRuntimeMinutes || 45);
  const [newEpisodeTitle, setNewEpisodeTitle] = useState('');
  const [newEpisodeSummary, setNewEpisodeSummary] = useState('');
  const [newEpisodeDate, setNewEpisodeDate] = useState('');
  const [posterUrl, setPosterUrl] = useState(entry.posterUrl || '');
  const [editingEpisodeDate, setEditingEpisodeDate] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddEpisode = () => {
    if (!newEpisodeTitle.trim()) return;
    const newEpisode: Episode = {
      number: episodes.length + 1,
      title: newEpisodeTitle,
      summary: newEpisodeSummary,
      date: newEpisodeDate || undefined,
    };
    setEpisodes([...episodes, newEpisode]);
    setNewEpisodeTitle('');
    setNewEpisodeSummary('');
    setNewEpisodeDate('');
  };

  const handleRemoveEpisode = (index: number) => {
    setEpisodes(episodes.filter((_, i) => i !== index).map((ep, i) => ({ ...ep, number: i + 1 })));
  };

  const handleUpdateEpisodeDate = (index: number, date: string) => {
    const updated = episodes.map((ep, i) => 
      i === index ? { ...ep, date: date || undefined } : ep
    );
    setEpisodes(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPosterUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setPosterUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const updated: MovieEntry = {
      ...entry,
      episodes,
      episodeRuntimeMinutes,
      posterUrl,
    };
    onSave(updated);
  };

  return (
    <div className="min-h-screen bg-night-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center text-ink-300 hover:text-popcorn transition-colors mb-8 font-bold text-sm uppercase tracking-wide"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Admin
        </button>

        <div className="bg-night-800 rounded-2xl p-8 border border-night-700">
          <h1 className="text-3xl font-bold text-ink-100 mb-2">{entry.title}</h1>
          <p className="text-ink-400 text-sm mb-8 uppercase tracking-wide">Manage Episodes</p>

          {/* Poster Image */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-ink-300 uppercase mb-3 ml-1">Poster Image (Optional)</label>
            
            {/* Image Preview */}
            {posterUrl && (
              <div className="mb-4 relative inline-block">
                <img
                  src={posterUrl}
                  alt="Poster preview"
                  className="h-40 rounded-lg border border-night-700 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  title="Clear image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="space-y-3">
              {/* File Upload */}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-night-900 border-2 border-dashed border-night-700 hover:border-popcorn rounded-xl px-5 py-4 text-ink-300 hover:text-popcorn transition-colors font-bold flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* URL Input */}
              <input
                type="url"
                value={posterUrl.startsWith('data:') ? '' : posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl px-5 py-4 text-ink-100 placeholder-night-700 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Episode Runtime */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-ink-300 uppercase mb-3">Episode Runtime (minutes)</label>
            <input
              type="number"
              min="1"
              value={episodeRuntimeMinutes}
              onChange={(e) => setEpisodeRuntimeMinutes(parseInt(e.target.value) || 45)}
              className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl px-5 py-4 text-ink-100 focus:outline-none transition-colors"
            />
          </div>

          {/* Episodes List */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-ink-100 mb-4 uppercase tracking-wide">Episodes ({episodes.length})</h2>
            
            {episodes.length === 0 ? (
              <div className="bg-night-900/50 p-6 rounded-lg border border-night-700 text-center">
                <p className="text-ink-400 italic">No episodes added yet</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {episodes.map((ep, idx) => (
                  <div key={idx} className="bg-night-900 p-4 rounded-lg border border-night-700">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-popcorn">Episode {ep.number}</p>
                        <p className="text-sm text-ink-100 font-semibold">{ep.title}</p>
                        {ep.summary && (
                          <p className="text-xs text-ink-400 mt-2 line-clamp-3">{ep.summary}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveEpisode(idx)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors flex-shrink-0"
                        title="Delete episode"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    {/* Episode Date Section */}
                    <div className="border-t border-night-700 pt-3">
                      {editingEpisodeDate === idx ? (
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={ep.date || ''}
                            onChange={(e) => handleUpdateEpisodeDate(idx, e.target.value)}
                            className="flex-1 bg-night-800 border border-night-700 focus:border-popcorn rounded px-3 py-2 text-ink-100 focus:outline-none transition-colors text-sm"
                          />
                          <button
                            onClick={() => setEditingEpisodeDate(null)}
                            className="bg-night-700 hover:bg-popcorn/20 text-popcorn px-3 py-2 rounded text-sm font-semibold transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingEpisodeDate(idx)}
                          className="w-full text-left text-xs text-ink-400 hover:text-popcorn transition-colors py-1"
                        >
                          📅 Watched: {ep.date ? new Date(ep.date).toLocaleDateString() : 'Click to set date'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Episode Form */}
          <div className="bg-night-900/50 p-6 rounded-2xl border border-night-700 space-y-4 mb-8">
            <h3 className="font-bold text-ink-100 uppercase tracking-wide text-sm">Add New Episode</h3>
            
            <input
              type="text"
              value={newEpisodeTitle}
              onChange={(e) => setNewEpisodeTitle(e.target.value)}
              placeholder="Episode title"
              className="w-full bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-3 text-ink-100 placeholder-night-700 focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleAddEpisode()}
            />

            <textarea
              rows={3}
              value={newEpisodeSummary}
              onChange={(e) => setNewEpisodeSummary(e.target.value)}
              placeholder="Episode summary (optional)"
              className="w-full bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-3 text-ink-100 placeholder-night-700 focus:outline-none transition-colors"
            />

            <input
              type="date"
              value={newEpisodeDate}
              onChange={(e) => setNewEpisodeDate(e.target.value)}
              placeholder="Watched date (optional)"
              className="w-full bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-3 text-ink-100 focus:outline-none transition-colors"
            />

            <button
              onClick={handleAddEpisode}
              disabled={!newEpisodeTitle.trim()}
              className="w-full bg-night-700 hover:bg-night-600 disabled:opacity-50 disabled:cursor-not-allowed text-popcorn font-bold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Episode
            </button>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-popcorn hover:bg-popcorn/90 text-night-900 font-bold py-4 rounded-xl transition-colors uppercase tracking-wide"
            >
              Save Episodes
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-night-700 hover:bg-night-600 text-ink-100 font-bold py-4 rounded-xl transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
