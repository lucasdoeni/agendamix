import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  className = '',
  style = {}
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '10px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    border: '1px solid transparent',
    ...style
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.85rem' },
    md: { padding: '10px 18px', fontSize: '0.95rem' },
    lg: { padding: '14px 24px', fontSize: '1.05rem', borderRadius: '12px' }
  };

  const variantStyles = {
    primary: {
      background: 'var(--grad-primary)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
    },
    secondary: {
      background: '#eff6ff',
      color: '#2563eb',
      border: '1px solid #bfdbfe'
    },
    outline: {
      background: 'transparent',
      color: '#334155',
      border: '1.5px solid #cbd5e1'
    },
    ghost: {
      background: 'transparent',
      color: '#475569'
    },
    danger: {
      background: '#ef4444',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
    },
    violet: {
      background: '#7c3aed',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
    }
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={combinedStyles}
      className={`btn-custom ${className}`}
    >
      {loading ? (
        <span style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderRightColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      ) : null}
      {children}
    </button>
  );
}
