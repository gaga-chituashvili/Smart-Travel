import { prisma } from '../config/db.js';

export async function getBudgetSummary(req, res) {
  const { tripId } = req.params;
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { totalBudget: true, currency: true } });
  const expenses = await prisma.expense.findMany({ where: { tripId }, select: { amount: true, category: true } });
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
  res.json({ totalBudget: trip.totalBudget, totalSpent, remaining: trip.totalBudget - totalSpent, currency: trip.currency, byCategory, percentUsed: trip.totalBudget > 0 ? (totalSpent / trip.totalBudget) * 100 : 0 });
}
export async function getExpenses(req, res) {
  const expenses = await prisma.expense.findMany({ where: { tripId: req.params.tripId }, include: { paidBy: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { date: 'desc' } });
  res.json(expenses);
}
export async function addExpense(req, res) {
  const { tripId } = req.params;
  const { description, amount, currency, category, date, notes } = req.body;
  if (!description || !amount || !category) return res.status(400).json({ error: 'description, amount, category required' });
  const expense = await prisma.expense.create({ data: { tripId, paidById: req.userId, description, amount: parseFloat(amount), currency: currency || 'USD', category, date: date ? new Date(date) : new Date(), notes }, include: { paidBy: { select: { id: true, name: true, avatarUrl: true } } } });
  res.status(201).json(expense);
}
export async function updateExpense(req, res) {
  res.json(await prisma.expense.update({ where: { id: req.params.expId }, data: req.body }));
}
export async function deleteExpense(req, res) {
  await prisma.expense.delete({ where: { id: req.params.expId } });
  res.status(204).send();
}
