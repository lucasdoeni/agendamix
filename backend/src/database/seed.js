import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

const INITIAL_PROFESSIONALS = [
  {
    id: 'pro-1',
    name: 'Carlos Albuquerque',
    commercial_name: 'Barbearia Dom Carlos',
    category: 'barbearia',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    cover_image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    email: 'carlos@barbeariadomcarlos.com.br',
    password: 'admin',
    phone: '(11) 98765-4321',
    city: 'São Paulo, SP',
    address: 'Rua Augusta, 1420 - Consolação',
    rating: 4.90,
    review_count: 128,
    bio: 'Mais de 10 anos de experiência em cortes clássicos e modernos, barba com toalha quente e cuidados masculinos premium.',
    featured: true,
    schedule: {
      days_of_week: '1,2,3,4,5,6',
      start_hour: '09:00',
      end_hour: '19:00',
      lunch_start: '12:00',
      lunch_end: '13:00',
      slot_interval: 30
    },
    services: [
      { id: 'srv-101', name: 'Corte Tradicional Masculino', price: 65.0, duration: 40, description: 'Corte na tesoura ou máquina, lavagem refrescante e finalização com pomada.' },
      { id: 'srv-102', name: 'Barboterapia com Toalha Quente', price: 55.0, duration: 35, description: 'Design de barba navalhado, esfoliação facial, hidratação profunda e massagem.' },
      { id: 'srv-103', name: 'Combo Cabelo + Barba', price: 110.0, duration: 70, description: 'Cuidado completo para o visual. Inclui corte, barba completa e toalha quente.' },
      { id: 'srv-104', name: 'Camuflagem de Fios Brancos', price: 80.0, duration: 30, description: 'Tonalização sutil e natural que disfarça cabelos e pelos grisalhos.' }
    ]
  },
  {
    id: 'pro-2',
    name: 'Juliana Mendes',
    commercial_name: 'Juliana Mendes Hair Studio',
    category: 'cabeleireiro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    cover_image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    email: 'contato@julianamendes.com.br',
    password: 'admin',
    phone: '(11) 99123-8877',
    city: 'São Paulo, SP',
    address: 'Av. Brigadeiro Faria Lima, 2040 - Itaim Bibi',
    rating: 5.00,
    review_count: 94,
    bio: 'Colorista e visagista premiada internacionalmente. Especialista em mechas iluminadas, corte em camadas e tratamentos de alta performance.',
    featured: true,
    schedule: {
      days_of_week: '2,3,4,5,6',
      start_hour: '09:00',
      end_hour: '19:00',
      lunch_start: '13:00',
      lunch_end: '14:00',
      slot_interval: 30
    },
    services: [
      { id: 'srv-201', name: 'Corte Visagista Feminino + Escova', price: 180.0, duration: 60, description: 'Consultoria de corte alinhada ao formato de rosto, lavagem especial e escova modelada.' },
      { id: 'srv-202', name: 'Morena Iluminada / Mechas Suaves', price: 450.0, duration: 180, description: 'Técnica de clareamento sem marcas com tonalização personalizada.' },
      { id: 'srv-203', name: 'Nutrição Profunda & Reconstrução Molecular', price: 220.0, duration: 60, description: 'Tratamento intensivo para fios danificados.' }
    ]
  },
  {
    id: 'pro-3',
    name: 'Camila Rocha',
    commercial_name: 'Studio Camila Rocha Nails & Spa',
    category: 'manicure',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    cover_image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
    email: 'camila@rochanails.com',
    password: 'admin',
    phone: '(11) 97722-1144',
    city: 'São Paulo, SP',
    address: 'Alameda dos Arapanés, 890 - Moema',
    rating: 4.85,
    review_count: 76,
    bio: 'Especialista em blindagem de unhas de gel, manicure russa e nail art minimalista com produtos hipoalergênicos e estufa autoclave.',
    featured: true,
    schedule: {
      days_of_week: '1,2,3,4,5,6',
      start_hour: '08:30',
      end_hour: '18:00',
      lunch_start: '12:30',
      lunch_end: '13:30',
      slot_interval: 30
    },
    services: [
      { id: 'srv-301', name: 'Manicure & Pedicure Completa', price: 85.0, duration: 60, description: 'Cutilagem delicada, esfoliação suave e hidratação profunda.' },
      { id: 'srv-302', name: 'Alongamento em Fibra de Vidro', price: 190.0, duration: 120, description: 'Unhas naturais, finas e resistentes sob medida.' },
      { id: 'srv-303', name: 'Spa dos Pés com Plástica Podal', price: 110.0, duration: 50, description: 'Remoção de calosidades, imersão em óleos e massagem.' }
    ]
  },
  {
    id: 'pro-4',
    name: 'Dra. Beatriz Fontana',
    commercial_name: 'Beatriz Fontana Estética Avançada',
    category: 'estetica',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    cover_image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    email: 'contato@beatrizfontana.com.br',
    password: 'admin',
    phone: '(11) 98833-2211',
    city: 'São Paulo, SP',
    address: 'Rua Bela Cintra, 1870 - Jardins',
    rating: 4.95,
    review_count: 110,
    bio: 'Fisioterapeuta dermatofuncional dedicada a protocolos faciais de rejuvenescimento e drenagem linfática.',
    featured: true,
    schedule: {
      days_of_week: '1,2,3,4,5',
      start_hour: '09:00',
      end_hour: '18:00',
      lunch_start: '12:00',
      lunch_end: '13:00',
      slot_interval: 30
    },
    services: [
      { id: 'srv-401', name: 'Limpeza de Pele Profunda com Fototerapia', price: 180.0, duration: 75, description: 'Extração segura de cravos, peeling de diamante e LED.' },
      { id: 'srv-402', name: 'Drenagem Linfática Corporal', price: 150.0, duration: 60, description: 'Técnica manual estimulante para eliminação de toxinas e inchaço.' },
      { id: 'srv-403', name: 'Peeling Químico Renovador', price: 210.0, duration: 50, description: 'Ácidos seguros para clareamento de manchas solares.' }
    ]
  },
  {
    id: 'pro-5',
    name: 'Larissa Becker',
    commercial_name: 'Larissa Becker Brow & Lash Design',
    category: 'sobrancelhas',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    cover_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    email: 'larissa@beckerbrows.com',
    password: 'admin',
    phone: '(11) 96544-7788',
    city: 'São Paulo, SP',
    address: 'Rua Oscar Freire, 620 - Cerqueira César',
    rating: 4.92,
    review_count: 88,
    bio: 'Especialista em visagismo de olhar, micropigmentação shadow line, Brow Lamination e Lash Lifting.',
    featured: true,
    schedule: {
      days_of_week: '2,3,4,5,6',
      start_hour: '10:00',
      end_hour: '19:00',
      lunch_start: '13:00',
      lunch_end: '14:00',
      slot_interval: 30
    },
    services: [
      { id: 'srv-501', name: 'Design Personalizado com Henna Premium', price: 75.0, duration: 45, description: 'Mapeamento facial simétrico, pinça e tintura natural.' },
      { id: 'srv-502', name: 'Brow Lamination + Hidratação Botox', price: 160.0, duration: 60, description: 'Alinhamento dos fios rebeldes na direção ideal.' },
      { id: 'srv-503', name: 'Lash Lifting com Coloração', price: 150.0, duration: 60, description: 'Curvatura duradoura dos cílios naturais por até 8 semanas.' }
    ]
  }
];

