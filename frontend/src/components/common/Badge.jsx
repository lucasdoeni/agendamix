import React from 'react';

export default function Badge({ children, variant = 'primary', icon: Icon, className = '', style = {} }) {
  const variantStyles = {
    primary: {
      background: '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #bfdbfe'
    },
    violet: {
      background: '#f5f3ff',
      color: '#6d28d9',
      border: '1px solid #ddd6fe'
    },
    success: {
      background: '#ecfdf5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    warning: {
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a'
    },
    danger: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    neutral: {
      background: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0'
    }
  };

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        ...variantStyles[variant],
        ...style
      }}
    >
      {Icon && <Icon size={13} />}
      {children}
    </span>
  );
}
