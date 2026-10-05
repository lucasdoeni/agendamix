import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Scissors,
  Check,
  Sparkles
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { storageService } from '../../services/storageService';
import { getAvailableSlots, getNextAvailableDates } from '../../services/bookingEngine';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BookingModal({
  isOpen,
  onClose,
  professional,
  initialService = null,
  onSuccess
}) {
  const navigate = useNavigate();
  const { isClient, currentUser } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1); // 1: Serviço, 2: Data/Hora, 3: Dados, 4: Sucesso

  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Confirmed booking details
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Available dates
  const availableDates = getNextAvailableDates(14);

  // Pre-select today or tomorrow on open
  useEffect(() => {
    if (isOpen) {
      if (initialService) {
        setSelectedService(initialService);
        setStep(2);
      } else {
        setStep(1);
      }
      if (availableDates.length > 0 && !selectedDate) {
        setSelectedDate(availableDates[0].dateStr);
      }
      if (currentUser?.type === 'client') {
        if (!clientName) setClientName(currentUser.name || '');
        if (!clientPhone) setClientPhone(currentUser.phone || '');
        if (!clientEmail) setClientEmail(currentUser.email || '');
      }
      setErrors({});
      setConfirmedBooking(null);
    }
  }, [isOpen, initialService, currentUser]);

  if (!professional) return null;

  // Obter horários para a data selecionada
  const existingBookings = storageService.getBookings();
  const timeSlots = selectedDate 
    ? getAvailableSlots({ professional, date: selectedDate, existingBookings }) 
    : [];

  const handleSelectService = (srv) => {
    setSelectedService(srv);
    setStep(2);
  };

  const validateClientForm = () => {
    const newErrors = {};
    if (!clientName.trim()) newErrors.clientName = 'Informe seu nome completo';
    if (!clientPhone.trim() || clientPhone.length < 9) newErrors.clientPhone = 'Informe um telefone/WhatsApp válido';
    if (!clientEmail.trim() || !clientEmail.includes('@')) newErrors.clientEmail = 'Informe um e-mail válido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmBooking = () => {
    if (!validateClientForm()) return;

    setLoading(true);
    try {
      const newBooking = storageService.createBooking({
        proId: professional.id,
        proName: professional.name,
        commercialName: professional.commercialName,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
        duration: selectedService.duration,
        date: selectedDate,
        time: selectedTime,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim()
      });

      setConfirmedBooking(newBooking);
      setStep(4);
      addToast('Agendamento realizado com sucesso!', 'success');
      if (onSuccess) onSuccess(newBooking);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = selectedDate ? (() => {
    const [y, m, d] = selectedDate.split('-');
    return `${d}/${m}/${y}`;
  })() : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 4 ? 'Reserva Confirmada!' : `Agendamento — ${professional.commercialName}`}
      subtitle={step === 4 ? 'Apresente os dados abaixo ao chegar' : 'Escolha o serviço, dia e horário desejado'}
      maxWidth="620px"
    >
      {/* Step Indicator */}
      {step < 4 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          {[
            { num: 1, label: 'Serviço' },
            { num: 2, label: 'Data & Hora' },
            { num: 3, label: 'Seus Dados' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step >= s.num ? 'var(--grad-primary)' : '#e2e8f0',
                  color: step >= s.num ? '#ffffff' : '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: step === s.num ? 700 : 500,
                  color: step === s.num ? '#0f172a' : '#64748b'
                }}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: step > idx + 1 ? '#2563eb' : '#e2e8f0',
                  margin: '0 8px'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* STEP 1: Escolha do Serviço */}
      {step === 1 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '8px' }}>
            Selecione qual procedimento você deseja realizar:
          </p>
          {professional.services.map((srv) => (
            <div
              key={srv.id}
              onClick={() => handleSelectService(srv)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: selectedService?.id === srv.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: selectedService?.id === srv.id ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                if (selectedService?.id !== srv.id) e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                if (selectedService?.id !== srv.id) e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{srv.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                  <Clock size={13} />
                  <span>{srv.duration} min</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1d4ed8' }}>
                  R$ {Number(srv.price).toFixed(2).replace('.', ',')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                  <span>Selecionar</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2: Escolha de Data e Horário */}
      {step === 2 && (
        <div className="animate-fade-in">
          {/* Serviço Escolhido Resumo */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scissors size={16} color="#2563eb" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedService?.name}</span>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1d4ed8' }}>
              R$ {Number(selectedService?.price).toFixed(2).replace('.', ',')} ({selectedService?.duration}m)
            </span>
          </div>

          {/* Seletor de Datas (Carrossel Horizontal) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              Selecione o Dia
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.dateStr);
                      setSelectedTime('');
                    }}
                    style={{
                      flexShrink: 0,
                      width: '64px',
                      padding: '10px 4px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: isSelected ? '#2563eb' : '#64748b', fontWeight: 600 }}>
                      {item.dayName}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                      {item.dayNumber}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: isSelected ? '#2563eb' : '#94a3b8' }}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade de Horários */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              Horários Livres em {formattedDate}
            </label>

            {timeSlots.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                  Não há horários de atendimento disponíveis para este dia.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '8px',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '4px'
              }}>
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      title={!slot.available ? slot.label : 'Disponível'}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#2563eb' : slot.available ? '#ffffff' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : slot.available ? '#1e293b' : '#94a3b8',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        textDecoration: !slot.available ? 'line-through' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <Button variant="outline" icon={ArrowLeft} onClick={() => setStep(1)}>
              Voltar aos Serviços
            </Button>
            <Button
              variant="primary"
              disabled={!selectedDate || !selectedTime}
              icon={ArrowRight}
              onClick={() => setStep(3)}
            >
              Avançar para Identificação
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Dados do Cliente */}
      {step === 3 && (
        <div className="animate-fade-in">
          {/* Card Resumo do Agendamento */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>{selectedService?.name}</span>
              <strong style={{ fontSize: '0.95rem', color: '#1e3a8a' }}>R$ {Number(selectedService?.price).toFixed(2).replace('.', ',')}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: '#1e40af' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarIcon size={14} /> {formattedDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {selectedTime} ({selectedService?.duration} min)
              </span>
            </div>
          </div>

          {/* Formulário */}
          <div className="form-group">
            <label className="form-label">Seu Nome Completo *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Amanda Nogueira"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            {errors.clientName && <span className="form-error">{errors.clientName}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">WhatsApp / Telefone *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="(11) 98765-4321"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
              {errors.clientPhone && <span className="form-error">{errors.clientPhone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">E-mail para Confirmação *</label>
              <input
                type="email"
                className="form-input"
                placeholder="seuemail@exemplo.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
              {errors.clientEmail && <span className="form-error">{errors.clientEmail}</span>}
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', marginBottom: '20px' }}>
            Ao confirmar, sua vaga é bloqueada imediatamente no sistema, impossibilitando que outro cliente agende no mesmo horário.
          </p>

          {/* Buttons */}
          <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <Button variant="outline" icon={ArrowLeft} onClick={() => setStep(2)}>
              Alterar Horário
            </Button>
            <Button
              variant="primary"
              loading={loading}
              icon={CheckCircle2}
              onClick={handleConfirmBooking}
            >
              Confirmar Agendamento
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Comprovante de Sucesso */}
      {step === 4 && confirmedBooking && (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '6px' }}>
            Agendamento Confirmado!
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 20px' }}>
            Enviamos os detalhes da reserva para seu e-mail e seu horário já está reservado.
          </p>

          {/* Ticket / Voucher */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Código da Reserva</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>#{confirmedBooking.id.slice(-6)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge variant="success">Confirmado</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Estabelecimento:</span>
                <strong style={{ color: '#0f172a' }}>{confirmedBooking.commercialName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Serviço:</span>
                <strong style={{ color: '#0f172a' }}>{confirmedBooking.serviceName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Data e Horário:</span>
                <strong style={{ color: '#2563eb' }}>{formattedDate} às {confirmedBooking.time}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Valor Estimado:</span>
                <strong style={{ color: '#10b981' }}>R$ {Number(confirmedBooking.price).toFixed(2).replace('.', ',')}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Cliente:</span>
                <strong style={{ color: '#0f172a' }}>{confirmedBooking.clientName} ({confirmedBooking.clientPhone})</strong>
              </div>
            </div>
          </div>

          {/* Opções de Cadastro / Login de Cliente se não estiver autenticado */}
          {!isClient ? (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1.5px solid #bae6fd',
              borderRadius: '16px',
              padding: '18px 20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#0284c7', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                <Sparkles size={18} />
                <span>Acompanhe seus horários com facilidade!</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', margin: '0 auto 16px', maxWidth: '420px', lineHeight: 1.45 }}>
                Crie sua conta gratuita de cliente para acompanhar o status, receber lembretes e gerenciar seus agendamentos a qualquer momento.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate('/cadastro-cliente', {
                      state: {
                        name: clientName,
                        email: clientEmail,
                        phone: clientPhone
                      }
                    });
                  }}
                >
                  Criar Conta de Cliente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate('/login', {
                      state: {
                        email: clientEmail,
                        role: 'client'
                      }
                    });
                  }}
                >
                  Já tenho conta (Fazer Login)
                </Button>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#065f46'
            }}>
              Conectado como <strong>{currentUser?.name}</strong>. Esta reserva já está salva na sua conta!
            </div>
          )}

          <div className="mobile-stack" style={{ display: 'flex', gap: '12px' }}>
            {isClient && (
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  onClose();
                  navigate('/meus-agendamentos');
                }}
              >
                Ver Meus Agendamentos
              </Button>
            )}
            <Button fullWidth variant="primary" onClick={onClose}>
              Concluir e Fechar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
