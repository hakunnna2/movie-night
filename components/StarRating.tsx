import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
}

export const StarRating = ({ 
  rating, 
  max = 5, 
  interactive = false, 
  onRate,
  size = 18
}: StarRatingProps) => {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star 
              size={size} 
              className={`${isFilled ? 'fill-popcorn text-popcorn drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-night-700'}`} 
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        );
      })}
    </div>
  );
};