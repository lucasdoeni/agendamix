import React from 'react';
import { Clock, Calendar, Check } from 'lucide-react';
import Button from '../common/Button';

export default function ServiceItemCard({ service, onSelect, isSelected = false, showBookButton = true }) {
  const { id, name, price, duration, description } = service;

  return (
    <div
      style={{
        padding: '1.25rem',
        borderRadius: '14px',
        backgroundColor: '#ffffff',
        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
        boxShadow: isSelected ? '0 8px 20px rgba(37, 99, 235, 0.12)' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            {name}
          </h4>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#1d4ed8',
            whiteSpace: 'nowrap'
          }}>
            R$ {Number(price).toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          borderRadius: '6px',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginTop: '6px',
          marginBottom: '8px'
        }}>
          <Clock size={13} />
          <span>{duration} minutos</span>
        </div>

        {description && (
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {description}
          </p>
        )}
      </div>

      {showBookButton && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #f8fafc' }}>
          <Button
            size="sm"
            variant={isSelected ? 'secondary' : 'primary'}
            icon={isSelected ? Check : Calendar}
            onClick={() => onSelect && onSelect(service)}
          >
            {isSelected ? 'Selecionado' : 'Escolher este'}
          </Button>
        </div>
      )}
    </div>
  );
}
