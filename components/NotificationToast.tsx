import React, { useEffect } from 'react';
import { X, AlertCircle, Plus, MessageSquare, Film, CheckCircle } from 'lucide-react';

export type NotificationType = 'entry-added' | 'episode-added' | 'comment-added' | 'movie-added';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Auto-dismiss duration in ms, 0 for no auto-dismiss
}

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'entry-added':
        return <Plus size={20} />;
      case 'movie-added':
        return <Film size={20} />;
      case 'episode-added':
        return <CheckCircle size={20} />;
      case 'comment-added':
        return <MessageSquare size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'movie-added':
        return 'from-[#fbbf24]/20 to-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]';
      case 'episode-added':
        return 'from-[#22c55e]/20 to-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]';
      case 'comment-added':
        return 'from-[#c084fc]/20 to-[#c084fc]/10 border-[#c084fc]/30 text-[#c084fc]';
      case 'entry-added':
        return 'from-[#06b6d4]/20 to-[#06b6d4]/10 border-[#06b6d4]/30 text-[#06b6d4]';
      default:
        return 'from-white/20 to-white/10 border-white/30 text-white';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getColor()} border rounded-lg p-4 flex items-start gap-3 shadow-lg backdrop-blur-sm animate-slide-in`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm mb-1">{notification.title}</h3>
        <p className="text-xs opacity-90">{notification.message}</p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 text-ink-400 hover:text-ink-200 transition-colors p-1"
      >
        <X size={16} />
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}} />
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 max-w-sm z-40 pointer-events-auto">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default NotificationToast;
