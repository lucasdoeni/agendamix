import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Sparkles,
  ExternalLink,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { uploadImageToBackend } from '../../services/uploadService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function DashboardHome() {
  const { currentProData, updateProAvatar, updateProCover } = useAuth();
  const { addToast } = useToast();
  const [, setTick] = useState(0); // For forcing re-render after status change
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingAvatar(true);
      try {
        const serverUrl = await uploadImageToBackend(file);
        await updateProAvatar(serverUrl);
        addToast('Sua foto de perfil foi armazenada com sucesso no backend!', 'success');
        setTick(t => t + 1);
      } catch (err) {
        addToast(err.message || 'Erro ao fazer upload da foto', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingCover(true);
      try {
        const serverUrl = await uploadImageToBackend(file);
        await updateProCover(serverUrl);
        addToast('Imagem da capa foi armazenada com sucesso no backend!', 'success');
        setTick(t => t + 1);
      } catch (err) {
        addToast(err.message || 'Erro ao fazer upload da capa', 'error');
      } finally {
        setUploadingCover(false);
      }
    }
  };

  const proBookings = storageService.getBookingsByPro(currentProData.id);

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const todayBookings = proBookings.filter(b => b.date === todayStr);
  const activeBookings = proBookings.filter(b => b.status === 'confirmed');

  // Metrics
  const uniqueClients = new Set(proBookings.map(b => b.clientPhone || b.clientEmail)).size;
  const estimatedRevenue = activeBookings.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const handleUpdateStatus = (bookingId, newStatus) => {
    try {
      storageService.updateBookingStatus(bookingId, newStatus);
      const msg = newStatus === 'completed' ? 'Atendimento marcado como concluído!' :
                  newStatus === 'cancelled' ? 'Agendamento cancelado.' : 'Status atualizado.';
      addToast(msg, newStatus === 'cancelled' ? 'error' : 'success');
      setTick(t => t + 1);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>
            Olá, {currentProData.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Aqui está o resumo dos atendimentos e da sua agenda para hoje.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />

          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            onChange={handleCoverUpload}
            style={{ display: 'none' }}
          />

          <Button
            variant="outline"
            size="sm"
            icon={Camera}
            onClick={() => fileInputRef.current?.click()}
          >
            Alterar Foto
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ImageIcon}
            onClick={() => coverInputRef.current?.click()}
          >
            Alterar Imagem da Capa
          </Button>

          <a
            href={`/p/${currentProData.id}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #2563eb',
              color: '#2563eb',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            <span>Ver Perfil Público</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Banner de Capa e Personalização Visual */}
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '28px',
        minHeight: '130px',
        backgroundColor: '#1e3a8a',
        backgroundImage: currentProData.coverImage ? `url(${currentProData.coverImage})` : 'var(--grad-primary)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.35) 100%)'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '20px 24px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '3px solid #ffffff',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              backgroundColor: '#ffffff',
              flexShrink: 0
            }}>
              <img
                src={currentProData.avatar}
                alt={currentProData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h2 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {currentProData.commercialName}
              </h2>
              <span style={{ color: '#93c5fd', fontSize: '0.85rem' }}>
                Capa ativa no seu perfil público • Dimensão ideal: 1200x400
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Camera}
              style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#0f172a', borderColor: '#ffffff' }}
              onClick={() => fileInputRef.current?.click()}
            >
              Foto de Perfil
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ImageIcon}
              onClick={() => coverInputRef.current?.click()}
            >
              Alterar Capa
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Atendimentos Hoje */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              Atendimentos Hoje
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>
              {todayBookings.length}
            </strong>
          </div>
        </div>

        {/* Total Clientes */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#f5f3ff',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              Total de Clientes
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>
              {uniqueClients}
            </strong>
          </div>
        </div>

        {/* Faturamento Previsto */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              Receita Confirmada
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>
              R$ {estimatedRevenue.toFixed(2).replace('.', ',')}
            </strong>
          </div>
        </div>

        {/* Catálogo de Serviços */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#fffbeb',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
              Serviços Ativos
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>
              {currentProData.services?.length || 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Atendimentos de Hoje e Próximos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Atendimentos do Dia */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                Atendimentos de Hoje
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {todayBookings.length} clientes agendados para a data de hoje
              </p>
            </div>
            <Badge variant="primary">Tempo Real</Badge>
          </div>

          {todayBookings.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Calendar size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1rem', color: '#334155' }}>Nenhum atendimento marcado para hoje</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 16px' }}>
                Os agendamentos feitos pelos clientes através da sua página pública aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayBookings.map(bkg => (
                <div
                  key={bkg.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: bkg.status === 'cancelled' ? '#fef2f2' : '#ffffff',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}>
                      {bkg.time}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '2px' }}>
                        {bkg.clientName}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                        {bkg.serviceName} • <strong>R$ {Number(bkg.price).toFixed(2).replace('.', ',')}</strong> ({bkg.duration} min)
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} color="#10b981" /> {bkg.clientPhone}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={13} color="#2563eb" /> {bkg.clientEmail}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {bkg.status === 'confirmed' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={CheckCircle2}
                          onClick={() => handleUpdateStatus(bkg.id, 'completed')}
                        >
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                          icon={XCircle}
                          onClick={() => handleUpdateStatus(bkg.id, 'cancelled')}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}

                    {bkg.status === 'completed' && <Badge variant="success">Concluído</Badge>}
                    {bkg.status === 'cancelled' && <Badge variant="danger">Cancelado</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Todos os Próximos Atendimentos */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
              Próximos Atendimentos na Semana
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
              {activeBookings.length} agendamento(s)
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px 8px' }}>Data / Hora</th>
                  <th style={{ padding: '10px 8px' }}>Cliente</th>
                  <th style={{ padding: '10px 8px' }}>Serviço</th>
                  <th style={{ padding: '10px 8px' }}>Valor</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.slice(0, 6).map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: '#0f172a' }}>
                      {b.date} às {b.time}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div>{b.clientName}</div>
                      <small style={{ color: '#64748b' }}>{b.clientPhone}</small>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#334155' }}>
                      {b.serviceName}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: '#10b981' }}>
                      R$ {Number(b.price).toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Badge variant="success">Confirmado</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
