import { Router } from 'express';
import { getProfessionals, getProfessionalById, updateAvatar, updateCover } from '../controllers/professionalsController.js';
import { addService, updateService, deleteService } from '../controllers/servicesController.js';
import { updateSchedule, addBlockedSlot, removeBlockedSlot } from '../controllers/scheduleController.js';
import { getBookingsByPro } from '../controllers/bookingsController.js';

const router = Router();

// Profissionais
router.get('/', getProfessionals);
router.get('/:id', getProfessionalById);
router.put('/:id/avatar', updateAvatar);
router.put('/:id/cover', updateCover);

// Serviços do Profissional
router.post('/:proId/services', addService);
router.put('/:proId/services/:serviceId', updateService);
router.delete('/:proId/services/:serviceId', deleteService);

// Horários & Bloqueios
router.put('/:proId/schedule', updateSchedule);
router.post('/:proId/blocked-slots', addBlockedSlot);
router.delete('/:proId/blocked-slots/:slotId', removeBlockedSlot);

// Agendamentos do Profissional
router.get('/:proId/bookings', getBookingsByPro);

export default router;
