import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Login exclusivo administrativo (admin / admin)
export async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;

    const adminExpectedUser = process.env.ADMIN_USER || 'admin';
    const adminExpectedPass = process.env.ADMIN_PASSWORD || 'admin';

    if (username === adminExpectedUser && password === adminExpectedPass) {
      return res.json({
        success: true,
        message: 'Acesso administrativo autorizado',
        user: {
          role: 'admin',
          username: adminExpectedUser,
          name: 'Administrador AgendaMix'
        }
      });
    }

    return res.status(401).json({
      error: 'Acesso negado. Usuário ou senha administrativa incorretos.'
    });
  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({ error: 'Erro interno ao processar login administrativo' });
  }
}

// Lista todos os usuários e profissionais para o painel de manutenção
export async function getAllUsers(req, res) {
  try {
    // 1. Busca todos os profissionais cadastrados com todos os campos
    const [pros] = await pool.query(`
      SELECT 
        p.id, p.name, p.commercial_name as commercialName, p.category, 
        p.email, p.phone, p.street, p.number, p.neighborhood, p.complement,
        p.city, p.state, p.country, p.address, p.bio, p.avatar, p.cover_image as coverImage,
        p.payment_methods as paymentMethods,
        p.created_at as createdAt,
        COUNT(DISTINCT s.id) as servicesCount,
        COUNT(DISTINCT b.id) as bookingsCount
      FROM professionals p
      LEFT JOIN services s ON p.id = s.professional_id
      LEFT JOIN bookings b ON p.id = b.professional_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // 2. Busca todos os clientes cadastrados no MySQL (com agendamentos se houver)
    const [clients] = await pool.query(`
      SELECT 
        c.id, c.name, c.email, c.phone, c.created_at as createdAt,
        COUNT(b.id) as totalBookings,
        MAX(b.created_at) as lastBookingDate
      FROM clients c
      LEFT JOIN bookings b ON c.email = b.client_email
      GROUP BY c.id, c.name, c.email, c.phone, c.created_at
      ORDER BY c.created_at DESC
    `);

    res.json({
      professionals: pros.map(p => ({
        ...p,
        categories: p.category ? p.category.split(',').map(m => m.trim()) : [],
        paymentMethods: p.paymentMethods ? p.paymentMethods.split(',').map(m => m.trim()) : []
      })),
      clients
    });
  } catch (error) {
    console.error('Erro ao listar usuários no painel admin:', error);
    res.status(500).json({ error: 'Erro ao listar usuários do banco de dados' });
  }
}

// Criar novo usuário (Profissional ou Cliente) pelo painel de manutenção
export async function createAdminUser(req, res) {
  try {
    const { userType = 'professional', ...data } = req.body;

    if (userType === 'professional') {
      const {
        name,
        commercialName,
        category,
        categories,
        email,
        password,
        phone,
        street,
        number,
        neighborhood,
        complement,
        city,
        state,
        country,
        address,
        bio,
        paymentMethods
      } = data;

      if (!name || !commercialName || !email) {
        return res.status(400).json({ error: 'Nome, Nome Comercial e E-mail são obrigatórios para profissional.' });
      }

      const proEmail = email.trim().toLowerCase();
      const [existing] = await pool.query('SELECT id FROM professionals WHERE email = ?', [proEmail]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado para outro profissional.' });
      }

      const proId = 'pro-' + Date.now();
      const hashedPassword = await bcrypt.hash(password || '123456', 10);
      const finalCategory = Array.isArray(categories) && categories.length > 0
        ? categories.join(', ')
        : (category || 'barbearia');

      const formattedAddress = address || (street
        ? `Rua ${street}, ${number || 's/n'}${complement ? ` - ${complement}` : ''}, ${neighborhood || ''} - ${city || 'São Paulo'}, ${state || 'SP'} - ${country || 'Brasil'}`
        : 'Endereço Comercial');

      const paymentMethodsStr = Array.isArray(paymentMethods) && paymentMethods.length > 0
        ? paymentMethods.join(', ')
        : 'Pix, Cartão de Crédito, Cartão de Débito, Dinheiro';

      const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
      const defaultCover = 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80';

      // 1. Insere o profissional
      await pool.query(
        `INSERT INTO professionals 
         (id, name, commercial_name, category, email, password, phone, street, number, neighborhood, complement, city, state, country, address, avatar, cover_image, bio, payment_methods, rating, review_count, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.00, 1, false)`,
        [
          proId, name.trim(), commercialName.trim(), finalCategory, proEmail, hashedPassword, phone || '',
          street || '', number || '', neighborhood || '', complement || '',
          city || 'São Paulo', state || 'SP', country || 'Brasil',
          formattedAddress, defaultAvatar, defaultCover,
          bio || 'Profissional cadastrado pelo painel de manutenção.',
          paymentMethodsStr
        ]
      );

      // 2. Insere horários de atendimento padrão
      await pool.query(
        `INSERT INTO schedules 
         (professional_id, days_of_week, start_hour, end_hour, lunch_start, lunch_end, slot_interval)
         VALUES (?, '1,2,3,4,5,6', '09:00', '18:00', '12:00', '13:00', 30)`,
        [proId]
      );

      // 3. Insere serviço inicial padrão
      const serviceId = 'srv-' + Date.now();
      await pool.query(
        `INSERT INTO services 
         (id, professional_id, name, price, duration, description)
         VALUES (?, ?, 'Atendimento Personalizado', 60.00, 40, 'Serviço cadastrado pelo administrador.')`,
        [serviceId, proId]
      );

      return res.status(201).json({
        message: `Profissional "${commercialName}" criado com sucesso no MySQL!`,
        id: proId
      });
    } else {
      // Criação de Cliente
      const { name, email, phone, password } = data;

      if (!name || !email) {
        return res.status(400).json({ error: 'Nome e E-mail são obrigatórios para cliente.' });
      }

      const clientEmail = email.trim().toLowerCase();
      const [existing] = await pool.query('SELECT id FROM clients WHERE email = ?', [clientEmail]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado para outro cliente.' });
      }

      const clientId = 'cli-' + Date.now();
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      await pool.query(
        'INSERT INTO clients (id, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
        [clientId, name.trim(), clientEmail, phone?.trim() || '', hashedPassword]
      );

      return res.status(201).json({
        message: `Cliente "${name}" cadastrado com sucesso no MySQL!`,
        id: clientId
      });
    }
  } catch (error) {
    console.error('Erro ao criar usuário no painel admin:', error);
    res.status(500).json({ error: 'Erro ao criar usuário no banco de dados' });
  }
}

// Editar informações completas de um Profissional
export async function updateProfessional(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      commercialName,
      category,
      categories,
      email,
      password,
      phone,
      street,
      number,
      neighborhood,
      complement,
      city,
      state,
      country,
      address,
      bio,
      paymentMethods
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM professionals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado no sistema' });
    }

    const currentPro = existing[0];
    const newEmail = email ? email.trim().toLowerCase() : currentPro.email;

    // Se alterou e-mail, verifica se não conflita com outro profissional
    if (newEmail !== currentPro.email) {
      const [emailCheck] = await pool.query('SELECT id FROM professionals WHERE email = ? AND id != ?', [newEmail, id]);
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: 'Este e-mail já está em uso por outro profissional.' });
      }
    }

    const finalCategory = Array.isArray(categories) && categories.length > 0
      ? categories.join(', ')
      : (category || currentPro.category);

    const formattedAddress = address || (street
      ? `Rua ${street}, ${number || 's/n'}${complement ? ` - ${complement}` : ''}, ${neighborhood || ''} - ${city || 'São Paulo'}, ${state || 'SP'} - ${country || 'Brasil'}`
      : currentPro.address);

    const paymentMethodsStr = Array.isArray(paymentMethods)
      ? paymentMethods.join(', ')
      : (paymentMethods || currentPro.payment_methods);

    // Se senha foi preenchida, atualiza hash da senha também
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE professionals SET 
           name = ?, commercial_name = ?, category = ?, email = ?, password = ?, phone = ?,
           street = ?, number = ?, neighborhood = ?, complement = ?, city = ?, state = ?, country = ?,
           address = ?, bio = ?, payment_methods = ?
         WHERE id = ?`,
        [
          name?.trim() || currentPro.name,
          commercialName?.trim() || currentPro.commercial_name,
          finalCategory,
          newEmail,
          hashedPassword,
          phone?.trim() || currentPro.phone,
          street ?? currentPro.street,
          number ?? currentPro.number,
          neighborhood ?? currentPro.neighborhood,
          complement ?? currentPro.complement,
          city || currentPro.city,
          state || currentPro.state,
          country || currentPro.country,
          formattedAddress,
          bio ?? currentPro.bio,
          paymentMethodsStr,
          id
        ]
      );
    } else {
      await pool.query(
        `UPDATE professionals SET 
           name = ?, commercial_name = ?, category = ?, email = ?, phone = ?,
           street = ?, number = ?, neighborhood = ?, complement = ?, city = ?, state = ?, country = ?,
           address = ?, bio = ?, payment_methods = ?
         WHERE id = ?`,
        [
          name?.trim() || currentPro.name,
          commercialName?.trim() || currentPro.commercial_name,
          finalCategory,
          newEmail,
          phone?.trim() || currentPro.phone,
          street ?? currentPro.street,
          number ?? currentPro.number,
          neighborhood ?? currentPro.neighborhood,
          complement ?? currentPro.complement,
          city || currentPro.city,
          state || currentPro.state,
          country || currentPro.country,
          formattedAddress,
          bio ?? currentPro.bio,
          paymentMethodsStr,
          id
        ]
      );
    }

    res.json({
      message: `Dados do profissional "${commercialName || currentPro.commercial_name}" atualizados com sucesso no MySQL!`,
      proId: id
    });
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados do profissional no banco de dados' });
  }
}

