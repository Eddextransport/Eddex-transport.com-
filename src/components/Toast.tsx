import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

let toastFn: ((message: string, type?: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'success') {
  toastFn?.(message, type);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    toastFn = (message: string, type: ToastType = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { message, type, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
    };
    return () => { toastFn = null; };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 shadow-lg animate-slide-up pointer-events-auto"
        >
          {t.type === 'success' && <CheckCircle2 size={20} className="text-success-500 shrink-0" />}
          {t.type === 'error' && <XCircle size={20} className="text-error-500 shrink-0" />}
          {t.type === 'info' && <Info size={20} className="text-brand-500 shrink-0" />}
          <p className="text-sm text-white flex-1">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
