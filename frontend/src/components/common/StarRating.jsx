import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 5.0, count, showCount = true, size = 16 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <Star size={size} fill="#f59e0b" color="#f59e0b" />
      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
        {Number(rating).toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          ({count})
        </span>
      )}
    </div>
  );
}
