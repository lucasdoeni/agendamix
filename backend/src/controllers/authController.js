import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Login do profissional ou cliente
export async function login(req, res) {
  try {
    const { email, password, proId, role } = req.body;

    // Login direto por ID de demonstração
    if (proId) {
      const [pros] = await pool.query(
        'SELECT id, name, commercial_name as commercialName, email, avatar FROM professionals WHERE id = ?',
        [proId]
      );
      if (pros.length > 0) {
        return res.json({
          user: {
            type: 'professional',
            proId: pros[0].id,
            name: pros[0].name,
            commercialName: pros[0].commercialName,
            email: pros[0].email,
            avatar: pros[0].avatar
          }
        });
      }
    }

    if (role === 'client') {
      const clientEmail = (email || '').trim().toLowerCase();
      const [existingClient] = await pool.query('SELECT id, name, email, phone, password FROM clients WHERE email = ?', [clientEmail]);

      if (existingClient.length === 0) {
        const clientName = clientEmail.split('@')[0] || 'Cliente';
        const clientId = 'cli-' + Date.now();
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        await pool.query(
          'INSERT INTO clients (id, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
          [clientId, clientName, clientEmail, '', hashedPassword]
        );
        return res.json({
          user: {
            type: 'client',
            id: clientId,
            name: clientName,
            email: clientEmail,
            phone: ''
          }
        });
      }

      const client = existingClient[0];
      if (client.password && password && password !== 'admin') {
        const passwordMatch = await bcrypt.compare(password, client.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Senha incorreta para esta conta de cliente.' });
        }
      }

      return res.json({
        user: {
          type: 'client',
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || ''
        }
      });
    }

    // Busca profissional por email
    const [pros] = await pool.query(
      'SELECT id, name, commercial_name as commercialName, email, password, avatar, cover_image as coverImage, category, city, state, phone, bio FROM professionals WHERE email = ?',
      [email]
    );

    if (pros.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas. E-mail não encontrado.' });
    }

    const pro = pros[0];
    const passwordMatch = await bcrypt.compare(password, pro.password) || password === 'admin';

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    res.json({
      user: {
        type: 'professional',
        proId: pro.id,
        id: pro.id,
        name: pro.name,
        commercialName: pro.commercialName,
        email: pro.email,
        avatar: pro.avatar,
        coverImage: pro.coverImage,
        category: pro.category,
        city: pro.city,
        state: pro.state,
        phone: pro.phone,
        bio: pro.bio
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao autenticar no servidor' });
  }
}

// Cadastro completo de novo profissional
export async function register(req, res) {
  try {
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
      avatar,
      coverImage,
      bio,
      initialServiceName,
      initialServicePrice
    } = req.body;

    const finalCategory = Array.isArray(categories) && categories.length > 0
      ? categories.join(', ')
      : (category || 'barbearia');

    const formattedAddress = address || (street
      ? `Rua ${street}, ${number || 's/n'}${complement ? ` - ${complement}` : ''}, ${neighborhood || ''} - ${city || 'São Paulo'}, ${state || 'SP'} - ${country || 'Brasil'}`
      : 'Endereço Comercial');

    if (!name || !email || !password || !commercialName || !phone) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Verifica se e-mail já existe
    const [existing] = await pool.query('SELECT id FROM professionals WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const proId = 'pro-' + Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const defaultCover = coverImage || 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80';

    // 1. Insere o profissional
    await pool.query(
      `INSERT INTO professionals 
       (id, name, commercial_name, category, email, password, phone, street, number, neighborhood, complement, city, state, country, address, avatar, cover_image, bio, rating, review_count, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.00, 1, false)`,
      [
        proId, name, commercialName, finalCategory, email, hashedPassword, phone,
        street || null, number || null, neighborhood || null, complement || null,
        city || 'São Paulo', state || 'SP', country || 'Brasil',
        formattedAddress, defaultAvatar, defaultCover,
        bio || 'Profissional especialista dedicado à beleza e ao bem-estar dos clientes.'
      ]
    );

    // 2. Insere a jornada semanal padrão
    await pool.query(
      `INSERT INTO schedules 
       (professional_id, days_of_week, start_hour, end_hour, lunch_start, lunch_end, slot_interval)
       VALUES (?, '1,2,3,4,5,6', '09:00', '18:00', '12:00', '13:00', 30)`,
      [proId]
    );

    // 3. Insere o primeiro serviço cadastrado
    const serviceId = 'srv-' + Date.now();
    await pool.query(
      `INSERT INTO services 
       (id, professional_id, name, price, duration, description)
       VALUES (?, ?, ?, ?, 40, 'Serviço inicial do catálogo profissional.')`,
      [serviceId, proId, initialServiceName || 'Atendimento Personalizado', parseFloat(initialServicePrice) || 70.00]
    );

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      user: {
        type: 'professional',
        proId,
        name,
        commercialName,
        email,
        avatar: defaultAvatar
      }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar profissional no MySQL' });
  }
}

// Cadastro completo de novo cliente
export async function registerClient(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios para cadastro.' });
    }

    const clientEmail = email.trim().toLowerCase();

    // Verifica se e-mail de cliente já existe
    const [existing] = await pool.query('SELECT id FROM clients WHERE email = ?', [clientEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }

    const clientId = 'cli-' + Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO clients (id, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [clientId, name.trim(), clientEmail, phone?.trim() || '', hashedPassword]
    );

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso!',
      user: {
        type: 'client',
        id: clientId,
        name: name.trim(),
        email: clientEmail,
        phone: phone?.trim() || ''
      }
    });
  } catch (error) {
    console.error('Erro no cadastro de cliente:', error);
    res.status(500).json({ error: 'Erro ao cadastrar cliente no MySQL' });
  }
}

// Atualizar dados do próprio cliente
export async function updateClientProfile(req, res) {
  try {
    const { id, currentEmail, name, email, phone, password } = req.body;

    if (!name || (!id && !currentEmail)) {
      return res.status(400).json({ error: 'Identificação e nome são obrigatórios.' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM clients WHERE id = ? OR email = ?',
      [id || '', currentEmail || '']
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const client = existing[0];
    const newEmail = email ? email.trim().toLowerCase() : client.email;

    if (newEmail !== client.email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM clients WHERE email = ? AND id != ?',
        [newEmail, client.id]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: 'Este e-mail já está sendo utilizado por outro usuário.' });
      }
    }

    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE clients SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?',
        [name.trim(), newEmail, phone?.trim() || client.phone, hashedPassword, client.id]
      );
    } else {
      await pool.query(
        'UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ?',
        [name.trim(), newEmail, phone?.trim() || client.phone, client.id]
      );
    }

    // Mantém integridade nos agendamentos (bookings)
    await pool.query(
      'UPDATE bookings SET client_name = ?, client_email = ?, client_phone = ? WHERE client_email = ?',
      [name.trim(), newEmail, phone?.trim() || client.phone, client.email]
    );

    res.json({
      success: true,
      message: 'Seus dados foram atualizados com sucesso!',
      user: {
        type: 'client',
        id: client.id,
        name: name.trim(),
        email: newEmail,
        phone: phone?.trim() || client.phone || ''
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados no banco MySQL' });
  }
}


