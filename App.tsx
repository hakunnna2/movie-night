import React, { useState, useEffect } from 'react';
import { getEntries } from './services/storage';
import { MovieEntry, ViewState } from './types';
import { Home } from './views/Home';
import { Details } from './views/Details';

const App: React.FC = () => {
  const [entries, setEntries] = useState<MovieEntry[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ current: 'home' });

  // Load static data on mount
  useEffect(() => {
    setEntries(getEntries());
  }, []);

  // Navigation handlers
  const navigateTo = (view: ViewState['current'], id?: string) => {
    // Only allow navigation to supported static views
    if (view === 'add') return; 
    setViewState({ current: view, selectedId: id });
    window.scrollTo(0, 0);
  };

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
      // Fallback if id not found
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