import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

function getPoolConfig() {
  // 1. Suporte a connection string direta (ex: TiDB Serverless ou Aiven)
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      return {
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, '') || 'agendamix_db',
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      };
    } catch (err) {
      console.warn('⚠️ [MySQL] Falha ao processar DATABASE_URL, usando variáveis individuais:', err.message);
    }
  }

  // 2. Detecção automática de host em nuvem (TiDB, Aiven, etc.) para habilitar SSL nativo
  const isCloudHost = Boolean(
    (process.env.DB_HOST && (
      process.env.DB_HOST.includes('tidbcloud.com') ||
      process.env.DB_HOST.includes('aivencloud.com') ||
      process.env.DB_HOST.includes('render.com') ||
      process.env.DB_HOST.includes('amazonaws.com')
    )) ||
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1'
  );

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || (isCloudHost && process.env.DB_HOST?.includes('tidbcloud.com') ? 4000 : 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agendamix_db',
    ssl: isCloudHost ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

export const pool = mysql.createPool(getPoolConfig());

// Testa conexão inicial com log informativo
export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ [MySQL] Conexão com o banco de dados "${process.env.DB_NAME || 'agendamix_db'}" estabelecida com sucesso!`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [MySQL] Erro ao conectar ao banco de dados:', error.message);
    return false;
  }
}
