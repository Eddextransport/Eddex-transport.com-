import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-ink-800 rounded-t-3xl sm:rounded-3xl border border-ink-700 animate-slide-up max-h-[92vh] overflow-y-auto`}>
        {title && (
          <div className="sticky top-0 bg-ink-800/95 backdrop-blur px-5 py-4 border-b border-ink-700 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-ink-300 hover:text-white transition-colors">
              <X size={22} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
