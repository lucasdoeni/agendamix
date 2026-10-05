import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Star, 
  CheckCircle2, 
  ArrowLeft, 
  Share2,
  Sparkles,
  Scissors,
  CreditCard
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { API_URL } from '../services/apiConfig';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ServiceItemCard from '../components/pro/ServiceItemCard';
import BookingModal from '../components/booking/BookingModal';
import { useToast } from '../context/ToastContext';

export default function ProProfile() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [professional, setProfessional] = useState(() => storageService.getProfessionalById(id));
  const [loading, setLoading] = useState(!professional);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetchPro() {
      if (API_URL) {
        try {
          const res = await fetch(`${API_URL}/professionals/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (active) setProfessional(data);
          }
        } catch (err) {
        } finally {
          if (active) setLoading(false);
        }
      } else {
        const localPro = storageService.getProfessionalById(id);
        if (active) {
          if (localPro) setProfessional(localPro);
          setLoading(false);
        }
      }
    }
    fetchPro();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 1rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Carregando dados do profissional...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="container" style={{ padding: '80px 1rem', textAlign: 'center' }}>
        <h2>Profissional não encontrado</h2>
        <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>
          O link acessado pode estar incorreto ou o profissional não está mais disponível.
        </p>
        <Link to="/profissionais">
          <Button variant="primary" icon={ArrowLeft}>Explorar outros profissionais</Button>
        </Link>
      </div>
    );
  }

  const {
    name,
    commercialName,
    category,
    avatar,
    coverImage,
    bio,
    address,
    city,
    phone,
    email,
    rating,
    reviewCount,
    services = [],
    schedule
  } = professional;

  const proCategories = professional.categories && professional.categories.length > 0
    ? professional.categories
    : (category ? category.split(',').map(c => c.trim()) : ['Serviços']);

  const handleBookService = (service) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${commercialName} — AgendaMix`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copiado para a área de transferência!', 'success');
    }
  };

  const weekdaysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const rawDays = schedule?.daysOfWeek;
  const daysArray = Array.isArray(rawDays) 
    ? rawDays 
    : (typeof rawDays === 'string' ? rawDays.split(',').map(Number) : [1, 2, 3, 4, 5, 6]);

  const workingDays = daysArray
    .map(d => weekdaysMap[d])
    .filter(Boolean)
    .join(', ') || 'Segunda a Sábado';

  return (
    <div style={{ backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
      {/* Cover Image */}
      <div style={{
        height: '240px',
        width: '100%',
        backgroundColor: '#1e3a8a',
        backgroundImage: coverImage ? `url(${coverImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.7) 100%)'
        }} />

        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: '20px' }}>
          <Link
            to="/profissionais"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>

          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Share2 size={16} />
            <span>Compartilhar Perfil</span>
          </button>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <div className="container" style={{ marginTop: '-70px', position: 'relative', zIndex: 10 }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Avatar and Titles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: '4px solid #ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              flexShrink: 0
            }}>
              <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
                  {commercialName}
                </h1>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {proCategories.map((cat, idx) => (
                    <Badge key={idx} variant="violet">{cat.toUpperCase()}</Badge>
                  ))}
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '8px' }}>
                Profissional responsável: <strong style={{ color: '#1e293b' }}>{name}</strong>
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <StarRating rating={rating} count={reviewCount} size={18} />
                <span style={{ color: '#cbd5e1' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b' }}>
                  <MapPin size={15} color="#2563eb" />
                  <span>{address || city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Book Now Button */}
          <Button
            variant="primary"
            size="lg"
            icon={Calendar}
            onClick={() => {
              setSelectedService(null);
              setBookingModalOpen(true);
            }}
          >
            Agendar Atendimento Online
          </Button>
        </div>

        {/* 2-Column Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px'
        }} className="profile-layout-grid">
          {/* Main Column: Services Catalog */}
          <div>
            {/* Descrição / Sobre o Estabelecimento DIRETAMENTE ACIMA dos Serviços Disponíveis */}
            <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#2563eb" />
                <span>Sobre o Estabelecimento</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                {bio || 'Especialista comprometido com a excelência no atendimento, pontualidade e cuidados personalizados para valorizar sua autoestima.'}
              </p>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700 }}>
                  Serviços Disponíveis
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  Selecione o serviço para escolher o horário de sua preferência
                </p>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700 }}>
                {services.length} opções
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {services.map(service => (
                <ServiceItemCard
                  key={service.id}
                  service={service}
                  onSelect={handleBookService}
                />
              ))}
            </div>
          </div>

          {/* Sidebar Info: Hours & Payment Methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Hours Card */}
            <div className="card">
              <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#2563eb" />
                <span>Horário de Funcionamento</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Dias de Atendimento:</span>
                  <strong style={{ color: '#0f172a' }}>{workingDays}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Expediente:</span>
                  <strong style={{ color: '#0f172a' }}>{schedule?.startHour || '09:00'} às {schedule?.endHour || '19:00'}</strong>
                </div>

                {schedule?.lunchStart && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Pausa para Almoço:</span>
                    <strong style={{ color: '#64748b' }}>{schedule.lunchStart} às {schedule.lunchEnd}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Contact Card */}
            <div className="card">
              <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#2563eb" />
                <span>Localização & Contato</span>
              </h4>

              <p style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600, marginBottom: '12px' }}>
                {address}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                {phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={15} color="#10b981" />
                    <span>{phone}</span>
                  </div>
                )}
                {email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={15} color="#2563eb" />
                    <span>{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Card */}
            <div className="card">
              <h4 style={{ fontSize: '1.05rem', marginBottom: '12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#7c3aed" />
                <span>Formas de Pagamento</span>
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(Array.isArray(professional.paymentMethods)
                  ? professional.paymentMethods
                  : (typeof professional.paymentMethods === 'string'
                      ? professional.paymentMethods.split(',').map(m => m.trim())
                      : ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'])
                ).map((method, idx) => (
                  <Badge key={idx} variant="violet">{method}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          professional={professional}
          initialService={selectedService}
        />
      )}

      <style>{`
        @media (min-width: 900px) {
          .profile-layout-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
