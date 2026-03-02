import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Edit2, Trash2, Plus, Download, Upload, RefreshCw, Disc3, ExternalLink, LogOut } from 'lucide-react';
import { MovieEntry } from '../types';
import { deleteEntry, saveEntries, getEntriesAsync, getRating } from '../services/storage';
import { AddEntry } from './AddEntry';
import { EditEpisodes } from './EditEpisodes';

interface AdminProps {
  entries: MovieEntry[];
  onBack: () => void;
  onEntriesUpdate: () => Promise<void>;
  onLogout?: () => void;
  authenticatedUser?: 'jojo' | 'dodo';
}

export const Admin: React.FC<AdminProps> = ({ entries, onBack, onEntriesUpdate, onLogout, authenticatedUser }) => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MovieEntry | undefined>();
  const [editingEpisodes, setEditingEpisodes] = useState<MovieEntry | undefined>();
  const [filter, setFilter] = useState<'all' | 'watched' | 'upcoming'>('all');
  const [sort, setSort] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [entriesWithRatings, setEntriesWithRatings] = useState<MovieEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load entries with ratings merged in
  useEffect(() => {
    const loadEntriesWithRatings = async () => {
      const allEntries = await getEntriesAsync();
      const mergedEntries = allEntries.map(entry => {
        const rating = getRating(entry.id);
        return {
          ...entry,
          ratings: rating || entry.ratings
        };
      });
      setEntriesWithRatings(mergedEntries);
    };
    loadEntriesWithRatings();
  }, [entries]);

  const filteredEntries = entriesWithRatings
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.title.localeCompare(b.title);
    });

  const handleAddEntry = async (entry: MovieEntry) => {
    const currentEntries = await getEntriesAsync();
    const updated = editingEntry
      ? currentEntries.map(e => e.id === editingEntry.id ? entry : e)
      : [...currentEntries, entry];
    
    await saveEntries(updated);
    await onEntriesUpdate();
    
    setIsAddingEntry(false);
    setEditingEntry(undefined);
    showSuccess(editingEntry ? 'Entry updated!' : 'Entry added!');
  };

  const handleSaveEpisodes = async (entry: MovieEntry) => {
    const currentEntries = await getEntriesAsync();
    const updated = currentEntries.map(e => e.id === entry.id ? entry : e);
    
    await saveEntries(updated);
    await onEntriesUpdate();
    
    setEditingEpisodes(undefined);
    showSuccess('Episodes saved!');
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(id);
      await onEntriesUpdate();
      showSuccess('Entry deleted!');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movie-night-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess('Data exported!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          await saveEntries(data);
          await onEntriesUpdate();
          showSuccess('Data imported successfully!');
        } else {
          alert('Invalid data format. Expected an array of entries.');
        }
      } catch (error) {
        alert('Error importing data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Calculate average ratings for JoJo and DoDo
  const calculateAverages = () => {
    const watchedEntries = entriesWithRatings.filter(e => e.status === 'watched' && e.ratings);
    
    if (watchedEntries.length === 0) {
      return { jojo: 0, dodo: 0 };
    }

    const jojoTotal = watchedEntries.reduce((sum, entry) => sum + (entry.ratings?.jojo || 0), 0);
    const dodoTotal = watchedEntries.reduce((sum, entry) => sum + (entry.ratings?.dodo || 0), 0);

    return {
      jojo: parseFloat((jojoTotal / watchedEntries.length).toFixed(2)),
      dodo: parseFloat((dodoTotal / watchedEntries.length).toFixed(2))
    };
  };

  const averages = calculateAverages();

  if (isAddingEntry || editingEntry) {
    return (
      <AddEntry
        onBack={() => {
          setIsAddingEntry(false);
          setEditingEntry(undefined);
        }}
        onSave={handleAddEntry}
        existingEntry={editingEntry}
      />
    );
  }

  if (editingEpisodes) {
    return (
      <EditEpisodes
        entry={editingEpisodes}
        onBack={() => setEditingEpisodes(undefined)}
        onSave={handleSaveEpisodes}
      />
    );
  }

  return (
    <div className="min-h-screen bg-night-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center text-ink-300 hover:text-popcorn transition-colors font-bold text-sm uppercase tracking-wide"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-ink-100">Admin Panel</h1>
              {authenticatedUser && (
                <p className="text-xs text-ink-400 mt-1">
                  Logged in as <span className={authenticatedUser === 'jojo' ? 'text-popcorn' : 'text-pink-400'}>{authenticatedUser.toUpperCase()}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-night-700 text-ink-200 px-4 py-3 rounded-lg font-bold hover:bg-night-600 transition-colors border border-night-600"
                title="Logout"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
            <button
              onClick={() => setIsAddingEntry(true)}
              className="flex items-center gap-2 bg-popcorn text-night-900 px-5 py-3 rounded-lg font-bold hover:bg-popcorn/90 transition-colors"
            >
              <Plus size={18} />
              Add Entry
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold">
            {successMessage}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-2 text-ink-100 placeholder-night-700 focus:outline-none transition-colors"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-2 text-ink-100 focus:outline-none transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="watched">Watched</option>
            <option value="upcoming">Upcoming</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="bg-night-800 border border-night-700 focus:border-popcorn rounded-lg px-4 py-2 text-ink-100 focus:outline-none transition-colors"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* Data Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 bg-night-800 border border-night-700 hover:border-popcorn text-ink-200 hover:text-popcorn px-4 py-2 rounded-lg transition-colors font-bold text-sm"
              title="Export data as JSON"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-night-800 border border-night-700 hover:border-popcorn text-ink-200 hover:text-popcorn px-4 py-2 rounded-lg transition-colors font-bold text-sm"
              title="Import data from JSON"
            >
              <Upload size={16} />
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-night-800 border border-night-700 rounded-lg p-4">
            <p className="text-ink-300 text-sm font-bold uppercase">Total Entries</p>
            <p className="text-3xl font-bold text-popcorn">{entriesWithRatings.length}</p>
          </div>
          <div className="bg-night-800 border border-night-700 rounded-lg p-4">
            <p className="text-ink-300 text-sm font-bold uppercase">Watched</p>
            <p className="text-3xl font-bold text-green-400">{entriesWithRatings.filter(e => e.status === 'watched').length}</p>
          </div>
          <div className="bg-night-800 border border-night-700 rounded-lg p-4">
            <p className="text-ink-300 text-sm font-bold uppercase">Upcoming</p>
            <p className="text-3xl font-bold text-purple-400">{entriesWithRatings.filter(e => e.status === 'upcoming').length}</p>
          </div>
          <div className="bg-night-800 border border-night-700 rounded-lg p-4">
            <p className="text-ink-300 text-sm font-bold uppercase">JoJo Average</p>
            <p className="text-3xl font-bold text-popcorn">{averages.jojo > 0 ? averages.jojo : '—'}</p>
          </div>
          <div className="bg-night-800 border border-night-700 rounded-lg p-4">
            <p className="text-ink-300 text-sm font-bold uppercase">DoDo Average</p>
            <p className="text-3xl font-bold text-pink-400">{averages.dodo > 0 ? averages.dodo : '—'}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-night-800 border border-night-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-night-900 border-b border-night-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Videos</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-ink-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-700">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-ink-400">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map(entry => (
                    <tr
                      key={entry.id}
                      className="hover:bg-night-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.posterUrl && (
                            <img
                              src={entry.posterUrl}
                              alt={entry.title}
                              className="w-10 h-14 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-semibold text-ink-100">{entry.title}</p>
                            {entry.originalTitle && (
                              <p className="text-xs text-ink-400">{entry.originalTitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          entry.type === 'movie'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {entry.type === 'movie' ? 'Movie' : 'TV'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          entry.status === 'watched'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {entry.status === 'watched' ? 'Watched' : 'Upcoming'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-300">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-300">
                        {entry.duration || (entry.episodeRuntimeMinutes ? `${entry.episodeRuntimeMinutes}m/ep` : '—')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.ratings ? (
                          <div className="space-y-1">
                            <p className="text-popcorn font-semibold">
                              JoJo: {entry.ratings.jojo || '—'}
                            </p>
                            <p className="text-pink-400 font-semibold">
                              DoDo: {entry.ratings.dodo || '—'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-ink-400">—</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.videos && entry.videos.length > 0 ? (
                          <div className="space-y-1">
                            {entry.videos.map((video, idx) => (
                              <a
                                key={idx}
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                title={video.title}
                              >
                                <ExternalLink size={12} />
                                <span className="text-xs truncate max-w-[100px]">{video.title}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-ink-400">—</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="p-2 bg-night-900 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 size={16} />
                          </button>
                          {entry.type === 'tv' && (
                            <button
                              onClick={() => setEditingEpisodes(entry)}
                              className="p-2 bg-night-900 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded transition-colors"
                              title="Edit episodes"
                            >
                              <Disc3 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-2 bg-night-900 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
