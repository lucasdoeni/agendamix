import { Router } from 'express';
import { 
  adminLogin, 
  getAllUsers, 
  createAdminUser,
  updateProfessional,
  updateClient,
  deleteProfessional, 
  deleteClient, 
  updatePaymentMethods 
} from '../controllers/adminController.js';

const router = Router();

// Login de Manutenção / Admin
router.post('/login', adminLogin);

// Gestão de Usuários (CRUD Completo)
router.get('/users', getAllUsers);
router.post('/users/create', createAdminUser);

// Profissionais
router.put('/professionals/:id', updateProfessional);
router.delete('/professionals/:id', deleteProfessional);

// Clientes
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);
router.delete('/clients', deleteClient);

// Formas de Pagamento por Profissional
router.put('/professionals/:id/payment-methods', updatePaymentMethods);

export default router;
