import { pool } from '../config/db.js';

// Retorna agendamentos de um profissional
export async function getBookingsByPro(req, res) {
  try {
    const { proId } = req.params;
    const [bookings] = await pool.query(
      `SELECT 
        b.id, b.professional_id as proId, p.name as proName, p.commercial_name as commercialName,
        b.service_id as serviceId, s.name as serviceName, b.price, b.duration,
        b.client_name as clientName, b.client_email as clientEmail, b.client_phone as clientPhone,
        b.date, b.time, b.status, b.created_at as createdAt
      FROM bookings b
      JOIN professionals p ON b.professional_id = p.id
      JOIN services s ON b.service_id = s.id
      WHERE b.professional_id = ?
      ORDER BY b.date DESC, b.time ASC`,
      [proId]
    );

    res.json(bookings.map(b => ({ ...b, price: Number(b.price) })));
  } catch (error) {
    console.error('Erro ao buscar agendamentos do profissional:', error);
    res.status(500).json({ error: 'Erro ao consultar agendamentos no MySQL' });
  }
}

// Busca agendamentos por cliente (email ou telefone)
export async function getBookingsByClient(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const clean = query.trim();
    const [bookings] = await pool.query(
      `SELECT 
        b.id, b.professional_id as proId, p.name as proName, p.commercial_name as commercialName,
        b.service_id as serviceId, s.name as serviceName, b.price, b.duration,
        b.client_name as clientName, b.client_email as clientEmail, b.client_phone as clientPhone,
        b.date, b.time, b.status, b.created_at as createdAt
      FROM bookings b
      JOIN professionals p ON b.professional_id = p.id
      JOIN services s ON b.service_id = s.id
      WHERE b.client_email = ? OR b.client_phone = ? OR b.client_name LIKE ?
      ORDER BY b.date DESC, b.time ASC`,
      [clean, clean, `%${clean}%`]
    );

    res.json(bookings.map(b => ({ ...b, price: Number(b.price) })));
  } catch (error) {
    console.error('Erro ao buscar reservas do cliente:', error);
    res.status(500).json({ error: 'Erro ao localizar reservas no MySQL' });
  }
}

// Criar novo agendamento com validação estrita anti-duplicação
export async function createBooking(req, res) {
  try {
    const { proId, serviceId, date, time, clientName, clientEmail, clientPhone } = req.body;

    if (!proId || !serviceId || !date || !time || !clientName || !clientEmail || !clientPhone) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios para confirmar a reserva' });
    }

    // 1. Verificação anti-conflito no MySQL
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings 
       WHERE professional_id = ? AND date = ? AND time = ? AND status != 'cancelled'`,
      [proId, date, time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'Este horário já foi reservado por outro cliente. Por favor, selecione outro horário.'
      });
    }

    // 2. Busca informações do serviço para registrar preço e duração no momento do agendamento
    const [services] = await pool.query('SELECT price, duration, name FROM services WHERE id = ?', [serviceId]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const service = services[0];
    const bookingId = 'bkg-' + Date.now();

    await pool.query(
      `INSERT INTO bookings 
       (id, professional_id, service_id, client_name, client_email, client_phone, date, time, price, duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [bookingId, proId, serviceId, clientName, clientEmail, clientPhone, date, time, service.price, service.duration]
    );

    // 3. Salva ou atualiza o cliente final na tabela `clients`
    const clientId = 'cli-' + Date.now();
    await pool.query(
      `INSERT INTO clients (id, name, email, phone) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
      [clientId, clientName.trim(), clientEmail.trim().toLowerCase(), clientPhone.trim()]
    );

    // Retorna os dados completos com nome comercial
    const [pro] = await pool.query('SELECT name, commercial_name as commercialName FROM professionals WHERE id = ?', [proId]);

    res.status(201).json({
      id: bookingId,
      proId,
      proName: pro[0]?.name,
      commercialName: pro[0]?.commercialName,
      serviceId,
      serviceName: service.name,
      price: Number(service.price),
      duration: service.duration,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao gravar agendamento no MySQL' });
  }
}

// Atualizar status do agendamento (concluir / cancelar / reativar)
export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status atualizado com sucesso', status });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da reserva no MySQL' });
  }
}
