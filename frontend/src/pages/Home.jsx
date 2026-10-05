import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Scissors, 
  Hand, 
  Heart, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Calendar, 
  Clock, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { storageService } from '../services/storageService';
import ProfessionalCard from '../components/pro/ProfessionalCard';
import BookingModal from '../components/booking/BookingModal';
import Button from '../components/common/Button';

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bookingModalPro, setBookingModalPro] = useState(null);

  const professionals = storageService.getProfessionals();
  const featuredPros = professionals.filter(p => p.featured || p.rating >= 4.9).slice(0, 4);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('busca', searchTerm);
    if (selectedCategory) params.set('categoria', selectedCategory);
    navigate(`/profissionais?${params.toString()}`);
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Scissors': return Scissors;
      case 'Sparkles': return Sparkles;
      case 'Hand': return Hand;
      case 'Heart': return Heart;
      case 'Eye': return Eye;
      default: return Sparkles;
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
        padding: '64px 0 48px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          {/* Eyebrow badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px' }}>
            <Sparkles size={16} />
            <span>A melhor experiência em agendamento de beleza</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            lineHeight: 1.15,
            marginBottom: '20px'
          }}>
            Agende serviços de beleza com os{' '}
            <span style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              melhores profissionais
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 36px'
          }}>
            Encontre barbeiros, cabeleireiros, manicures, esteticistas e designers de sobrancelhas. Escolha seu horário e confirme em segundos.
          </p>

          {/* SEARCH BAR WIDGET */}
          <form
            onSubmit={handleSearchSubmit}
            className="home-search-form"
            style={{
              backgroundColor: '#ffffff',
              padding: '10px 14px',
              borderRadius: '18px',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
              maxWidth: '720px',
              margin: '0 auto 32px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px', padding: '0 8px' }}>
              <Search size={20} color="#94a3b8" />
              <input
                type="text"
                placeholder="Busque por profissional, serviço ou salão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  background: 'transparent'
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                border: 'none',
                borderLeft: '1px solid #e2e8f0',
                padding: '8px 14px',
                outline: 'none',
                fontSize: '0.9rem',
                color: '#475569',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <option value="">Todas as Categorias</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>

            <Button type="submit" variant="primary" size="md">
              Buscar Horários
            </Button>
          </form>

          {/* Quick CTA Links */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/cadastro-profissional">
              <Button variant="outline" size="sm" icon={TrendingUp}>
                Você é profissional? Comece a receber agendamentos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section style={{ padding: '48px 0', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '8px' }}>
              Navegue por Especialidades
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Selecione uma categoria para descobrir profissionais perto de você
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {CATEGORIES.map(cat => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={`/profissionais?categoria=${cat.id}`}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    padding: '24px 16px',
                    border: '1.5px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '12px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(37, 99, 235, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {cat.label}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cat.count} disponíveis
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PROFESSIONALS */}
      <section style={{ padding: '64px 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                <Star size={16} fill="#2563eb" />
                <span>Alta Avaliação</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', color: '#0f172a' }}>
                Profissionais em Destaque
              </h2>
            </div>
            <Link to="/profissionais" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.95rem', color: '#2563eb' }}>
              <span>Ver todos os profissionais</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid-cards">
            {featuredPros.map(pro => (
              <ProfessionalCard
                key={pro.id}
                professional={pro}
                onBookNow={(p) => setBookingModalPro(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '72px 0', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '12px' }}>
            Como Funciona o AgendaMix
          </h2>
          <p style={{ color: '#64748b', maxWidth: '580px', margin: '0 auto 48px' }}>
            Simplicidade absoluta para você encontrar o melhor atendimento sem precisar trocar mensagens infinitas.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '32px'
          }}>
            <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontWeight: 800, fontSize: '1.2rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Escolha o Profissional</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                Explore avaliações, portfólio, lista de serviços com preços e localização exata do espaço.
              </p>
            </div>

            <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontWeight: 800, fontSize: '1.2rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Selecione Dia e Horário</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                A grade exibe em tempo real apenas os horários livres. O sistema bloqueia duplicidades instantaneamente.
              </p>
            </div>

            <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontWeight: 800, fontSize: '1.2rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Receba a Confirmação</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                Seu voucher é gerado na hora e você pode consultar ou cancelar seu agendamento a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAAS BANNER FOR PROFESSIONALS */}
      <section style={{
        padding: '64px 0',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: '#ffffff'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Plataforma Completa para Autônomos e Salões
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: '#ffffff', marginTop: '8px', marginBottom: '16px' }}>
              Elimine faltas e organize sua agenda sem estresse
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Tenha seu próprio link profissional para divulgar no Instagram e WhatsApp. Gerencie serviços, preços, bloqueios e clientes em um dashboard exclusivo.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/cadastro-profissional">
                <Button variant="primary" size="lg" icon={Sparkles}>
                  Criar Meu Perfil Grátis
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Já tenho conta (Entrar)
                </Button>
              </Link>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '360px',
            backdropFilter: 'blur(10px)'
          }}>
            <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '1.05rem' }}>Recursos Inclusos:</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#34d399" /> Página pública exclusiva
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#34d399" /> Catálogo com fotos e duração
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#34d399" /> Controle de horários e folgas
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                <CheckCircle2 size={18} color="#34d399" /> Zero comissão sobre os serviços
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Booking Modal Instance */}
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
