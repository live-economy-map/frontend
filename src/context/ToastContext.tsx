import React, { createContext, useContext, useState, useCallback } from 'react';

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  details?: string[];
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, options?: { title?: string; details?: string[] }) => string;
    error: (message: string, options?: { title?: string; details?: string[] }) => string;
    warning: (message: string, options?: { title?: string; details?: string[] }) => string;
    info: (message: string, options?: { title?: string; details?: string[] }) => string;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, details, duration = 5000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, details, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: useCallback(
      (message: string, options?: { title?: string; details?: string[] }) =>
        addToast({ type: 'success', message, ...options }),
      [addToast]
    ),
    error: useCallback(
      (message: string, options?: { title?: string; details?: string[] }) =>
        addToast({ type: 'error', message, ...options, duration: 6500 }),
      [addToast]
    ),
    warning: useCallback(
      (message: string, options?: { title?: string; details?: string[] }) =>
        addToast({ type: 'warning', message, ...options }),
      [addToast]
    ),
    info: useCallback(
      (message: string, options?: { title?: string; details?: string[] }) =>
        addToast({ type: 'info', message, ...options }),
      [addToast]
    ),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onRemove={() => onRemove(item.id)} />
      ))}
    </div>
  );
}

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const isError = item.type === 'error';
  const isSuccess = item.type === 'success';
  const isWarning = item.type === 'warning';

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2',
        isError &&
          'bg-white/95 border-red-200 text-gray-900 dark:bg-gray-900/95 dark:border-red-900/50',
        isSuccess &&
          'bg-white/95 border-emerald-200 text-gray-900 dark:bg-gray-900/95 dark:border-emerald-900/50',
        isWarning &&
          'bg-white/95 border-amber-200 text-gray-900 dark:bg-gray-900/95 dark:border-amber-900/50',
        item.type === 'info' &&
          'bg-white/95 border-blue-200 text-gray-900 dark:bg-gray-900/95 dark:border-blue-900/50'
      )}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
        {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
        {item.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {item.title && <h4 className="text-xs font-bold leading-tight mb-0.5">{item.title}</h4>}
        <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
          {item.message}
        </p>
        {item.details && item.details.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400 list-disc list-inside">
            {item.details.map((detail, idx) => (
              <li key={idx} className="truncate">
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={onRemove}
        aria-label="Close notification"
        className="shrink-0 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
