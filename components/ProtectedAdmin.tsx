import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface ProtectedAdminProps {
  children: React.ReactNode;
}

// User credentials
const ADMIN_USERS = {
  jojo: '2004',
  dodo: 'LUPIN'
};

const AUTH_KEY = 'admin-authenticated';
const AUTH_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const ProtectedAdmin: React.FC<ProtectedAdminProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<'jojo' | 'dodo' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem(AUTH_KEY);
        if (authData) {
          const { timestamp, user } = JSON.parse(authData);
          const now = Date.now();
          
          // Check if authentication is still valid (within 24 hours)
          if (now - timestamp < AUTH_EXPIRY) {
            setIsAuthenticated(true);
            setAuthenticatedUser(user);
          } else {
            // Clear expired authentication
            localStorage.removeItem(AUTH_KEY);
          }
        }
      } catch (error) {
        localStorage.removeItem(AUTH_KEY);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = username.toLowerCase().trim() as 'jojo' | 'dodo';
    
    // Check if username exists and password matches
    if (ADMIN_USERS[user] && password === ADMIN_USERS[user]) {
      // Save authentication state
      const authData = {
        timestamp: Date.now(),
        user: user
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      setAuthenticatedUser(user);
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Incorrect username or password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-900 flex items-center justify-center">
        <div className="text-popcorn text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-night-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-night-800 rounded-2xl p-8 shadow-2xl border border-night-700">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-popcorn/10 rounded-full flex items-center justify-center mb-4 border-2 border-popcorn/20">
                <Lock size={32} className="text-popcorn" />
              </div>
              <h2 className="text-2xl font-bold text-ink-100 text-center">Admin Access</h2>
              <p className="text-ink-400 text-sm mt-2 text-center">
                Sign in to access the admin panel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (jojo or dodo)"
                  className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl px-5 py-4 text-ink-100 placeholder-night-600 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ink-300 uppercase mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-night-900 border border-night-700 focus:border-popcorn rounded-xl px-5 py-4 pr-12 text-ink-100 placeholder-night-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-popcorn hover:bg-popcorn-glow text-night-900 font-bold text-lg py-4 rounded-xl transition-all hover:shadow-glow uppercase tracking-wide"
              >
                Unlock Admin Panel
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-night-700">
              <p className="text-ink-500 text-xs text-center">
                Authentication expires after 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add logout functionality to the admin panel
  return (
    <>
      {React.cloneElement(children as React.ReactElement, { 
        onLogout: handleLogout,
        authenticatedUser: authenticatedUser 
      })}
    </>
  );
};
