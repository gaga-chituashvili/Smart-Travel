import { Router } from 'express';
import { getDestinations, getTrending, getDestination } from '../controllers/destinations.controller.js';

const router = Router();
router.get('/', getDestinations);
router.get('/trending', getTrending);
router.get('/:id', getDestination);
export default router;
