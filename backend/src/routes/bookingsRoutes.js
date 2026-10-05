import { Router } from 'express';
import { createBooking, getBookingsByClient, updateBookingStatus } from '../controllers/bookingsController.js';

const router = Router();

router.post('/', createBooking);
router.get('/client', getBookingsByClient);
router.patch('/:id/status', updateBookingStatus);

export default router;
