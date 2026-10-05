import { Router } from 'express';
import { login, register, registerClient, updateClientProfile } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/register-client', registerClient);
router.put('/client-profile', updateClientProfile);

export default router;
