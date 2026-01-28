import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FilterType, SortOption } from '../types';

interface AppContextType {
  // Search & Filter state
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  sort: SortOption;
  setSort: (sort: SortOption) => void;
  search: string;
  setSearch: (search: string) => void;
  
  // Navigation state
  currentMovieId?: string;
  setCurrentMovieId: (id?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [search, setSearch] = useState<string>('');
  const [currentMovieId, setCurrentMovieId] = useState<string | undefined>();

  return (
    <AppContext.Provider value={{
      filter,
      setFilter,
      sort,
      setSort,
      search,
      setSearch,
      currentMovieId,
      setCurrentMovieId,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};
