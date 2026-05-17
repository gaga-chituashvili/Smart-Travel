import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getComments, postComment, reactToComment, getMembers } from '../controllers/collab.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticateToken);
router.get('/comments', getComments);
router.post('/comments', postComment);
router.post('/comments/:commentId/react', reactToComment);
router.get('/members', getMembers);
export default router;
