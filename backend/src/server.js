import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDbConnection } from './config/db.js';

import path from 'path';
import { fileURLToPath } from 'url';

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

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Servir arquivos de upload estáticos armazenados no backend
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Permite upload de imagens em base64 até 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'AgendaMix Backend API em funcionamento com MySQL',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Tratamento de rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Inicialização do servidor
app.listen(PORT, async () => {
  console.log(`🚀 [AgendaMix Server] Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`📡 [API Health] http://localhost:${PORT}/api/health`);
  await testDbConnection();
});
