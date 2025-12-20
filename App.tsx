import React, { useState, useEffect } from 'react';
import { getEntries } from './services/storage';
import { MovieEntry, ViewState } from './types';
import { Home } from './views/Home';
import { Details } from './views/Details';
import { Lock, Ticket } from 'lucide-react';

const PasswordGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // The secret ticket code to enter the site
  const SECRET_PASSWORD = '02JOJO22';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      onUnlock();
    } else {
      setError(true);
      setPassword('');
      // Visual feedback for error
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-night-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-night-800 rounded-3xl border border-white/5 shadow-2xl p-10 text-center space-y-8 fade-in">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-popcorn/10 flex items-center justify-center text-popcorn border border-popcorn/20">
            <Ticket size={40} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Private Screening</h1>
          <p className="text-ink-300 font-hand text-xl italic">JoJo, please your ticket code to enter.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`relative transition-all duration-200 ${error ? 'translate-x-1' : ''}`}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter ticket code..."
              className={`w-full bg-night-900 border ${error ? 'border-red-500 animate-pulse' : 'border-white/10'} rounded-xl py-4 px-12 text-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-popcorn/50 transition-all`}
              autoFocus
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" size={18} />
          </div>
          
          <button
            type="submit"
            className="w-full bg-popcorn hover:bg-popcorn-glow text-night-900 font-black py-4 rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-popcorn/20"
          >
            Enter Theater
          </button>
        </form>

        <p className="text-[10px] text-ink-300 uppercase tracking-widest opacity-30">
          Two Seats, One Screen &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [entries, setEntries] = useState<MovieEntry[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ current: 'home' });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user already unlocked in this session
    return sessionStorage.getItem('unlocked') === 'true';
  });

  // Load static data on mount
  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const handleUnlock = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('unlocked', 'true');
  };

  // Navigation handlers
  const navigateTo = (view: ViewState['current'], id?: string) => {
    setViewState({ current: view, selectedId: id });
    window.scrollTo(0, 0);
  };

  if (!isAuthenticated) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  // Router Logic
  let content;
  if (viewState.current === 'home') {
    content = (
      <Home 
        entries={entries} 
        onNavigate={navigateTo} 
      />
    );
  } else if (viewState.current === 'details' && viewState.selectedId) {
    const entry = entries.find(e => e.id === viewState.selectedId);
    if (entry) {
      content = (
        <Details 
          entry={entry} 
          onBack={() => navigateTo('home')}
        />
      );
    } else {
      navigateTo('home');
    }
  } else {
      navigateTo('home');
  }

  return (
    <div className="min-h-screen bg-night-900 text-ink-100 font-sans selection:bg-popcorn selection:text-night-900">
      {content}
    </div>
  );
};

export default App;