import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100% - 32px)',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              pointerEvents: 'auto',
              background: '#ffffff',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: toast.type === 'success' ? '4px solid #10b981' :
                          toast.type === 'error' ? '4px solid #ef4444' : '4px solid #3b82f6'
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />}
            {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
            {toast.type === 'info' && <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />}

            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#1e293b',
              fontWeight: 500,
              flex: 1
            }}>
              {toast.message}
            </p>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return context;
}
