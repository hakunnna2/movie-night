import { useState, useEffect, useCallback, SyntheticEvent, MouseEvent } from 'react';
import { ArrowLeft, Star, Download, X, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { MovieEntry } from '../types';
import { ImageWithSkeleton } from '../components/ImageWithSkeleton';
import { useSwipe } from '../hooks/useSwipe';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface DetailsProps {
  entry: MovieEntry;
  onBack: () => void;
}

export const Details = ({ entry, onBack }: DetailsProps) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(0);
  const isTv = entry.type === 'tv';
  const isWatched = entry.status === 'watched';
  const year = new Date(entry.date).getFullYear();

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

  // Simple watchdog component inlined to avoid extra file.
  function IframeWatchdog({ setFailed, timeout = 4000 }: { setFailed: () => void; timeout?: number }) {
    useEffect(() => {
      const t = setTimeout(() => setFailed(), timeout);
      return () => clearTimeout(t);
    }, [setFailed, timeout]);
    return null;
  }

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

      {/* Top Header Section (Title & Ratings) */}
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="mb-4">
          <Breadcrumbs items={[{ label: entry.title }]} onHome={onBack} />
        </div>

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

            {/* Download Button */}
            {safeVideoUrl && (
              <button
                onClick={handleDownload}
                aria-label={`Download ${entry.title} video`}
                className="flex flex-col items-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 rounded-lg px-2 py-1"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-300 mb-2">DOWNLOAD</span>
                <div className="flex items-center gap-2 text-green-400 group-hover:text-green-300 group-focus:text-green-300 transition-colors">
                  <Download size={32} />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Hero Media Section (Poster + Trailer) */}
        <div className="flex flex-col md:flex-row gap-1 mb-10 bg-black/40 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
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
                    src={safeVideoUrl}
                    controls
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
                  <span className="text-ink-300 text-sm font-bold tracking-widest lowercase opacity-40">{entry.episodes.length} total</span>
                </h2>
                
                {/* Full-width episodes grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {entry.episodes.map((ep, idx) => (
                    <div
                      key={ep.number}
                      onClick={() => setSelectedEpisodeIndex(idx)}
                      className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform ${
                        selectedEpisodeIndex === idx 
                          ? 'ring-4 ring-[#c084fc] scale-105 shadow-2xl shadow-[#c084fc]/50' 
                          : 'hover:scale-105 ring-1 ring-white/10 hover:ring-white/30'
                      }`}
                    >
                      {/* Episode card background */}
                      <div className={`h-56 bg-gradient-to-br from-[#c084fc]/30 to-[#1e293b] relative overflow-hidden flex flex-col items-center justify-center ${
                        selectedEpisodeIndex === idx 
                          ? 'bg-gradient-to-br from-[#c084fc]/50 to-[#2d1b4e]' 
                          : ''
                      }`}>
                        
                        {/* Decorative background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(192,132,252,0.5),transparent)]"></div>
                        </div>
                        
                        {/* Episode content */}
                        <div className="relative z-10 text-center flex flex-col items-center justify-center h-full px-4">
                          <div className="text-6xl font-black text-[#c084fc] mb-4 leading-none">
                            {ep.number < 10 ? `0${ep.number}` : ep.number}
                          </div>
                          <h3 className="text-lg font-bold text-white mb-3">{ep.title}</h3>
                          <p className="text-sm text-ink-300 line-clamp-2 opacity-80">{ep.summary}</p>
                        </div>

                        {/* Play icon for selected */}
                        {selectedEpisodeIndex === idx && (
                          <div className="absolute top-4 right-4 bg-[#c084fc] rounded-full p-3">
                            <PlayCircle size={24} className="text-white" fill="white" />
                          </div>
                        )}
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

export default Details;