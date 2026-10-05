import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

dotenv.config({ path: path.join(rootDir, 'backend/.env') });

import { pool } from '../config/db.js';

async function syncDump() {
  console.log('🔄 [Sync-Dump] Conectando ao MySQL agendamix_db para extrair todos os dados...');
  const conn = await pool.getConnection();

  try {
    // 1. Extrair Profissionais
    const [pros] = await conn.query('SELECT * FROM professionals ORDER BY created_at ASC');
    const professionals = [];

    for (const pro of pros) {
      // Serviços
      const [services] = await conn.query('SELECT * FROM services WHERE professional_id = ?', [pro.id]);
      
      // Horários
      const [schedules] = await conn.query('SELECT * FROM schedules WHERE professional_id = ?', [pro.id]);
      const sched = schedules[0] || {};
      
      // Bloqueios
      const [blocked] = await conn.query('SELECT * FROM blocked_slots WHERE professional_id = ?', [pro.id]);

      professionals.push({
        id: pro.id,
        name: pro.name,
        commercialName: pro.commercial_name,
        category: pro.category,
        categories: pro.category ? pro.category.split(',').map(c => c.trim()) : [],
        email: pro.email,
        password: pro.password || 'admin',
        phone: pro.phone,
        street: pro.street || '',
        number: pro.number || '',
        neighborhood: pro.neighborhood || '',
        complement: pro.complement || '',
        city: pro.city || 'São Paulo, SP',
        state: pro.state || 'SP',
        country: pro.country || 'Brasil',
        address: pro.address || '',
        avatar: pro.avatar,
        coverImage: pro.cover_image,
        bio: pro.bio || '',
        rating: Number(pro.rating) || 5.0,
        reviewCount: Number(pro.review_count) || 1,
        featured: Boolean(pro.featured),
        paymentMethods: pro.payment_methods ? pro.payment_methods.split(',').map(m => m.trim()) : ['Pix', 'Cartão de Crédito', 'Dinheiro'],
        schedule: {
          daysOfWeek: sched.days_of_week ? sched.days_of_week.split(',').map(Number) : [1, 2, 3, 4, 5, 6],
          startHour: (sched.start_hour || '09:00:00').slice(0, 5),
          endHour: (sched.end_hour || '19:00:00').slice(0, 5),
          lunchStart: (sched.lunch_start || '12:00:00').slice(0, 5),
          lunchEnd: (sched.lunch_end || '13:00:00').slice(0, 5),
          slotInterval: Number(sched.slot_interval) || 30
        },
        blockedSlots: blocked.map(b => ({
          id: b.id,
          date: typeof b.date === 'string' ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10),
          time: (b.time || '').slice(0, 5),
          reason: b.reason || ''
        })),
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          duration: Number(s.duration),
          description: s.description || ''
        }))
      });
    }

    // 2. Extrair Clientes
    const [clientsRows] = await conn.query('SELECT * FROM clients ORDER BY created_at ASC');
    const clients = clientsRows.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      password: c.password ? '123456' : '123456' // senha padrão de demonstração / fallback
    }));

    // 3. Extrair Agendamentos
    const [bookingsRows] = await conn.query('SELECT * FROM bookings ORDER BY created_at DESC');
    const bookings = bookingsRows.map(b => {
      const pro = professionals.find(p => p.id === b.professional_id);
      const srv = pro?.services.find(s => s.id === b.service_id);
      return {
        id: b.id,
        proId: b.professional_id,
        proName: pro?.name || 'Profissional',
        commercialName: pro?.commercialName || pro?.name || 'Estabelecimento',
        serviceId: b.service_id,
        serviceName: srv?.name || 'Serviço Agendado',
        clientName: b.client_name,
        clientEmail: b.client_email,
        clientPhone: b.client_phone,
        date: typeof b.date === 'string' ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10),
        time: (b.time || '').slice(0, 5),
        price: Number(b.price),
        duration: Number(b.duration),
        status: b.status || 'confirmed',
        createdAt: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString()
      };
    });

    console.log(`✅ Dados recuperados do MySQL: ${professionals.length} profissionais, ${clients.length} clientes, ${bookings.length} agendamentos.`);

    // 4. Salvar api-dump.json em public/data
    const dumpData = {
      exportedAt: new Date().toISOString(),
      professionals,
      clients,
      bookings
    };

    const publicDumpPath = path.join(rootDir, 'frontend/public/data/api-dump.json');
    fs.mkdirSync(path.dirname(publicDumpPath), { recursive: true });
    fs.writeFileSync(publicDumpPath, JSON.stringify(dumpData, null, 2), 'utf-8');
    console.log(`  ✓ Dump salvo em: ${publicDumpPath}`);

    const distDumpPath = path.join(rootDir, 'frontend/dist/data/api-dump.json');
    if (fs.existsSync(path.join(rootDir, 'frontend/dist'))) {
      fs.mkdirSync(path.dirname(distDumpPath), { recursive: true });
      fs.writeFileSync(distDumpPath, JSON.stringify(dumpData, null, 2), 'utf-8');
      console.log(`  ✓ Dump salvo em: ${distDumpPath}`);
    }

    // 5. Atualizar frontend/src/data/mockData.js
    const mockDataContent = `// Dados de demonstração e fallback para a plataforma AgendaMix
// Sincronizado automaticamente com o banco MySQL agendamix_db em ${new Date().toLocaleString('pt-BR')}

export const CATEGORIES = [
  { id: 'barbearia', label: 'Barbearia', icon: 'Scissors', count: 12 },
  { id: 'cabeleireiro', label: 'Cabeleireiro', icon: 'Sparkles', count: 18 },
  { id: 'manicure', label: 'Manicure & Pedicure', icon: 'Hand', count: 15 },
  { id: 'estetica', label: 'Estética Facial & Corporal', icon: 'Heart', count: 9 },
  { id: 'sobrancelhas', label: 'Design de Sobrancelhas', icon: 'Eye', count: 14 }
];

export const INITIAL_PROFESSIONALS = ${JSON.stringify(professionals, null, 2)};

export const INITIAL_CLIENTS = ${JSON.stringify(clients, null, 2)};

export const INITIAL_BOOKINGS = ${JSON.stringify(bookings, null, 2)};
`;

    const mockDataPath = path.join(rootDir, 'frontend/src/data/mockData.js');
    fs.writeFileSync(mockDataPath, mockDataContent, 'utf-8');
    console.log(`  ✓ mockData.js atualizado em: ${mockDataPath}`);

    console.log('🎉 [Sync-Dump] Sincronização concluída com sucesso!');
  } finally {
    conn.release();
  }
}

syncDump().then(() => process.exit(0)).catch(err => {
  console.error('❌ Erro na sincronização:', err);
  process.exit(1);
});
