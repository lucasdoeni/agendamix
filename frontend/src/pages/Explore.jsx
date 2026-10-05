import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Scissors, Sparkles, Hand, Heart, Eye } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { storageService } from '../services/storageService';
import ProfessionalCard from '../components/pro/ProfessionalCard';
import BookingModal from '../components/booking/BookingModal';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria') || '';
  const initialSearch = searchParams.get('busca') || '';

  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'reviews'
  const [bookingModalPro, setBookingModalPro] = useState(null);

  const allPros = storageService.getProfessionals();

  const filteredPros = useMemo(() => {
    return allPros.filter(pro => {
      const proCategories = pro.categories && pro.categories.length > 0
        ? pro.categories
        : (pro.category ? pro.category.split(',').map(c => c.trim()) : []);

      const matchesCategory = !category || proCategories.includes(category) || (pro.category && pro.category.includes(category));
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = !cleanQuery || 
        pro.name.toLowerCase().includes(cleanQuery) ||
        pro.commercialName.toLowerCase().includes(cleanQuery) ||
        (pro.city && pro.city.toLowerCase().includes(cleanQuery)) ||
        (pro.address && pro.address.toLowerCase().includes(cleanQuery)) ||
        (pro.neighborhood && pro.neighborhood.toLowerCase().includes(cleanQuery)) ||
        proCategories.some(c => c.toLowerCase().includes(cleanQuery)) ||
        pro.services.some(s => s.name.toLowerCase().includes(cleanQuery));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return 0;
    });
  }, [allPros, category, searchQuery, sortBy]);

  const handleCategoryClick = (catId) => {
    const next = category === catId ? '' : catId;
    setCategory(next);
    if (next) searchParams.set('categoria', next);
    else searchParams.delete('categoria');
    setSearchParams(searchParams);
  };

  return (
    <div style={{ padding: '36px 0 64px', backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '8px' }}>
            Explorar Profissionais & Salões
          </h1>
          <p style={{ color: '#64748b' }}>
            Encontre o especialista ideal para o seu estilo e reserve online com garantia de horário.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #e2e8f0',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '8px 14px',
            flex: 1,
            minWidth: '260px'
          }}>
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar por nome, especialidade ou serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                width: '100%',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="rating">Melhor Avaliação</option>
              <option value="reviews">Mais Populares</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => handleCategoryClick('')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: !category ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
              backgroundColor: !category ? '#eff6ff' : '#ffffff',
              color: !category ? '#2563eb' : '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Todos ({allPros.length})
          </button>
          {CATEGORIES.map(cat => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#2563eb' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Mostrando <strong>{filteredPros.length}</strong> profissionais disponíveis
          </p>
        </div>

        {/* Pros Grid */}
        {filteredPros.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>
              Nenhum profissional encontrado
            </h3>
            <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 20px' }}>
              Tente buscar com outros termos ou selecione uma categoria diferente.
            </p>
            <button
              onClick={() => {
                setCategory('');
                setSearchQuery('');
              }}
              style={{
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {filteredPros.map(pro => (
              <ProfessionalCard
                key={pro.id}
                professional={pro}
                onBookNow={(p) => setBookingModalPro(p)}
              />
            ))}
          </div>
        )}
      </div>

      {bookingModalPro && (
        <BookingModal
          isOpen={!!bookingModalPro}
          onClose={() => setBookingModalPro(null)}
          professional={bookingModalPro}
        />
      )}
    </div>
  );
}
