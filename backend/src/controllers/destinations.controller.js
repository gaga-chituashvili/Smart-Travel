import { prisma } from '../config/db.js';

export async function getDestinations(req, res) {
  const { q, category } = req.query;
  const destinations = await prisma.destination.findMany({ where: { ...(q && { OR: [{ name: { contains: q, mode: 'insensitive' } }, { country: { contains: q, mode: 'insensitive' } }] }), ...(category && { category: { has: category } }) }, orderBy: { rating: 'desc' }, take: 50 });
  res.json(destinations);
}
export async function getTrending(req, res) {
  res.json(await prisma.destination.findMany({ where: { isTrending: true }, orderBy: { rating: 'desc' }, take: 12 }));
}
export async function getDestination(req, res) {
  const d = await prisma.destination.findUnique({ where: { id: req.params.id } });
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json(d);
}
