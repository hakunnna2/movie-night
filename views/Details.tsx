import { useState, useEffect, useCallback, SyntheticEvent, MouseEvent, useRef, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ArrowLeft, Star, Download, X, ChevronLeft, ChevronRight, PlayCircle, SendHorizonal } from 'lucide-react';
import { MovieEntry } from '../types';
import { ImageWithSkeleton } from '../components/ImageWithSkeleton';
import { useSwipe } from '../hooks/useSwipe';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { saveWatchProgress, getWatchProgress, saveRating, getRating, saveEpisodeProgress, getResumeEpisodeIndex, saveEpisodeRating, getEpisodeRating, saveEpisodeStatus, getEpisodeStatus, initializeEpisodeStatuses, saveComment, getCommentThread } from '../services/storage';

interface DetailsProps {
  entry: MovieEntry;
  onBack: () => void;
  selectedUser?: 'jojo' | 'dodo' | null;
  onRatingUpdate?: () => Promise<void>;
}

export const Details = ({ entry, onBack, selectedUser, onRatingUpdate }: DetailsProps) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  // Initialize selectedEpisodeIndex based on the saved resume episode
  const isTv = entry.type === 'tv';
  const isAbiSeries = isTv && (
    entry.originalTitle?.toLowerCase() === 'abi' ||
    entry.title.toLowerCase().includes('abi')
  );
  const initialEpisodeIndex = isTv ? getResumeEpisodeIndex(entry.id, selectedUser ?? null) : 0;
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState<number>(initialEpisodeIndex);
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempJojoRating, setTempJojoRating] = useState(0);
  const [tempDodoRating, setTempDodoRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);
  const [commentThread, setCommentThread] = useState<ReturnType<typeof getCommentThread>>([]);
  
  // Track current ratings (from storage, not static entry)
  const [currentRatings, setCurrentRatings] = useState<{ jojo: number; dodo: number }>({
    jojo: entry.ratings?.jojo || 0,
    dodo: entry.ratings?.dodo || 0
  });
  
  // Track episode ratings
  const [episodeRatings, setEpisodeRatings] = useState<Record<number, { jojo: number; dodo: number }>>({});
  
  // Track episode statuses per user
  const [episodeStatuses, setEpisodeStatuses] = useState<Record<number, 'watched' | 'upcoming'>>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const isWatched = entry.status === 'watched';
  const year = new Date(entry.date).getFullYear();

  // Load ratings from storage on mount
  useEffect(() => {
    const storedRatings = getRating(entry.id);
    if (storedRatings) {
      setCurrentRatings(storedRatings);
    }
  }, [entry.id]);

  // Load episode ratings on mount
  useEffect(() => {
    if (isTv && entry.episodes && selectedUser) {
      // Initialize episodes 1-7 as watched on first load for Abi series
      if (isAbiSeries) {
        initializeEpisodeStatuses(entry.id);
      }
      
      const ratings: Record<number, { jojo: number; dodo: number }> = {};
      const statuses: Record<number, 'watched' | 'upcoming'> = {};
      entry.episodes.forEach(ep => {
        ratings[ep.number] = getEpisodeRating(entry.id, ep.number);
        statuses[ep.number] = getEpisodeStatus(entry.id, ep.number, selectedUser);
      });
      setEpisodeRatings(ratings);
      setEpisodeStatuses(statuses);
    }
  }, [entry.id, entry.episodes, isTv, isAbiSeries, selectedUser]);

  // Restore selected episode from saved progress when opening/changing show or user
  useEffect(() => {
    if (!isTv || !entry.episodes?.length) return;

    const resumeIndex = getResumeEpisodeIndex(entry.id, selectedUser ?? null);
    const maxIndex = entry.episodes.length - 1;
    const clampedIndex = Math.max(0, Math.min(resumeIndex, maxIndex));

    setSelectedEpisodeIndex(clampedIndex);
  }, [entry.id, entry.episodes, isTv, selectedUser]);

  // Load saved comment for this entry (and selected user, if any)
  useEffect(() => {
    setCommentThread(getCommentThread(entry.id, selectedUser));
    setCommentInput('');
    setCommentSaved(false);
  }, [entry.id, selectedUser]);

  // Update temp ratings when modal opens
  useEffect(() => {
    if (showRatingModal) {
      setTempJojoRating(currentRatings.jojo);
      setTempDodoRating(currentRatings.dodo);
    }
  }, [showRatingModal, currentRatings]);

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

  const handleSaveRating = async () => {
    try {
      // Only save rating for the current user
      if (selectedUser === 'jojo' && tempJojoRating > 0) {
        await saveRating(entry.id, 'jojo', tempJojoRating);
        setCurrentRatings(prev => ({ ...prev, jojo: tempJojoRating }));
      }
      if (selectedUser === 'dodo' && tempDodoRating > 0) {
        await saveRating(entry.id, 'dodo', tempDodoRating);
        setCurrentRatings(prev => ({ ...prev, dodo: tempDodoRating }));
      }
      
      // Trigger parent component to reload entries
      if (onRatingUpdate) {
        await onRatingUpdate();
      }
      
      setShowRatingModal(false);
    } catch (error) {
      console.error('Failed to save rating:', error);
    }
  };

  const handleEpisodeRating = async (episodeNumber: number, rating: number) => {
    if (!selectedUser) return;
    
    try {
      await saveEpisodeRating(entry.id, episodeNumber, selectedUser, rating);
      
      // Update local state
      const updatedRatings = {
        ...episodeRatings,
        [episodeNumber]: {
          ...episodeRatings[episodeNumber],
          [selectedUser]: rating
        }
      };
      setEpisodeRatings(updatedRatings);

      // Calculate average rating for this user across all episodes
      if (entry.episodes && entry.episodes.length > 0) {
        const ratings = entry.episodes
          .map(ep => updatedRatings[ep.number]?.[selectedUser] || 0)
          .filter(r => r > 0);
        
        if (ratings.length > 0) {
          const average = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
          
          // Save the average as the entry-level rating
          await saveRating(entry.id, selectedUser, average);
          
          // Update current ratings
          setCurrentRatings(prev => ({
            ...prev,
            [selectedUser]: average
          }));
        }
      }
    } catch (error) {
      console.error('Failed to save episode rating:', error);
    }
  };

  const handleSaveComment = () => {
    saveComment(entry.id, commentInput, selectedUser);
    setCommentThread(getCommentThread(entry.id, selectedUser));
    setCommentInput('');
    setCommentSaved(true);
  };

  const canSendComment = commentInput.trim().length > 0;

  const handleCommentKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSendComment) {
      e.preventDefault();
      handleSaveComment();
    }
  };

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

      {/* Rating Modal - Only for Movies, not TV shows */}
      {showRatingModal && selectedUser && !isTv && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Rate {entry.title}
                {selectedUser === 'jojo' && <span className="text-[#fbbf24] ml-2">(JoJo)</span>}
                {selectedUser === 'dodo' && <span className="text-[#c084fc] ml-2">(DoDo)</span>}
              </h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-ink-400 hover:text-ink-200 transition-colors"
                aria-label="Close rating modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Rating Section - Only show for current user */}
            {selectedUser === 'jojo' && (
              <div className="mb-8">
                <label className="text-[#fbbf24] font-bold text-sm mb-3 block">JoJo's Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`jojo-${star}`}
                      onClick={() => setTempJojoRating(star)}
                      className="transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={32}
                        className={star <= tempJojoRating ? "fill-[#fbbf24] text-[#fbbf24]" : "text-[#fbbf24]/30"}
                      />
                    </button>
                  ))}
                </div>
                {tempJojoRating > 0 && <span className="text-[#fbbf24] text-sm mt-2 block">{tempJojoRating}/5</span>}
              </div>
            )}

            {selectedUser === 'dodo' && (
              <div className="mb-8">
                <label className="text-[#c084fc] font-bold text-sm mb-3 block">DoDo's Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`dodo-${star}`}
                      onClick={() => setTempDodoRating(star)}
                      className="transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={32}
                        className={star <= tempDodoRating ? "fill-[#c084fc] text-[#c084fc]" : "text-[#c084fc]/30"}
                      />
                    </button>
                  ))}
                </div>
                {tempDodoRating > 0 && <span className="text-[#c084fc] text-sm mt-2 block">{tempDodoRating}/5</span>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveRating}
                className="flex-1 bg-gradient-to-r from-[#fbbf24] to-[#c084fc] hover:shadow-lg hover:shadow-popcorn/50 text-night-900 font-bold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Save Rating
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-2 text-ink-300 hover:text-ink-100 border border-ink-400/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Section (Title & Ratings) */}
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
              {isTv && entry.episodes && entry.episodes[selectedEpisodeIndex] && (
                <span className="text-[#fbbf24]"> - Episode {entry.episodes[selectedEpisodeIndex].number}</span>
              )}
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

          {/* Ratings and Download Section */}
          <div className="flex items-center gap-6 mt-8 md:mt-0">
            {/* Dual Ratings - Only show for Movies, not TV shows */}
            {!isTv && isWatched && (currentRatings.jojo > 0 || currentRatings.dodo > 0) ? (
              <div className="flex gap-2">
                {/* JoJo Rating */}
                <button
                  onClick={() => selectedUser === 'jojo' && setShowRatingModal(true)}
                  disabled={selectedUser !== 'jojo'}
                  className={`flex items-center gap-1.5 bg-[#fbbf24]/15 px-3 py-2 rounded-full transition-all ${
                    selectedUser === 'jojo'
                      ? 'hover:bg-[#fbbf24]/25 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  aria-label={selectedUser === 'jojo' ? "Edit JoJo's rating" : "JoJo's rating"}
                >
                  <span className="text-[10px] font-bold text-[#fbbf24]/80">JoJo</span>
                  <span className="text-lg font-black text-[#fbbf24]">{currentRatings.jojo}</span>
                  <span className="text-[10px] font-bold text-[#fbbf24]/60">/5</span>
                </button>

                {/* DoDo Rating */}
                <button
                  onClick={() => selectedUser === 'dodo' && setShowRatingModal(true)}
                  disabled={selectedUser !== 'dodo'}
                  className={`flex items-center gap-1.5 bg-[#c084fc]/15 px-3 py-2 rounded-full transition-all ${
                    selectedUser === 'dodo'
                      ? 'hover:bg-[#c084fc]/25 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  aria-label={selectedUser === 'dodo' ? "Edit DoDo's rating" : "DoDo's rating"}
                >
                  <span className="text-[10px] font-bold text-[#c084fc]/80">DoDo</span>
                  <span className="text-lg font-black text-[#c084fc]">{currentRatings.dodo}</span>
                  <span className="text-[10px] font-bold text-[#c084fc]/60">/5</span>
                </button>
              </div>
            ) : !isTv ? (
              /* Fallback to single rating for Movies only */
              <button
                onClick={() => setShowRatingModal(true)}
                className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Add rating"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-300 mb-2">RATING</span>
                <div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <Star size={32} className={entry.rating && isWatched ? "fill-blue-400" : ""} />
                  <div className="flex flex-col">
                     <span className="text-xl font-black uppercase leading-none">
                       {entry.rating && isWatched ? `${entry.rating}/5` : 'Rate'}
                     </span>
                     {!isWatched && <span className="text-[9px] font-black uppercase tracking-tighter opacity-50 mt-0.5">Will Rate</span>}
                  </div>
                </div>
              </button>
            ) : null}

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
                 "{entry.story || entry.reason}"
               </p>
            </div>

            {/* Comment Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-4 border-l-4 border-[#fbbf24] pl-4 uppercase tracking-tight">
                Chat
              </h2>
              <div className="bg-black/50 border border-white/10 rounded-2xl p-3 md:p-4">
                <div className="mb-3 max-h-80 overflow-y-auto space-y-2.5 pr-1">
                  {commentThread.length > 0 ? (
                    commentThread.map((message) => {
                      const isMine = selectedUser ? message.sender === selectedUser : message.sender !== 'shared';
                      const senderInitial = message.sender === 'jojo' ? 'J' : message.sender === 'dodo' ? 'D' : '•';

                      return (
                        <div key={message.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          {!isMine && (
                            <div className="w-7 h-7 rounded-full bg-white/25 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {senderInitial}
                            </div>
                          )}

                          <div className={`max-w-[82%] px-4 py-2 rounded-[22px] ${
                            isMine
                              ? 'bg-gradient-to-r from-popcorn to-pink-400 text-night-900 rounded-br-md'
                              : 'bg-white/15 text-white rounded-bl-md'
                          }`}>
                            <p className="text-sm leading-relaxed break-words">{message.text}</p>
                            <div className={`text-[10px] mt-1 ${isMine ? 'text-night-900/60' : 'text-white/50'}`}>
                              {new Date(message.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>

                          {isMine && (
                            <div className="w-7 h-7 rounded-full bg-white/25 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {senderInitial}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-white/60 bg-white/5 border border-white/10 rounded-xl px-3 py-3">
                      No messages yet. Start the conversation.
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-white/15 rounded-full px-3 py-1.5 border border-white/10">
                    <input
                      value={commentInput}
                      onChange={(e) => {
                        setCommentInput(e.target.value);
                        if (commentSaved) setCommentSaved(false);
                      }}
                      onKeyDown={handleCommentKeyDown}
                      placeholder={selectedUser ? `Aa (${selectedUser === 'jojo' ? 'JoJo' : 'DoDo'})` : 'Aa'}
                      className="w-full bg-transparent text-ink-100 placeholder:text-white/50 focus:outline-none text-sm"
                    />
                  </div>

                  <button
                    onClick={handleSaveComment}
                    disabled={!canSendComment}
                    className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                      canSendComment
                        ? 'bg-gradient-to-r from-popcorn to-pink-400 text-night-900 hover:shadow-lg hover:shadow-popcorn/40'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                    aria-label="Send message"
                  >
                    <SendHorizonal size={16} />
                  </button>
                </div>
              </div>
            </section>

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
                    const epRatings = episodeRatings[ep.number] || { jojo: 0, dodo: 0 };
                    const userRating = selectedUser ? epRatings[selectedUser] : 0;
                    const currentStatus = episodeStatuses[ep.number] || (isAbiSeries && ep.number <= 7 ? 'watched' : 'upcoming');
                    
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
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-base font-bold text-white group-hover:text-[#fbbf24] transition-colors">
                                {ep.title}
                              </h3>
                              {selectedEpisodeIndex === idx && (
                                <PlayCircle size={16} className="text-[#fbbf24] flex-shrink-0" fill="#fbbf24" />
                              )}
                              {/* Status Badge */}
                              {selectedUser && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newStatus = currentStatus === 'watched' ? 'upcoming' : 'watched';
                                    saveEpisodeStatus(entry.id, ep.number, selectedUser, newStatus);
                                    setEpisodeStatuses(prev => ({
                                      ...prev,
                                      [ep.number]: newStatus
                                    }));
                                  }}
                                  className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 ${
                                    currentStatus === 'watched'
                                      ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/40'
                                      : 'bg-ink-400/20 text-ink-300 ring-1 ring-ink-400/40'
                                  }`}
                                >
                                  {currentStatus === 'watched' ? '✓ Watched' : 'Upcoming'}
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-ink-300 line-clamp-2 leading-relaxed">
                              {ep.summary}
                            </p>
                          </div>
                        </div>
                        
                        {/* Episode Rating Section */}
                        {isWatched && (
                          <div className="px-4 pb-4 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between gap-4">
                              {/* JoJo Rating */}
                              <div className="flex items-center gap-2">
                                <span className="text-[#fbbf24] text-xs font-bold uppercase tracking-wider">JoJo:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={`jojo-${ep.number}-${star}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedUser === 'jojo') {
                                          handleEpisodeRating(ep.number, star);
                                        }
                                      }}
                                      disabled={selectedUser !== 'jojo'}
                                      className={`transition-all ${
                                        selectedUser === 'jojo' 
                                          ? 'hover:scale-110 cursor-pointer' 
                                          : 'opacity-60 cursor-not-allowed'
                                      }`}
                                    >
                                      <Star
                                        size={14}
                                        className={star <= epRatings.jojo ? "fill-[#fbbf24] text-[#fbbf24]" : "text-[#fbbf24]/30"}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* DoDo Rating */}
                              <div className="flex items-center gap-2">
                                <span className="text-[#c084fc] text-xs font-bold uppercase tracking-wider">DoDo:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={`dodo-${ep.number}-${star}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedUser === 'dodo') {
                                          handleEpisodeRating(ep.number, star);
                                        }
                                      }}
                                      disabled={selectedUser !== 'dodo'}
                                      className={`transition-all ${
                                        selectedUser === 'dodo' 
                                          ? 'hover:scale-110 cursor-pointer' 
                                          : 'opacity-60 cursor-not-allowed'
                                      }`}
                                    >
                                      <Star
                                        size={14}
                                        className={star <= epRatings.dodo ? "fill-[#c084fc] text-[#c084fc]" : "text-[#c084fc]/30"}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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