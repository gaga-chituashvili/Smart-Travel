import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getBudgetSummary, getExpenses, addExpense, updateExpense, deleteExpense } from '../controllers/budget.controller.js';

const router = Router({ mergeParams: true });
router.use(authenticateToken);
router.get('/summary', getBudgetSummary);
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);
router.patch('/expenses/:expId', updateExpense);
router.delete('/expenses/:expId', deleteExpense);
export default router;
