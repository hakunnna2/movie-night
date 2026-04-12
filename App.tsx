import { useState, useEffect, lazy, Suspense } from 'react';
import { Download } from 'lucide-react';
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
const SELECTED_USER_KEY = 'movie-night-selected-user';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

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

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    try {
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      setIsInstalled(standaloneQuery.matches);
    };

    if (standaloneQuery.matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    standaloneQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  if (!canInstall || isInstalled) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full border border-white/10 bg-night-900/90 px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-black/40 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-popcorn/60 hover:text-popcorn focus:outline-none focus:ring-2 focus:ring-popcorn"
      aria-label="Install this app"
    >
      <Download size={16} />
      Install app
    </button>
  );
};

const AppContent = () => {
  const [entries, setEntries] = useState<MovieEntry[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<'jojo' | 'dodo' | null>(() => {
    try {
      const storedUser = localStorage.getItem(SELECTED_USER_KEY);
      return storedUser === 'jojo' || storedUser === 'dodo' ? storedUser : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      if (selectedUser) {
        localStorage.setItem(SELECTED_USER_KEY, selectedUser);
      } else {
        localStorage.removeItem(SELECTED_USER_KEY);
      }
    } catch {
      // ignore localStorage failures
    }
  }, [selectedUser]);

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
  // Load data once on mount; location.pathname is read but should not re-trigger fetches
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadEntries = async () => {
    const data = await getEntriesAsync();
    setEntries(data);
  };

  const navigateTo = (view: 'home' | 'details', id?: string) => {
    navigate(view === 'details' && id ? `/movie/${id}` : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingFallback />;
  }

  // Router Logic
  return (
    <Suspense fallback={<LoadingFallback />}>
      {showIntro ? (
        <div className="animate-fade-in">
          <IntroPage 
            entries={entries}
            onContinue={() => setShowIntro(false)}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
        </div>
      ) : (
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="animate-fade-in">
                <Home entries={entries} onNavigate={navigateTo} selectedUser={selectedUser} />
              </div>
            } 
          />
          <Route 
            path="/movie/:id" 
            element={<MovieDetails entries={entries} onBack={() => navigateTo('home')} selectedUser={selectedUser} reloadEntries={reloadEntries} />} 
          />
          <Route 
            path="*" 
            element={
              <div className="animate-fade-in">
                <Home entries={entries} onNavigate={navigateTo} selectedUser={selectedUser} />
              </div>
            } 
          />
        </Routes>
      )}
    </Suspense>
  );
};

const MovieDetails = ({ entries, onBack, selectedUser, reloadEntries }: { entries: MovieEntry[]; onBack: () => void; selectedUser?: 'jojo' | 'dodo' | null; reloadEntries: () => Promise<void> }) => {
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

  return <Details entry={entry} onBack={onBack} selectedUser={selectedUser} onRatingUpdate={reloadEntries} />;
};

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <AppContextProvider>
        <div className="min-h-screen bg-night-900 text-ink-100 font-sans selection:bg-popcorn selection:text-night-900">
          <AppContent />
          <ScrollToTopButton />
          <InstallAppButton />
        </div>
      </AppContextProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;