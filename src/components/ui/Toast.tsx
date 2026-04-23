'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const COLORS = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-maroon-600 text-white',
  warning: 'bg-gold-500 text-maroon-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-[460px] space-y-2 px-4 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div key={toast.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-slide-down pointer-events-auto ${COLORS[toast.type]}`}>
              <Icon size={18} className="flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => remove(toast.id)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
