import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getProfile, updateProfile, getSaved, saveDestination, unsaveDestination } from '../controllers/users.controller.js';

const router = Router();
router.use(authenticateToken);
router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.get('/me/saved', getSaved);
router.post('/me/saved/:destId', saveDestination);
router.delete('/me/saved/:destId', unsaveDestination);
export default router;