// Editar informações completas de um Cliente
export async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;

    const [existing] = await pool.query('SELECT * FROM clients WHERE id = ? OR email = ?', [id, id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado no sistema' });
    }

    const currentClient = existing[0];
    const newEmail = email ? email.trim().toLowerCase() : currentClient.email;

    // Se alterou e-mail, verifica se não conflita com outro cliente
    if (newEmail !== currentClient.email) {
      const [emailCheck] = await pool.query('SELECT id FROM clients WHERE email = ? AND id != ?', [newEmail, currentClient.id]);
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: 'Este e-mail já está em uso por outro cliente.' });
      }
    }

    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE clients SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?',
        [name?.trim() || currentClient.name, newEmail, phone?.trim() || currentClient.phone, hashedPassword, currentClient.id]
      );
    } else {
      await pool.query(
        'UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ?',
        [name?.trim() || currentClient.name, newEmail, phone?.trim() || currentClient.phone, currentClient.id]
      );
    }

    // Se mudou email, telefone ou nome, atualiza histórico em bookings para manter integridade
    await pool.query(
      'UPDATE bookings SET client_name = ?, client_email = ?, client_phone = ? WHERE client_email = ?',
      [name?.trim() || currentClient.name, newEmail, phone?.trim() || currentClient.phone, currentClient.email]
    );

    res.json({
      message: `Dados do cliente "${name || currentClient.name}" atualizados com sucesso no MySQL!`,
      clientId: currentClient.id
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados do cliente no banco de dados' });
  }
}

