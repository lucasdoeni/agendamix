import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agendamix_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa conexão inicial com log informativo
export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [MySQL] Conexão com o banco de dados "agendamix_db" estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [MySQL] Erro ao conectar ao banco de dados:', error.message);
    return false;
  }
}
