import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
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
const LoadingFallback = () => (
  <div className="min-h-screen bg-night-900 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block">
        <div className="animate-spin w-12 h-12 border-4 border-popcorn border-t-transparent rounded-full mb-4"></div>
      </div>
      <p className="text-ink-300 text-lg">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  const [entries, setEntries] = useState<MovieEntry[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEntriesAsync();
        setEntries(data);
        if (location.pathname !== '/') {
          setShowIntro(false);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [location.pathname]);

  const navigateTo = (view: 'home' | 'details', id?: string) => {
    navigate(view === 'details' && id ? `/movie/${id}` : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

const MovieDetails = ({ entries, onBack }: { entries: MovieEntry[]; onBack: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const entry = entries.find(e => e.id === id);
  
  if (!entry) {
    return (
      <div className="min-h-screen bg-night-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-ink-300 mb-4">Movie not found</p>
          <button onClick={onBack} className="px-4 py-2 bg-popcorn text-night-900 rounded-lg hover:bg-popcorn/90 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <Details entry={entry} onBack={onBack} />;
};

const App = () => (
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

export default App;