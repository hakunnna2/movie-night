import { useState, memo } from 'react';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'eager' | 'lazy';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = memo(({
  src,
  alt,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-night-700/50 via-night-600/50 to-night-700/50 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
});
