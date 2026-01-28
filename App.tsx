import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { getEntriesAsync } from './services/storage';
import { MovieEntry } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { AppContextProvider } from './context/AppContext';

// Lazy load views for code splitting
const Home = lazy(() => import('./views/Home').then(m => ({ default: m.Home })));
const Details = lazy(() => import('./views/Details').then(m => ({ default: m.Details })));
const IntroPage = lazy(() => import('./views/IntroPage').then(m => ({ default: m.IntroPage })));

// Loading fallback component for Suspense boundaries
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-night-900 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block">
        <div className="animate-spin w-12 h-12 border-4 border-popcorn border-t-transparent rounded-full mb-4"></div>
      </div>
      <p className="text-ink-300 text-lg">Loading...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [entries, setEntries] = useState<MovieEntry[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load data from JSON on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEntriesAsync();
        setEntries(data);
      } catch (error) {
        console.error('Failed to load entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Navigation handlers
  const navigateTo = (view: 'home' | 'details', id?: string) => {
    if (view === 'details' && id) {
      navigate(`/movie/${id}`);
    } else {
      navigate('/');
    }
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-900 flex items-center justify-center">
        <div className="text-popcorn text-xl">Loading...</div>
      </div>
    );
  }

  // Router Logic
  return (
    <Suspense fallback={<LoadingFallback />}>
      {showIntro ? (
        <div className="animate-fade-in">
          <IntroPage 
            entries={entries}
            onContinue={() => setShowIntro(false)}
          />
        </div>
      ) : (
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="animate-fade-in">
                <Home entries={entries} onNavigate={navigateTo} />
              </div>
            } 
          />
          <Route 
            path="/movie/:id" 
            element={<MovieDetails entries={entries} onBack={() => navigateTo('home')} />} 
          />
          <Route 
            path="*" 
            element={
              <div className="animate-fade-in">
                <Home entries={entries} onNavigate={navigateTo} />
              </div>
            } 
          />
        </Routes>
      )}
    </Suspense>
  );
};

// Wrapper component to handle route params
const MovieDetails: React.FC<{ entries: MovieEntry[]; onBack: () => void }> = ({ entries, onBack }) => {
  const { id } = useParams<{ id: string }>();
  const entry = entries.find(e => e.id === id);
  
  if (!entry) {
    return (
      <div className="min-h-screen bg-night-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-ink-300 mb-4">Movie not found</p>
          <button onClick={onBack} className="px-4 py-2 bg-popcorn text-night-900 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Details entry={entry} onBack={onBack} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContextProvider>
          <div className="min-h-screen bg-night-900 text-ink-100 font-sans selection:bg-popcorn selection:text-night-900">
            <AppContent />
            <ScrollToTopButton />
          </div>
        </AppContextProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;