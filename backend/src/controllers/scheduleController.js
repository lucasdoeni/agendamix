import { pool } from '../config/db.js';

export async function updateSchedule(req, res) {
  try {
    const { proId } = req.params;
    const { daysOfWeek, startHour, endHour, lunchStart, lunchEnd, slotInterval } = req.body;

    const daysStr = Array.isArray(daysOfWeek) ? daysOfWeek.join(',') : daysOfWeek;

    const [existing] = await pool.query('SELECT id FROM schedules WHERE professional_id = ?', [proId]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE schedules 
         SET days_of_week = ?, start_hour = ?, end_hour = ?, lunch_start = ?, lunch_end = ?, slot_interval = ?
         WHERE professional_id = ?`,
        [daysStr, startHour, endHour, lunchStart, lunchEnd, slotInterval || 30, proId]
      );
    } else {
      await pool.query(
        `INSERT INTO schedules (professional_id, days_of_week, start_hour, end_hour, lunch_start, lunch_end, slot_interval)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [proId, daysStr, startHour, endHour, lunchStart, lunchEnd, slotInterval || 30]
      );
    }

    res.json({ message: 'Horários atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar horários:', error);
    res.status(500).json({ error: 'Erro ao salvar horários no MySQL' });
  }
}

export async function addBlockedSlot(req, res) {
  try {
    const { proId } = req.params;
    const { date, time, reason } = req.body;

    if (!date || !time) {
      return res.status(400).json({ error: 'Data e horário são obrigatórios para o bloqueio' });
    }

    const [result] = await pool.query(
      `INSERT INTO blocked_slots (professional_id, date, time, reason)
       VALUES (?, ?, ?, ?)`,
      [proId, date, time, reason || 'Indisponibilidade pessoal']
    );

    res.status(201).json({
      id: result.insertId,
      date,
      time,
      reason: reason || 'Indisponibilidade pessoal'
    });
  } catch (error) {
    console.error('Erro ao adicionar bloqueio:', error);
    res.status(500).json({ error: 'Erro ao bloquear horário no MySQL' });
  }
}

export async function removeBlockedSlot(req, res) {
  try {
    const { proId, slotId } = req.params;
    await pool.query('DELETE FROM blocked_slots WHERE id = ? AND professional_id = ?', [slotId, proId]);
    res.json({ message: 'Bloqueio removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover bloqueio:', error);
    res.status(500).json({ error: 'Erro ao remover bloqueio no MySQL' });
  }
}
