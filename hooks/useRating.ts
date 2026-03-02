import { useCallback } from 'react';
import { saveRating } from '../services/storage';

export const useRating = () => {
  const updateRating = useCallback((entryId: string, person: 'jojo' | 'dodo', rating: number) => {
    saveRating(entryId, person, rating);
  }, []);

  return { updateRating };
};
