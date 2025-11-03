// src/contexts/ToastContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useRef, useEffect } from 'react';
import { ToastMessage, ToastContextType } from '../types';
import Toast from '../components/Toast';

const ToastContext = createContext<ToastContextType | undefined>(undefined);


function createIdFactory() {
  let counter = 0;
  return () => {
    counter = (counter + 1) % 1_000_000_000;
    return Date.now() * 1000 + counter;
  };
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const makeId = useMemo(() => createIdFactory(), []);
  const timersRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const handle = timersRef.current.get(id);
    if (handle) {
      window.clearTimeout(handle);
      timersRef.current.delete(id);
    }
  }, []);


  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 5000) => {
      const id = makeId();
      setToasts(prev => [...prev, { id, message, type } as ToastMessage]);

      const handle = window.setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, handle);

      return id; 
    },
    [makeId, removeToast]
  );

  // Clear all timers on unmount (safety)
  useEffect(() => {
    return () => {
      timersRef.current.forEach(h => window.clearTimeout(h));
      timersRef.current.clear();
    };
  }, []);

  const ctxValue = useMemo<ToastContextType>(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}

      {/* Toast container */}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}                      
            message={toast.message}
            type={toast.type as any}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
