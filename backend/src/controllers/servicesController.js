import { pool } from '../config/db.js';

export async function addService(req, res) {
  try {
    const { proId } = req.params;
    const { name, price, duration, description } = req.body;

    if (!name || price === undefined || !duration) {
      return res.status(400).json({ error: 'Nome, preço e duração são obrigatórios' });
    }

    const serviceId = 'srv-' + Date.now();
    await pool.query(
      `INSERT INTO services (id, professional_id, name, price, duration, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [serviceId, proId, name, parseFloat(price), parseInt(duration, 10), description || '']
    );

    res.status(201).json({
      id: serviceId,
      name,
      price: parseFloat(price),
      duration: parseInt(duration, 10),
      description: description || ''
    });
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    res.status(500).json({ error: 'Erro ao cadastrar serviço no MySQL' });
  }
}

export async function updateService(req, res) {
  try {
    const { proId, serviceId } = req.params;
    const { name, price, duration, description } = req.body;

    await pool.query(
      `UPDATE services 
       SET name = ?, price = ?, duration = ?, description = ?
       WHERE id = ? AND professional_id = ?`,
      [name, parseFloat(price), parseInt(duration, 10), description || '', serviceId, proId]
    );

    res.json({
      id: serviceId,
      name,
      price: parseFloat(price),
      duration: parseInt(duration, 10),
      description: description || ''
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço no MySQL' });
  }
}

export async function deleteService(req, res) {
  try {
    const { proId, serviceId } = req.params;
    await pool.query('DELETE FROM services WHERE id = ? AND professional_id = ?', [serviceId, proId]);
    res.json({ message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ error: 'Erro ao excluir serviço do MySQL' });
  }
}