export async function runSeed() {
  console.log('🌱 [Seed] Iniciando população do banco de dados MySQL...');
  const conn = await pool.getConnection();

  try {
    for (const pro of INITIAL_PROFESSIONALS) {
      // Verifica se o profissional já existe
      const [existing] = await conn.query('SELECT id FROM professionals WHERE id = ? OR email = ?', [pro.id, pro.email]);

      const hashedPassword = await bcrypt.hash(pro.password, 10);

      if (existing.length === 0) {
        await conn.query(
          `INSERT INTO professionals (id, name, commercial_name, category, email, password, phone, city, address, avatar, cover_image, bio, rating, review_count, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pro.id, pro.name, pro.commercial_name, pro.category, pro.email,
            hashedPassword, pro.phone, pro.city, pro.address, pro.avatar,
            pro.cover_image, pro.bio, pro.rating, pro.review_count, pro.featured
          ]
        );
        console.log(`✅ Profissional inserido: ${pro.commercial_name}`);
      }

      // Horários (Schedule)
      const [existingSchedule] = await conn.query('SELECT id FROM schedules WHERE professional_id = ?', [pro.id]);
      if (existingSchedule.length === 0) {
        await conn.query(
          `INSERT INTO schedules (professional_id, days_of_week, start_hour, end_hour, lunch_start, lunch_end, slot_interval)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            pro.id, pro.schedule.days_of_week, pro.schedule.start_hour,
            pro.schedule.end_hour, pro.schedule.lunch_start, pro.schedule.lunch_end,
            pro.schedule.slot_interval
          ]
        );
      }

      // Serviços
      for (const srv of pro.services) {
        const [existingSrv] = await conn.query('SELECT id FROM services WHERE id = ?', [srv.id]);
        if (existingSrv.length === 0) {
          await conn.query(
            `INSERT INTO services (id, professional_id, name, price, duration, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [srv.id, pro.id, srv.name, srv.price, srv.duration, srv.description]
          );
        }
      }
    }

    // Inserir agendamentos de exemplo se tabela estiver vazia
    const [existingBookings] = await conn.query('SELECT id FROM bookings LIMIT 1');
    if (existingBookings.length === 0) {
      await conn.query(
        `INSERT INTO bookings (id, professional_id, service_id, client_name, client_email, client_phone, date, time, price, duration, status)
         VALUES 
         ('bkg-1001', 'pro-1', 'srv-101', 'Rodrigo Silva', 'rodrigo.silva@exemplo.com', '(11) 98111-2233', '2026-10-06', '10:00', 65.00, 40, 'confirmed'),
         ('bkg-1002', 'pro-1', 'srv-103', 'Fernando Costa', 'fernando.costa@exemplo.com', '(11) 99888-7766', '2026-10-06', '14:00', 110.00, 70, 'confirmed'),
         ('bkg-1003', 'pro-2', 'srv-201', 'Mariana Duarte', 'mariana.duarte@exemplo.com', '(11) 97654-3210', '2026-10-07', '11:00', 180.00, 60, 'confirmed')`
      );
      console.log('✅ Agendamentos iniciais inseridos com sucesso!');
    }

    console.log('🎉 [Seed] População concluída com sucesso!');
  } catch (error) {
    console.error('❌ [Seed] Erro ao popular banco de dados:', error);
  } finally {
    conn.release();
  }
}

// Executa se chamado diretamente via node
if (process.argv[1]?.includes('seed.js')) {
  runSeed().then(() => process.exit(0));
}
