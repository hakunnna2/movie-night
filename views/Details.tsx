import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Star, Plus, List, Image as ImageIcon, PlayCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieEntry } from '../types';

interface DetailsProps {
  entry: MovieEntry;
  onBack: () => void;
}

export const Details: React.FC<DetailsProps> = ({ entry, onBack }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const isTv = entry.type === 'tv';
  const isWatched = entry.status === 'watched';
  const year = new Date(entry.date).getFullYear();

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = 'https://via.placeholder.com/800x450?text=Image+Unavailable';
  };

  const safeVideoUrl = entry.videos && entry.videos.length > 0 && /^https?:\/\//.test(entry.videos[0].url)
    ? entry.videos[0].url
    : null;

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  // Show a helpful external link for YouTube if embed fails or as a quick fallback
  const getExternalVideoLink = (url?: string) => {
    if (!url) return null;
    try {
      const u = new URL(url, window.location.origin);
      // Convert embed URL to watch URL when possible
      if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
        const id = u.pathname.split('/embed/')[1];
        if (id) return `https://www.youtube.com/watch?v=${id}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const externalVideoLink = getExternalVideoLink(safeVideoUrl || undefined);

  // Simple watchdog component inlined to avoid extra file.
  function IframeWatchdog({ setFailed, timeout = 4000 }: { setFailed: () => void; timeout?: number }) {
    useEffect(() => {
      const t = setTimeout(() => setFailed(), timeout);
      return () => clearTimeout(t);
    }, [setFailed, timeout]);
    return null;
  }

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhotoIndex !== null && entry.captures) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % entry.captures.length);
    }
  }, [selectedPhotoIndex, entry.captures]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhotoIndex !== null && entry.captures) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + entry.captures.length) % entry.captures.length);
    }
  }, [selectedPhotoIndex, entry.captures]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedPhotoIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handleNext, handlePrev]);

  useEffect(() => {
    const noop = () => {};
    return noop;
  }, []);

  const currentPhoto = selectedPhotoIndex !== null ? entry.captures?.[selectedPhotoIndex] : null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-ink-100 pb-20">
      {/* Photo Lightbox Modal */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[60]"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <X size={40} />
          </button>

          {/* Navigation Arrows */}
          {entry.captures && entry.captures.length > 1 && (
            <>
              <button
                className="absolute left-4 md:left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-[60]"
                onClick={handlePrev}
              >
                <ChevronLeft size={48} strokeWidth={1.5} />
              </button>
              <button
                className="absolute right-4 md:right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-[60]"
                onClick={handleNext}
              >
                <ChevronRight size={48} strokeWidth={1.5} />
              </button>
            </>
          )}

          <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentPhoto}
              onError={onImageError}
              loading="lazy"
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm border border-white/10 transition-all duration-300"
              alt="Full screen capture"
            />
            {/* Image Counter */}
            {entry.captures && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/40 font-black text-xs uppercase tracking-[0.3em]">
                {selectedPhotoIndex! + 1} / {entry.captures.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Header Section (Title & Ratings) */}
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <button 
          onClick={onBack}
          className="flex items-center text-ink-300 hover:text-[#fbbf24] transition-colors mb-6 text-[10px] uppercase font-black tracking-[0.2em]"
        >
          <ArrowLeft size={14} className="mr-2" />
          Back to Journal
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div className="flex-grow">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-normal text-white mb-2 leading-tight">
              {entry.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-300 text-sm font-bold tracking-tight">
              {entry.originalTitle && <span>Original title: {entry.originalTitle}</span>}
              <div className="flex items-center gap-3">
                <span>{year}</span>
                <span>•</span>
                <span className="border border-ink-300/30 px-1 rounded-sm text-[10px] uppercase">PG</span>
                <span>•</span>
                <span>{entry.duration || (isTv ? `${entry.episodes?.length || 0} Episodes` : 'N/A')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10 mt-8 md:mt-0">
            {/* Your Rating */}
            <div className="flex flex-col items-center group cursor-pointer">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-300 mb-2">YOUR RATING</span>
              <div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                <Star size={32} className={entry.rating && isWatched ? "fill-blue-400" : ""} />
                <div className="flex flex-col">
                   <span className="text-xl font-black uppercase leading-none">
                     {entry.rating && isWatched ? `${entry.rating}/5` : 'Rate'}
                   </span>
                   {!isWatched && <span className="text-[9px] font-black uppercase tracking-tighter opacity-50 mt-0.5">Will Rate</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Media Section (Poster + Trailer) */}
        <div className="flex flex-col md:flex-row gap-1 mb-10 bg-black/40 rounded-xl overflow-hidden border border-white/5 shadow-2xl">
          {/* Poster */}
          <div className="md:w-[300px] shrink-0 relative group border-r border-white/5">
            <img 
              src={entry.posterUrl || 'https://via.placeholder.com/300x450'} 
              onError={onImageError}
              loading="lazy"
              className="w-full h-full object-cover aspect-[2/3] md:aspect-auto"
              alt={`${entry.title} poster`}
            />
          </div>

          {/* Trailer Preview Area */}
          <div className="flex-grow relative aspect-video md:aspect-auto bg-[#1e293b] flex items-center justify-center group overflow-hidden">
            {safeVideoUrl ? (
              <>
                <iframe
                  src={safeVideoUrl}
                  title={entry.videos![0].title}
                  className="absolute inset-0 w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => setIframeLoaded(true)}
                ></iframe>
                {/* If the embed can't play (owner disabled embedding or player error), show a visible fallback */}
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-ink-300 text-center opacity-0 md:opacity-100 bg-black/60 px-4 py-2 rounded-md pointer-events-auto">
                      <div className="text-sm font-bold">Loading video...</div>
                    </div>
                  </div>
                )}
                {iframeFailed && externalVideoLink && (
                  <div className="absolute bottom-4 right-4">
                    <a href={externalVideoLink} target="_blank" rel="noopener noreferrer" className="bg-white/5 text-white px-3 py-2 rounded-md font-black text-sm hover:bg-white/10">Watch on YouTube</a>
                  </div>
                )}
                {/* Best-effort fallback timer: if the iframe hasn't loaded after 4s, show the external link */}
                {(!iframeLoaded && !iframeFailed) && (
                  <IframeWatchdog setFailed={() => setIframeFailed(true)} timeout={4000} />
                )}
              </>
            ) : (
              <div className="text-ink-300 flex flex-col items-center opacity-30">
                <PlayCircle size={80} className="mb-4" />
                <span className="font-black uppercase tracking-[0.3em] text-xs">No Video Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Info & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {entry.genres?.map((g) => (
                <span key={g} className="px-5 py-2 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 cursor-pointer transition-all hover:border-[#fbbf24] hover:text-[#fbbf24]">
                  {g}
                </span>
              )) || <span className="px-5 py-2 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-widest text-white">General</span>}
            </div>

            <div className="relative pl-6">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fbbf24]/30 rounded-full"></div>
               <p className="text-2xl md:text-3xl leading-relaxed text-ink-100 font-hand italic opacity-90 mb-12">
                 "{entry.story || entry.reason}"
               </p>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent w-full mb-12"></div>

            {/* Sub Sections (Gallery & Episodes) */}
            {entry.captures && entry.captures.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 border-l-4 border-[#fbbf24] pl-4 uppercase tracking-tight">
                  Captures
                  <span className="text-ink-300 text-sm font-bold tracking-widest lowercase opacity-40">{entry.captures.length} frames</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {entry.captures.map((url, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-video bg-[#1a2332] rounded-lg overflow-hidden cursor-zoom-in border border-white/5 shadow-lg group relative"
                      onClick={() => setSelectedPhotoIndex(idx)}
                    >
                      <img 
                        src={url} 
                        onError={onImageError}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                        alt={`Capture ${idx + 1}`}
                      />
                      <div className="absolute inset-0 bg-popcorn/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isTv && entry.episodes && (
              <section>
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 border-l-4 border-[#c084fc] pl-4 uppercase tracking-tight">
                  Episodes
                  <span className="text-ink-300 text-sm font-bold tracking-widest lowercase opacity-40">{entry.episodes.length} logged</span>
                </h2>
                <div className="space-y-4">
                  {entry.episodes.map((ep) => (
                    <div key={ep.number} className="bg-white/5 p-6 rounded-xl flex gap-6 hover:bg-white/10 transition-all border border-white/5 group">
                       <span className="text-[#c084fc] font-black text-3xl opacity-40 group-hover:opacity-100 transition-opacity">
                         {ep.number < 10 ? `0${ep.number}` : ep.number}
                       </span>
                       <div>
                         <h4 className="font-extrabold text-lg text-white mb-1">{ep.title}</h4>
                         <p className="text-sm text-ink-300 leading-relaxed opacity-80">{ep.summary}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block space-y-10">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/5 shadow-xl backdrop-blur-sm">
              <h3 className="text-[#fbbf24] text-[10px] font-black uppercase tracking-[0.4em] mb-6">Status Details</h3>
              <div className="space-y-6 text-sm">
                <div>
                  <div className="text-ink-300 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-50">Watch Status</div>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${isWatched ? 'bg-green-400' : 'bg-[#c084fc] animate-pulse'}`}></div>
                     <div className="text-white font-black uppercase tracking-widest">{entry.status}</div>
                  </div>
                </div>
                <div>
                  <div className="text-ink-300 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-50">{isWatched ? 'Logged On' : 'Planned Date'}</div>
                  <div className="text-white font-extrabold text-base">{new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};