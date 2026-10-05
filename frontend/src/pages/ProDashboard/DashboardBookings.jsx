import React, { useState, useMemo } from 'react';
import { Search, Calendar, Phone, Mail, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function DashboardBookings() {
  const { currentProData } = useAuth();
  const { addToast } = useToast();
  const [, setTick] = useState(0);

  const [statusFilter, setStatusFilter] = useState('all'); // all, confirmed, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');

  const proBookings = storageService.getBookingsByPro(currentProData.id);

  const filteredBookings = useMemo(() => {
    return proBookings.filter(b => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const clean = searchQuery.toLowerCase().trim();
      const matchesSearch = !clean ||
        b.clientName.toLowerCase().includes(clean) ||
        b.clientPhone.includes(clean) ||
        b.clientEmail.toLowerCase().includes(clean) ||
        b.serviceName.toLowerCase().includes(clean) ||
        b.date.includes(clean);

      return matchesStatus && matchesSearch;
    });
  }, [proBookings, statusFilter, searchQuery]);

  const handleUpdateStatus = (bookingId, newStatus) => {
    try {
      storageService.updateBookingStatus(bookingId, newStatus);
      const msg = newStatus === 'completed' ? 'Agendamento concluído com sucesso!' :
                  newStatus === 'cancelled' ? 'Agendamento cancelado.' : 'Agendamento confirmado!';
      addToast(msg, newStatus === 'cancelled' ? 'error' : 'success');
      setTick(t => t + 1);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>
          Histórico & Gestão de Reservas
        </h1>
        <p style={{ color: '#64748b' }}>
          Gerencie todos os agendamentos recebidos, com opção de confirmação e cancelamento.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `Todos (${proBookings.length})` },
            { id: 'confirmed', label: 'Confirmados' },
            { id: 'completed', label: 'Concluídos' },
            { id: 'cancelled', label: 'Cancelados' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: statusFilter === tab.id ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: statusFilter === tab.id ? '#eff6ff' : '#ffffff',
                color: statusFilter === tab.id ? '#2563eb' : '#475569',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '6px 12px',
          minWidth: '240px'
        }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Buscar por cliente, data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {filteredBookings.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Calendar size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Nenhum agendamento encontrado</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Não há reservas que correspondam aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px' }}>Data e Hora</th>
                  <th style={{ padding: '14px 16px' }}>Cliente</th>
                  <th style={{ padding: '14px 16px' }}>Serviço</th>
                  <th style={{ padding: '14px 16px' }}>Valor</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      <div>{b.date}</div>
                      <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>{b.time} ({b.duration}m)</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{b.clientName}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.clientPhone}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {b.serviceName}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#10b981' }}>
                      R$ {Number(b.price).toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {b.status === 'confirmed' && <Badge variant="success">Confirmado</Badge>}
                      {b.status === 'completed' && <Badge variant="primary">Concluído</Badge>}
                      {b.status === 'cancelled' && <Badge variant="danger">Cancelado</Badge>}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {b.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'completed')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                color: '#065f46',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Concluir
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#991b1b',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {b.status === 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Reativar
                          </button>
                        )}
                        {b.status === 'completed' && (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Finalizado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
