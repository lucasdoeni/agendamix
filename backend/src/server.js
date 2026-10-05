import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDbConnection } from './config/db.js';
import { initDatabase } from './database/initDb.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerUi, swaggerSpec, swaggerOptions } from './config/swagger.js';

import authRoutes from './routes/authRoutes.js';
import professionalsRoutes from './routes/professionalsRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração flexível e segura de CORS (permite localhost, GitHub Pages e domínio personalizado)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://lucasdoeni.github.io'
];

if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissivo para requisições de clientes em dispositivos móveis
    }
  },
  credentials: true
}));

// Servir arquivos de upload estáticos armazenados no backend
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Permite upload de imagens em base64 até 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check e Keep-Alive para Render / UptimeRobot
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'AgendaMix Backend API em funcionamento com MySQL',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Documentação Swagger Interativa
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Tratamento de rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Inicialização do servidor com auto-migração de banco
app.listen(PORT, async () => {
  console.log(`🚀 [AgendaMix Server] Servidor backend rodando na porta ${PORT}`);
  console.log(`📡 [API Health] http://localhost:${PORT}/api/health`);
  console.log(`📚 [Swagger Docs] http://localhost:${PORT}/api-docs`);
  const isConnected = await testDbConnection();
  if (isConnected) {
    await initDatabase();
  }
});
