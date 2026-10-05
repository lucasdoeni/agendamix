import { pool } from '../config/db.js';
import { runSeed } from './seed.js';

export async function initDatabase() {
  console.log('🔄 [DB Init] Verificando estrutura do banco de dados na nuvem...');
  let conn;

  try {
    conn = await pool.getConnection();

    // 1. Tabela de Profissionais
    await conn.query(`
      CREATE TABLE IF NOT EXISTS professionals (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        commercial_name VARCHAR(150) NOT NULL,
        category VARCHAR(255) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        street VARCHAR(150),
        number VARCHAR(20),
        neighborhood VARCHAR(100),
        complement VARCHAR(100),
        city VARCHAR(100) DEFAULT 'São Paulo',
        state VARCHAR(50) DEFAULT 'SP',
        country VARCHAR(50) DEFAULT 'Brasil',
        address VARCHAR(255) NOT NULL,
        avatar LONGTEXT,
        cover_image LONGTEXT,
        bio TEXT,
        rating DECIMAL(3,2) DEFAULT 5.00,
        review_count INT DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        payment_methods VARCHAR(500) DEFAULT 'Pix, Cartão de Crédito, Cartão de Débito, Dinheiro',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Tabela de Serviços
    await conn.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(50) PRIMARY KEY,
        professional_id VARCHAR(50) NOT NULL,
        name VARCHAR(150) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Tabela de Horários
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        professional_id VARCHAR(50) UNIQUE NOT NULL,
        days_of_week VARCHAR(50) DEFAULT '1,2,3,4,5,6',
        start_hour VARCHAR(10) DEFAULT '09:00',
        end_hour VARCHAR(10) DEFAULT '19:00',
        lunch_start VARCHAR(10) DEFAULT '12:00',
        lunch_end VARCHAR(10) DEFAULT '13:00',
        slot_interval INT DEFAULT 30,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Tabela de Bloqueios
    await conn.query(`
      CREATE TABLE IF NOT EXISTS blocked_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        professional_id VARCHAR(50) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(10) NOT NULL,
        reason VARCHAR(255) DEFAULT 'Indisponibilidade pessoal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Tabela de Agendamentos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        professional_id VARCHAR(50) NOT NULL,
        service_id VARCHAR(50) NOT NULL,
        client_name VARCHAR(150) NOT NULL,
        client_email VARCHAR(150) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(10) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        status ENUM('confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Tabela de Clientes
    await conn.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ [DB Init] Todas as 6 tabelas verificadas/criadas com sucesso!');

    // 7. Popula com os dados iniciais se necessário
    const [pros] = await conn.query('SELECT COUNT(*) as total FROM professionals');
    if (pros[0].total === 0) {
      console.log('🌱 [DB Init] Banco vazio detectado. Executando seed inicial automático...');
      conn.release();
      await runSeed();
    } else {
      console.log(`ℹ️ [DB Init] Banco já contém ${pros[0].total} profissionais cadastrados.`);
      conn.release();
    }

    return true;
  } catch (error) {
    if (conn) conn.release();
    console.error('❌ [DB Init] Erro durante a inicialização automática do banco:', error.message);
    return false;
  }
}
