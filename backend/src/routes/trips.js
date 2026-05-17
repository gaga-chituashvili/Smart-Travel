import { Router } from 'express';
import { authenticateToken, requireTripAccess } from '../middleware/auth.js';
import { getTrips, getTrip, createTrip, updateTrip, deleteTrip, addDay, addActivity, updateActivity, deleteActivity, reorderActivities } from '../controllers/trips.controller.js';

const router = Router();
router.use(authenticateToken);
router.get('/', getTrips);
router.post('/', createTrip);
router.get('/:id', getTrip);
router.patch('/:id', requireTripAccess(['OWNER', 'EDITOR']), updateTrip);
router.delete('/:id', requireTripAccess(['OWNER']), deleteTrip);
router.post('/:tripId/days', requireTripAccess(['OWNER', 'EDITOR']), addDay);
router.post('/:tripId/days/:dayId/activities', requireTripAccess(['OWNER', 'EDITOR']), addActivity);
router.patch('/:tripId/days/:dayId/activities/:actId', requireTripAccess(['OWNER', 'EDITOR']), updateActivity);
router.delete('/:tripId/days/:dayId/activities/:actId', requireTripAccess(['OWNER', 'EDITOR']), deleteActivity);
router.post('/:tripId/days/:dayId/reorder', requireTripAccess(['OWNER', 'EDITOR']), reorderActivities);
export default router;
