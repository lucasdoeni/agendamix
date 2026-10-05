import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import StarRating from '../common/StarRating';
import Badge from '../common/Badge';

export default function ProfessionalCard({ professional, onBookNow }) {
  const {
    id,
    name,
    commercialName,
    category,
    avatar,
    address,
    city,
    rating,
    reviewCount,
    services = []
  } = professional;

  const minPrice = services.length > 0 
    ? Math.min(...services.map(s => s.price))
    : 0;

  const categoryNames = {
    barbearia: 'Barbearia',
    cabeleireiro: 'Cabeleireiro',
    manicure: 'Manicure & Pedicure',
    estetica: 'Estética',
    sobrancelhas: 'Sobrancelhas'
  };

  const proCategories = professional.categories && professional.categories.length > 0
    ? professional.categories
    : (category ? category.split(',').map(c => c.trim()) : ['barbearia']);

  return (
    <div
      className="card card-hoverable"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Top Banner / Avatar Area */}
      <div style={{
        position: 'relative',
        height: '110px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)'
      }}>
        {/* Category Badges */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '75%' }}>
          {proCategories.slice(0, 2).map((cat, idx) => (
            <Badge key={idx} variant="violet" style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#6d28d9', fontSize: '0.72rem', padding: '3px 8px' }}>
              {categoryNames[cat] || cat}
            </Badge>
          ))}
          {proCategories.length > 2 && (
            <Badge variant="violet" style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#6d28d9', fontSize: '0.72rem', padding: '3px 6px' }}>
              +{proCategories.length - 2}
            </Badge>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          position: 'absolute',
          bottom: '-32px',
          left: '20px',
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          border: '4px solid #ffffff',
          overflow: 'hidden',
          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
          backgroundColor: '#ffffff'
        }}>
          <img
            src={avatar}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '42px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {commercialName}
          </h3>
          <StarRating rating={rating} count={reviewCount} showCount={false} />
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
          Por <strong style={{ color: '#334155' }}>{name}</strong>
        </p>

        {/* Address */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          color: '#64748b',
          marginBottom: '16px'
        }}>
          <MapPin size={15} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address || city}
          </span>
        </div>

        {/* Highlights / Services snippet */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '12px',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>A partir de</span>
            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>
              R$ {minPrice.toFixed(2).replace('.', ',')}
            </strong>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' }}>
            {services.length} serviços
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Link
            to={`/p/${id}`}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Ver Perfil
          </Link>

          <button
            onClick={() => onBookNow ? onBookNow(professional) : null}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'var(--grad-primary)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Calendar size={15} />
            <span>Agendar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
