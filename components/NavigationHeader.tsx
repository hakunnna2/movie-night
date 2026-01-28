import { Eye, Calendar } from 'lucide-react';

interface NavigationHeaderProps {
  activeTab: 'watched' | 'upcoming';
  onTabChange: (tab: 'watched' | 'upcoming') => void;
  watchedCount: number;
  upcomingCount: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  onTabChange,
  watchedCount,
  upcomingCount,
}) => {
  return (
    <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          <button
            onClick={() => onTabChange('watched')}
            className={`pb-4 px-2 border-b-2 transition-all flex items-center gap-3 font-bold uppercase tracking-wider text-sm ${
              activeTab === 'watched'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye size={18} />
            <span>Watched</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-black ${
              activeTab === 'watched'
                ? 'bg-amber-400/20'
                : 'bg-white/5'
            }`}>
              {watchedCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('upcoming')}
            className={`pb-4 px-2 border-b-2 transition-all flex items-center gap-3 font-bold uppercase tracking-wider text-sm ${
              activeTab === 'upcoming'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar size={18} />
            <span>Upcoming</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-black ${
              activeTab === 'upcoming'
                ? 'bg-purple-400/20'
                : 'bg-white/5'
            }`}>
              {upcomingCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
