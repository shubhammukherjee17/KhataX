'use client';

import { useNotificationStore } from '@/store/useNotificationStore';
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef } from 'react';

export function NotificationTray({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotificationStore();
  const trayRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#00ea77]" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div 
      ref={trayRef}
      className="absolute top-16 right-4 sm:right-8 w-80 sm:w-96 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-[#00ea77]/20 text-[#00ea77] px-2 py-0.5 rounded text-[10px] font-bold tracking-widest">{unreadCount} NEW</span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-slate-500 hover:text-white transition-colors p-1"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 max-h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center text-slate-500">
            <Bell className="w-12 h-12 mb-3 text-slate-600 opacity-50" />
            <p className="text-sm font-medium">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 flex gap-3 hover:bg-white/5 transition-colors group ${!notif.isRead ? 'bg-white/[0.02]' : ''}`}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
              >
                <div className="shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 pr-2">
                  <p className={`text-sm ${!notif.isRead ? 'text-white font-bold' : 'text-slate-300 font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                    {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                    className="text-slate-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {unreadCount > 0 && (
        <div className="p-3 border-t border-white/5 bg-[#0a0a0a]">
          <button 
            onClick={markAllAsRead}
            className="w-full text-center text-xs font-bold text-[#00ea77] hover:text-[#00c563] transition-colors py-1"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
