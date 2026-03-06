import { useState, useEffect, useCallback, SyntheticEvent, MouseEvent, useRef } from 'react';
import { ArrowLeft, Download, X, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { MovieEntry } from '../types';
import { ImageWithSkeleton } from '../components/ImageWithSkeleton';
import { useSwipe } from '../hooks/useSwipe';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { saveWatchProgress, getWatchProgress, saveEpisodeProgress, getResumeEpisodeIndex } from '../services/storage';

interface DetailsProps {
  entry: MovieEntry;
  onBack: () => void;
  selectedUser?: 'jojo' | 'dodo' | null;
}

// Watchdog component at module scope to avoid re-creation on every render
function IframeWatchdog({ setFailed, timeout = 4000 }: { setFailed: () => void; timeout?: number }) {
  useEffect(() => {
    const t = setTimeout(() => setFailed(), timeout);
    return () => clearTimeout(t);
  }, [setFailed, timeout]);
  return null;
}

export const Details = ({ entry, onBack, selectedUser }: DetailsProps) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  // Initialize selectedEpisodeIndex based on the saved resume episode
  const isTv = entry.type === 'tv';
  
  // Derive status and date from episodes for TV shows
  let derivedStatus = entry.status;
  let derivedDate = entry.date;

  if (isTv && entry.episodes && entry.episodes.length > 0) {
    const upcoming = entry.episodes.find(ep => ep.status === 'upcoming');
    if (upcoming) {
      derivedStatus = 'upcoming';
      derivedDate = upcoming.date;
    } else {
      derivedStatus = 'watched';
      derivedDate = entry.episodes[entry.episodes.length - 1].date;
    }
  }

  const isWatched = derivedStatus === 'watched';
  const year = new Date(derivedDate).getFullYear();

  const initialEpisodeIndex = isTv ? getResumeEpisodeIndex(entry.id, selectedUser ?? null) : 0;
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(initialEpisodeIndex);

  // Derive episode-specific content if available
  const currentEpisode = isTv && entry.episodes ? entry.episodes[selectedEpisodeIndex] : null;
  const currentStory = currentEpisode?.summary || entry.story || entry.reason;
  
  // Combine entry captures with episode-specific captures if they existed (planning for future)
  // For now, we use the main captures but ensure the UI feels responsive to the episode
  const currentCaptures = entry.captures || [];
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSectionRef = useRef<HTMLDivElement>(null);




  // Restore selected episode from saved progress when opening/changing show or user
  useEffect(() => {
    if (!isTv || !entry.episodes?.length) return;

    const resumeIndex = getResumeEpisodeIndex(entry.id, selectedUser ?? null);
    const maxIndex = entry.episodes.length - 1;
    const clampedIndex = Math.max(0, Math.min(resumeIndex, maxIndex));

    setSelectedEpisodeIndex(clampedIndex);
  }, [entry.id, entry.episodes, isTv, selectedUser]);

  const handleEpisodeSelect = (index: number) => {
    setSelectedEpisodeIndex(index);
    // Save episode progress for the current user
    if (selectedUser && isTv) {
      saveEpisodeProgress(entry.id, selectedUser, index);
    }
    // Scroll to video player
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const onImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = 'https://via.placeholder.com/800x450?text=Image+Unavailable';
  };

  const safeVideoUrl = isTv 
    ? entry.videos?.[selectedEpisodeIndex]?.url
    : entry.videos?.[0]?.url;
  const isLocalVideo = isTv 
    ? entry.videos?.[selectedEpisodeIndex]?.type === 'local'
    : entry.videos?.[0]?.type === 'local';
  
  const isGoogleDriveUrl = safeVideoUrl?.includes('drive.google.com');
  
  const getEmbedUrl = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
  };

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  // Load saved progress when component mounts or video changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const savedProgress = getWatchProgress(entry.id);
      if (savedProgress > 0 && savedProgress < video.duration) {
        video.currentTime = savedProgress;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [entry.id]);

  // Save progress periodically and on timeupdate
  const lastSaveTimeRef = useRef<number>(0);
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const now = Date.now();
    // Only save progress every 5 seconds to avoid excessive localStorage writes
    if (now - lastSaveTimeRef.current > 5000) {
      saveWatchProgress(entry.id, videoRef.current.currentTime);
      lastSaveTimeRef.current = now;
    }
  }, [entry.id]);

  // Save progress when leaving the component
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        saveWatchProgress(entry.id, videoRef.current.currentTime);
      }
    };
  }, [entry.id]);

  // Reset iframe state when episode changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeFailed(false);
  }, [selectedEpisodeIndex, safeVideoUrl]);

  const handleDownload = () => {
    if (!safeVideoUrl) return;
    if (safeVideoUrl.includes('drive.google.com')) {
      window.open(safeVideoUrl, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = safeVideoUrl;
      a.download = `${entry.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getExternalVideoLink = (url?: string) => {
    if (!url) return null;
    try {
      const u = new URL(url, window.location.origin);
      if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
        const id = u.pathname.split('/embed/')[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  const externalVideoLink = getExternalVideoLink(safeVideoUrl);

  const handleNext = useCallback((e?: MouseEvent) => {
    e?.stopPropagation();
    if (selectedPhotoIndex !== null && entry.captures) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % entry.captures.length);
    }
  }, [selectedPhotoIndex, entry.captures]);

  const handlePrev = useCallback((e?: MouseEvent) => {
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

  // Add swipe gesture support for lightbox
  useSwipe(
    {
      onSwipeLeft: () => {
        if (selectedPhotoIndex !== null && entry.captures && entry.captures.length > 1) {
          handleNext();
        }
      },
      onSwipeRight: () => {
        if (selectedPhotoIndex !== null && entry.captures && entry.captures.length > 1) {
          handlePrev();
        }
      },
    },
    { minSwipeDistance: 50 }
  );

  const currentPhoto = selectedPhotoIndex !== null ? entry.captures?.[selectedPhotoIndex] : null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-ink-100 pb-20">
      {/* Photo Lightbox Modal */}
      {currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <button
            aria-label="Close lightbox"
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white active:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-popcorn rounded-lg p-3 min-w-[44px] min-h-[44px] transition-colors z-[60]"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <X size={36} />
          </button>

          {entry.captures && entry.captures.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-2 md:left-8 p-4 min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-popcorn text-white/50 hover:text-white focus:text-white transition-all z-[60]"
                onClick={handlePrev}
              >
                <ChevronLeft size={48} strokeWidth={1.5} />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-2 md:right-8 p-4 min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-popcorn text-white/50 hover:text-white focus:text-white transition-all z-[60]"
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
              alt={`${entry.title} - Screen capture ${selectedPhotoIndex! + 1} of ${entry.captures?.length || 0}`}
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

      {/* Top Header Section (Title) */}
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="mb-4">
          <Breadcrumbs 
            items={[{ 
              label: isTv && entry.episodes && entry.episodes[selectedEpisodeIndex] 
                ? `${entry.title} - Episode ${entry.episodes[selectedEpisodeIndex].number}` 
                : entry.title 
            }]} 
            onHome={onBack} 
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
          <div className="flex-grow">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-normal text-white mb-2 leading-tight">
              {entry.title}
              {isTv && currentEpisode && (
                <span className="text-[#fbbf24]"> - Episode {currentEpisode.number}</span>
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-300 text-sm font-bold tracking-tight">
              {entry.originalTitle && <span>Original title: {entry.originalTitle}</span>}
              <div className="flex items-center gap-3">
                <span>{new Date(currentEpisode?.date || derivedDate).getFullYear()}</span>
                <span>•</span>
                <span className="border border-ink-300/30 px-1 rounded-sm text-[10px] uppercase">PG</span>
                <span>•</span>
                <span>{isTv && currentEpisode ? `${entry.episodeRuntimeMinutes || '---'}m` : (entry.duration || 'N/A')}</span>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="flex items-center gap-6 mt-8 md:mt-0">
            {/* Download Button */}
            {safeVideoUrl && (
              <button
                onClick={handleDownload}
                aria-label={`Download ${entry.title} video`}
                className="flex items-center gap-1.5 bg-green-400/15 px-3 py-2 rounded-full hover:bg-green-400/25 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400/50"
              >
                <Download size={16} className="text-green-400" />
                <span className="text-[10px] font-bold text-green-400/80">Download</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Media Section (Poster + Trailer) */}
        <div ref={videoSectionRef} className="flex flex-col md:flex-row gap-1 mb-10 bg-black/40 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          {/* Poster */}
          <div className="md:w-[300px] shrink-0 relative group border-r border-white/5">
            <ImageWithSkeleton
              src={entry.posterUrl || 'https://via.placeholder.com/300x450'}
              alt={`${entry.title} poster`}
              className="w-full h-full object-cover aspect-[2/3] md:aspect-auto"
              containerClassName="w-full h-full"
              onError={onImageError}
            />
          </div>

          {/* Video Preview Area - Netflix Style */}
          <div className="flex-grow relative aspect-video md:aspect-auto bg-gradient-to-b from-[#1e293b] to-black flex items-center justify-center group overflow-hidden">
            {safeVideoUrl ? (
              <>
                {isLocalVideo && !isGoogleDriveUrl ? (
                  // Local video player
                  <video
                    ref={videoRef}
                    src={safeVideoUrl}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    className="absolute inset-0 w-full h-full bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // YouTube embed or Google Drive embed (both use iframe)
                  <>
                    <iframe
                      key={`video-${selectedEpisodeIndex}`}
                      src={getEmbedUrl(safeVideoUrl)}
                      title={isTv && entry.videos && entry.videos[selectedEpisodeIndex] ? entry.videos[selectedEpisodeIndex].title : (entry.videos?.[0]?.title || entry.title)}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => setIframeLoaded(true)}
                      onError={() => setIframeFailed(true)}
                    ></iframe>
                    {/* If the embed can't play (owner disabled embedding or player error), show a visible fallback */}
                    {iframeFailed && externalVideoLink && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                        <div className="text-center px-6">
                          <PlayCircle size={64} className="text-red-400 mb-4 mx-auto" />
                          <p className="text-white font-bold text-lg mb-2">Video cannot be embedded</p>
                          <p className="text-ink-300 text-sm mb-4">The video owner has disabled embedding</p>
                          <a 
                            href={externalVideoLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                          >
                            Watch on External Site
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Bottom gradient overlay for Netflix-style effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                    {/* Best-effort fallback timer: if the iframe hasn't loaded after 4s, show the external link */}
                    {(!iframeLoaded && !iframeFailed) && (
                      <IframeWatchdog setFailed={() => setIframeFailed(true)} timeout={4000} />
                    )}
                  </>
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
               <p className="text-lg md:text-xl leading-relaxed text-ink-100 font-hand italic opacity-90 mb-12">
                 "{currentStory}"
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
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 uppercase tracking-tight">
                  Episodes
                  <span className="text-ink-400 text-sm font-bold tracking-wider lowercase opacity-60">{entry.episodes.length} episodes</span>
                </h2>
                
                {/* Netflix-style episodes list */}
                <div className="space-y-3">
                  {entry.episodes.map((ep, idx) => {
                    return (
                      <div
                        key={ep.number}
                        className={`group rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedEpisodeIndex === idx 
                            ? 'bg-white/10 ring-2 ring-[#fbbf24]' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div 
                          onClick={() => handleEpisodeSelect(idx)}
                          className="flex gap-4 p-4 cursor-pointer"
                        >
                          {/* Episode number thumbnail */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded flex items-center justify-center font-black text-xl ${
                            selectedEpisodeIndex === idx 
                              ? 'bg-[#fbbf24] text-night-900' 
                              : 'bg-white/10 text-ink-200 group-hover:bg-white/20'
                          }`}>
                            {ep.number}
                          </div>
                          
                          {/* Episode info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h3 className="text-base font-bold text-white group-hover:text-[#fbbf24] transition-colors">
                                {ep.title}
                              </h3>
                              {selectedEpisodeIndex === idx && (
                                <PlayCircle size={16} className="text-[#fbbf24] flex-shrink-0" fill="#fbbf24" />
                              )}
                              
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ep.status === 'watched'
                                  ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/40'
                                  : 'bg-ink-400/20 text-ink-300 ring-1 ring-ink-400/40'
                              }`}>
                                {ep.status === 'watched' ? '✓ Watched' : 'Upcoming'}
                              </span>

                              {ep.date && (
                                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                                  {new Date(ep.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-ink-300 line-clamp-2 leading-relaxed">
                              {ep.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                     <div className={`w-2 h-2 rounded-full ${ (isTv ? currentEpisode?.status === 'watched' : isWatched) ? 'bg-green-400' : 'bg-[#c084fc] animate-pulse'}`}></div>
                     <div className="text-white font-black uppercase tracking-widest">{isTv ? currentEpisode?.status || 'upcoming' : derivedStatus}</div>
                  </div>
                </div>
                <div>
                  <div className="text-ink-300 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-50">{(isTv ? currentEpisode?.status === 'watched' : isWatched) ? 'Logged On' : 'Planned Date'}</div>
                  <div className="text-white font-extrabold text-base">{new Date(isTv ? currentEpisode?.date || derivedDate : derivedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;