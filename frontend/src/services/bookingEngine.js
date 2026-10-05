/**
 * Motor de Cálculo de Horários Disponíveis e Prevenção de Conflitos
 */

// Converte string 'HH:MM' em minutos do dia para facilitar comparações
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Converte minutos do dia para string 'HH:MM'
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Gera todos os horários possíveis para um profissional em determinada data,
 * indicando se cada slot está livre, ocupado ou bloqueado.
 */
export function getAvailableSlots({ professional, date, existingBookings = [] }) {
  if (!professional || !date) return [];

  const targetDate = new Date(date + 'T00:00:00');
  const dayOfWeek = targetDate.getDay(); // 0 = Domingo, 1 = Segunda, etc.

  const schedule = professional.schedule || {
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    startHour: '09:00',
    endHour: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    slotInterval: 30
  };

  // Verifica se o profissional atende neste dia da semana
  const isWorkingDay = schedule.daysOfWeek.includes(dayOfWeek);
  if (!isWorkingDay) {
    return [];
  }

  const startMin = timeToMinutes(schedule.startHour || '09:00');
  const endMin = timeToMinutes(schedule.endHour || '18:00');
  const lunchStartMin = schedule.lunchStart ? timeToMinutes(schedule.lunchStart) : null;
  const lunchEndMin = schedule.lunchEnd ? timeToMinutes(schedule.lunchEnd) : null;
  const interval = schedule.slotInterval || 30;

  // Filtra agendamentos ativos na data especificada
  const dayBookings = existingBookings.filter(b => 
    b.proId === professional.id && 
    b.date === date && 
    b.status !== 'cancelled'
  );

  // Filtra bloqueios manuais cadastrados pelo profissional
  const blockedSlots = (professional.blockedSlots || []).filter(b => b.date === date);

  const slots = [];

  for (let current = startMin; current < endMin; current += interval) {
    const timeStr = minutesToTime(current);

    // 1. Verifica intervalo de almoço
    const isLunch = lunchStartMin !== null && lunchEndMin !== null && 
                    current >= lunchStartMin && current < lunchEndMin;

    if (isLunch) {
      continue; // Não exibe horários de almoço na grade
    }

    // 2. Verifica se já está reservado
    const isBooked = dayBookings.some(b => b.time === timeStr);

    // 3. Verifica bloqueio manual
    const isBlocked = blockedSlots.some(b => b.time === timeStr);

    let status = 'available';
    let label = 'Disponível';

    if (isBooked) {
      status = 'booked';
      label = 'Ocupado';
    } else if (isBlocked) {
      status = 'blocked';
      label = 'Indisponível';
    }

    slots.push({
      time: timeStr,
      status,
      available: status === 'available',
      label
    });
  }

  return slots;
}

/**
 * Retorna as próximas datas úteis a partir de hoje
 */
export function getNextAvailableDates(daysCount = 14) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    dates.push({
      dateStr,
      dayNumber: d.getDate(),
      dayName: weekdays[d.getDay()],
      monthName: months[d.getMonth()],
      isWeekend: d.getDay() === 0, // Domingo
      rawDate: d
    });
  }

  return dates;
}
