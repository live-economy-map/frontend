// src/components/notifications/NotificationBell.tsx
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/api/alerts.api';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, CheckCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => alertsApi.getMyNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30s
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => alertsApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => alertsApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/40">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Spatial Alerts</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2 text-gray-400">
                <Bell className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs">No notifications yet.</p>
                <p className="text-[11px] text-gray-400">
                  Spatial activity alerts for bookmarked cells will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 transition-colors flex items-start gap-3',
                    notification.isRead
                      ? 'bg-white dark:bg-gray-900 opacity-80'
                      : 'bg-blue-50/30 dark:bg-blue-950/20'
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs',
                        notification.type === 'ALERT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {notification.linkUrl && (
                        <Link
                          to={notification.linkUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <span>Inspect on Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {!notification.isRead && (
                        <button
                          onClick={() => markReadMutation.mutate(notification.id)}
                          className="text-[11px] text-gray-400 hover:text-blue-600 ml-auto cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Dismiss</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