// Excluir profissional e todos os dados associados
export async function deleteProfessional(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT name, commercial_name FROM professionals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // ON DELETE CASCADE remove automaticamente serviços, horários e agendamentos
    await pool.query('DELETE FROM professionals WHERE id = ?', [id]);

    res.json({
      message: `Profissional "${existing[0].commercial_name}" excluído com sucesso do sistema.`
    });
  } catch (error) {
    console.error('Erro ao excluir profissional:', error);
    res.status(500).json({ error: 'Erro ao excluir profissional do banco de dados' });
  }
}

// Excluir histórico e cadastro de cliente
export async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    const { email, phone } = req.query;

    let targetEmail = email;
    let targetPhone = phone;

    if (id) {
      const [existing] = await pool.query('SELECT email, phone FROM clients WHERE id = ?', [id]);
      if (existing.length > 0) {
        targetEmail = existing[0].email;
        targetPhone = existing[0].phone;
      }
    }

    if (!id && !targetEmail && !targetPhone) {
      return res.status(400).json({ error: 'Informe o ID, e-mail ou telefone para excluir o cliente' });
    }

    // Remove da tabela clients e da tabela bookings
    if (id) {
      await pool.query('DELETE FROM clients WHERE id = ?', [id]);
    }
    if (targetEmail || targetPhone) {
      await pool.query(
        'DELETE FROM clients WHERE email = ? OR (phone = ? AND phone != "")',
        [targetEmail || '', targetPhone || '']
      );
      await pool.query(
        'DELETE FROM bookings WHERE client_email = ? OR (client_phone = ? AND client_phone != "")',
        [targetEmail || '', targetPhone || '']
      );
    }

    res.json({ message: 'Cadastro e histórico do cliente removidos com sucesso do banco de dados' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir dados do cliente no banco de dados' });
  }
}

// Atualizar formas de pagamento de um profissional
export async function updatePaymentMethods(req, res) {
  try {
    const { id } = req.params;
    const { paymentMethods } = req.body;

    const methodsStr = Array.isArray(paymentMethods)
      ? paymentMethods.join(', ')
      : (paymentMethods || 'Pix, Cartão de Crédito, Cartão de Débito, Dinheiro');

    await pool.query(
      'UPDATE professionals SET payment_methods = ? WHERE id = ?',
      [methodsStr, id]
    );

    res.json({
      message: 'Formas de pagamento atualizadas com sucesso!',
      proId: id,
      paymentMethods: methodsStr.split(',').map(m => m.trim())
    });
  } catch (error) {
    console.error('Erro ao atualizar formas de pagamento:', error);
    res.status(500).json({ error: 'Erro ao salvar formas de pagamento no banco de dados' });
  }
}

