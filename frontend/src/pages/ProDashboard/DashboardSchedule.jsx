import React, { useState } from 'react';
import { Clock, Calendar, Ban, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function DashboardSchedule() {
  const { currentProData } = useAuth();
  const { addToast } = useToast();
  const [, setTick] = useState(0);

  const initialSchedule = currentProData?.schedule || {
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    startHour: '09:00',
    endHour: '19:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    slotInterval: 30
  };

  const [days, setDays] = useState(initialSchedule.daysOfWeek || [1, 2, 3, 4, 5, 6]);
  const [startHour, setStartHour] = useState(initialSchedule.startHour || '09:00');
  const [endHour, setEndHour] = useState(initialSchedule.endHour || '19:00');
  const [lunchStart, setLunchStart] = useState(initialSchedule.lunchStart || '12:00');
  const [lunchEnd, setLunchEnd] = useState(initialSchedule.lunchEnd || '13:00');
  const [slotInterval, setSlotInterval] = useState(String(initialSchedule.slotInterval || 30));

  // Bloqueio pontual
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const blockedSlots = currentProData?.blockedSlots || [];

  const weekdays = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' }
  ];

  const handleToggleDay = (dayId) => {
    if (days.includes(dayId)) {
      setDays(days.filter(d => d !== dayId));
    } else {
      setDays([...days, dayId].sort());
    }
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    try {
      storageService.updateSchedule(currentProData.id, {
        daysOfWeek: days,
        startHour,
        endHour,
        lunchStart,
        lunchEnd,
        slotInterval: parseInt(slotInterval, 10)
      });
      addToast('Configurações de horários salvas com sucesso!', 'success');
      setTick(t => t + 1);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddBlock = (e) => {
    e.preventDefault();
    if (!blockDate || !blockTime) {
      addToast('Selecione data e horário para o bloqueio', 'error');
      return;
    }

    try {
      storageService.addBlockedSlot(currentProData.id, {
        date: blockDate,
        time: blockTime,
        reason: blockReason || 'Indisponibilidade pessoal'
      });
      addToast('Horário bloqueado com sucesso na agenda!', 'success');
      setBlockDate('');
      setBlockTime('');
      setBlockReason('');
      setTick(t => t + 1);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRemoveBlock = (index) => {
    try {
      storageService.removeBlockedSlot(currentProData.id, index);
      addToast('Bloqueio removido com sucesso.', 'info');
      setTick(t => t + 1);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>
          Horários de Atendimento & Bloqueios
        </h1>
        <p style={{ color: '#64748b' }}>
          Defina sua jornada de trabalho semanal e adicione bloqueios pontuais para folgas ou compromissos.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Seção 1: Configuração Semanal */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#2563eb" />
            <span>Jornada Semanal</span>
          </h3>

          <form onSubmit={handleSaveSchedule}>
            {/* Dias de Atendimento */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
                Dias da Semana em que você Atende:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {weekdays.map(w => {
                  const isChecked = days.includes(w.id);
                  return (
                    <label
                      key={w.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isChecked ? '#eff6ff' : '#ffffff',
                        color: isChecked ? '#1d4ed8' : '#475569',
                        fontWeight: isChecked ? 600 : 400,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDay(w.id)}
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span>{w.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Faixa Horária */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Abertura / Início</label>
                <input
                  type="time"
                  className="form-input"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Encerramento / Fim</label>
                <input
                  type="time"
                  className="form-input"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Pausa Almoço */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Início do Almoço</label>
                <input
                  type="time"
                  className="form-input"
                  value={lunchStart}
                  onChange={(e) => setLunchStart(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fim do Almoço</label>
                <input
                  type="time"
                  className="form-input"
                  value={lunchEnd}
                  onChange={(e) => setLunchEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Intervalo Padrão entre Vagas</label>
              <select
                className="form-select"
                value={slotInterval}
                onChange={(e) => setSlotInterval(e.target.value)}
              >
                <option value="15">A cada 15 minutos</option>
                <option value="30">A cada 30 minutos (Recomendado)</option>
                <option value="45">A cada 45 minutos</option>
                <option value="60">A cada 60 minutos (1 hora)</option>
              </select>
            </div>

            <Button type="submit" variant="primary" icon={CheckCircle2} style={{ marginTop: '8px' }}>
              Salvar Jornada de Atendimento
            </Button>
          </form>
        </div>

        {/* Seção 2: Bloqueio de Horários Indisponíveis */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ban size={20} color="#ef4444" />
            <span>Bloqueio de Horários Indisponíveis</span>
          </h3>

          <form onSubmit={handleAddBlock} style={{ marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '12px' }}>
              Adicionar Novo Bloqueio Manual:
            </span>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  className="form-input"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horário</label>
                <input
                  type="time"
                  className="form-input"
                  value={blockTime}
                  onChange={(e) => setBlockTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Consulta médica, Manutenção de cadeira..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>

            <Button type="submit" variant="secondary" icon={Plus} size="sm">
              Bloquear Horário
            </Button>
          </form>

          {/* Lista de Bloqueios Ativos */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '10px' }}>
              Bloqueios Cadastrados ({blockedSlots.length})
            </h4>

            {blockedSlots.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Nenhum horário bloqueado manualmente no momento.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {blockedSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                        {slot.date} às {slot.time}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#b91c1c', display: 'block' }}>
                        {slot.reason}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(idx)}
                      style={{
                        padding: '4px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      title="Desbloquear horário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
