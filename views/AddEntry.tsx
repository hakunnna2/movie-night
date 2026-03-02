import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Film, Tv, Calendar, Upload, X, Plus, Link } from 'lucide-react';
import { MediaType, MovieEntry, WatchStatus, VideoMedia } from '../types';

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
  const [story, setStory] = useState(existingEntry?.story || '');
  const [reason, setReason] = useState(existingEntry?.reason || '');
  const [posterUrl, setPosterUrl] = useState(existingEntry?.posterUrl || '');
  const [videos, setVideos] = useState<VideoMedia[]>(existingEntry?.videos || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingEntry && existingEntry.status === 'upcoming') {
      setStatus('watched');
    }
  }, [existingEntry]);

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

  const handleAddVideo = () => {
    setVideos([...videos, { title: '', url: '', type: 'local' }]);
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleUpdateVideo = (index: number, field: keyof VideoMedia, value: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MovieEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      title,
      type,
      status,
      date,
      posterUrl,
      videos: videos.filter(v => v.url.trim() !== ''), // Only include videos with URLs
      ...(status === 'watched' ? { story } : { reason }),
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

          {/* Poster Image */}
          <div>
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

          {/* Video Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-ink-300 uppercase ml-1">Video Links (Optional)</label>
              <button
                type="button"
                onClick={handleAddVideo}
                className="flex items-center gap-1 text-xs font-bold text-popcorn hover:text-popcorn-glow transition-colors"
              >
                <Plus size={14} />
                Add Video
              </button>
            </div>
            
            {videos.length === 0 ? (
              <div className="bg-night-900/50 border border-night-700 rounded-xl px-5 py-6 text-center">
                <Link size={24} className="mx-auto mb-2 text-ink-400" />
                <p className="text-ink-400 text-sm">No video links added</p>
                <p className="text-ink-500 text-xs mt-1">Add links to movies/episodes stored online</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={index} className="bg-night-900/50 border border-night-700 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={video.title}
                          onChange={(e) => handleUpdateVideo(index, 'title', e.target.value)}
                          placeholder="Video title (e.g., Movie, Episode 1)"
                          className="w-full bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-2 text-ink-100 placeholder-night-600 focus:outline-none transition-colors text-sm"
                        />
                        <input
                          type="url"
                          value={video.url}
                          onChange={(e) => handleUpdateVideo(index, 'url', e.target.value)}
                          placeholder="Video URL (Google Drive, YouTube, etc.)"
                          className="w-full bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-2 text-ink-100 placeholder-night-600 focus:outline-none transition-colors text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateVideo(index, 'type', 'local')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                              video.type === 'local' 
                                ? 'bg-popcorn text-night-900' 
                                : 'bg-night-800 text-ink-400 hover:text-ink-200'
                            }`}
                          >
                            Local/Drive
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateVideo(index, 'type', 'embed')}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                              video.type === 'embed' 
                                ? 'bg-popcorn text-night-900' 
                                : 'bg-night-800 text-ink-400 hover:text-ink-200'
                            }`}
                          >
                            YouTube Embed
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        title="Remove video"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conditional Fields based on Status */}
          {status === 'watched' ? (
            <div className="bg-night-900/50 p-6 rounded-2xl border border-night-700">
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