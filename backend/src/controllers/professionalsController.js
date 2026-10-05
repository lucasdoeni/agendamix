import { pool } from '../config/db.js';

// Retorna todos os profissionais com seus serviços e horários
export async function getProfessionals(req, res) {
  try {
    const [pros] = await pool.query(`
      SELECT 
        id, name, commercial_name as commercialName, category, email, phone, 
        street, number, neighborhood, complement, state, country,
        city, address, avatar, cover_image as coverImage, bio, rating, review_count as reviewCount, featured,
        payment_methods as paymentMethods
      FROM professionals
      ORDER BY featured DESC, rating DESC
    `);

    // Busca serviços e horários para cada profissional
    for (const pro of pros) {
      pro.categories = pro.category ? pro.category.split(',').map(c => c.trim()) : [];
      pro.paymentMethods = pro.paymentMethods ? pro.paymentMethods.split(',').map(m => m.trim()) : ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];
      const [services] = await pool.query(
        'SELECT id, name, price, duration, description FROM services WHERE professional_id = ? ORDER BY price ASC',
        [pro.id]
      );
      pro.services = services.map(s => ({ ...s, price: Number(s.price) }));

      const [schedules] = await pool.query(
        'SELECT days_of_week as daysOfWeek, start_hour as startHour, end_hour as endHour, lunch_start as lunchStart, lunch_end as lunchEnd, slot_interval as slotInterval FROM schedules WHERE professional_id = ?',
        [pro.id]
      );

      if (schedules.length > 0) {
        pro.schedule = {
          ...schedules[0],
          daysOfWeek: schedules[0].daysOfWeek ? schedules[0].daysOfWeek.split(',').map(Number) : [1, 2, 3, 4, 5, 6]
        };
      }

      const [blocked] = await pool.query(
        'SELECT id, date, time, reason FROM blocked_slots WHERE professional_id = ? ORDER BY date ASC, time ASC',
        [pro.id]
      );
      pro.blockedSlots = blocked;
    }

    res.json(pros);
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    res.status(500).json({ error: 'Erro ao buscar profissionais no banco de dados' });
  }
}

// Retorna um profissional específico por ID
export async function getProfessionalById(req, res) {
  try {
    const { id } = req.params;
    const [pros] = await pool.query(`
      SELECT 
        id, name, commercial_name as commercialName, category, email, phone, 
        street, number, neighborhood, complement, state, country,
        city, address, avatar, cover_image as coverImage, bio, rating, review_count as reviewCount, featured,
        payment_methods as paymentMethods
      FROM professionals
      WHERE id = ?
    `, [id]);

    if (pros.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    const pro = pros[0];
    pro.categories = pro.category ? pro.category.split(',').map(c => c.trim()) : [];
    pro.paymentMethods = pro.paymentMethods ? pro.paymentMethods.split(',').map(m => m.trim()) : ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];

    const [services] = await pool.query(
      'SELECT id, name, price, duration, description FROM services WHERE professional_id = ? ORDER BY price ASC',
      [pro.id]
    );
    pro.services = services.map(s => ({ ...s, price: Number(s.price) }));

    const [schedules] = await pool.query(
      'SELECT days_of_week as daysOfWeek, start_hour as startHour, end_hour as endHour, lunch_start as lunchStart, lunch_end as lunchEnd, slot_interval as slotInterval FROM schedules WHERE professional_id = ?',
      [pro.id]
    );

    if (schedules.length > 0) {
      pro.schedule = {
        ...schedules[0],
        daysOfWeek: schedules[0].daysOfWeek ? schedules[0].daysOfWeek.split(',').map(Number) : [1, 2, 3, 4, 5, 6]
      };
    }

    const [blocked] = await pool.query(
      'SELECT id, date, time, reason FROM blocked_slots WHERE professional_id = ? ORDER BY date ASC, time ASC',
      [pro.id]
    );
    pro.blockedSlots = blocked;

    res.json(pro);
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do profissional' });
  }
}

// Atualizar foto do profissional
export async function updateAvatar(req, res) {
  try {
    const { id } = req.params;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: 'Nenhuma foto fornecida' });
    }

    await pool.query('UPDATE professionals SET avatar = ? WHERE id = ?', [avatar, id]);
    res.json({ message: 'Foto de perfil atualizada com sucesso', avatar });
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);
    res.status(500).json({ error: 'Erro ao salvar a foto de perfil no MySQL' });
  }
}

// Atualizar imagem de capa do perfil público do profissional
export async function updateCover(req, res) {
  try {
    const { id } = req.params;
    const { coverImage } = req.body;

    if (!coverImage) {
      return res.status(400).json({ error: 'Nenhuma imagem de capa fornecida' });
    }

    await pool.query('UPDATE professionals SET cover_image = ? WHERE id = ?', [coverImage, id]);
    res.json({ message: 'Imagem de capa atualizada com sucesso', coverImage });
  } catch (error) {
    console.error('Erro ao atualizar imagem de capa:', error);
    res.status(500).json({ error: 'Erro ao salvar a imagem de capa no MySQL' });
  }
}
