import { prisma } from '../config/db.js';

export async function getProfile(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, email: true, name: true, avatarUrl: true, bio: true, location: true, createdAt: true } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
}
export async function updateProfile(req, res) {
  const { name, bio, location } = req.body;
  res.json(await prisma.user.update({ where: { id: req.userId }, data: { ...(name && { name }), ...(bio !== undefined && { bio }), ...(location !== undefined && { location }) }, select: { id: true, email: true, name: true, avatarUrl: true, bio: true, location: true } }));
}
export async function getSaved(req, res) {
  const saved = await prisma.savedDestination.findMany({ where: { userId: req.userId }, include: { destination: true }, orderBy: { savedAt: 'desc' } });
  res.json(saved.map((s) => s.destination));
}
export async function saveDestination(req, res) {
  await prisma.savedDestination.upsert({ where: { userId_destinationId: { userId: req.userId, destinationId: req.params.destId } }, create: { userId: req.userId, destinationId: req.params.destId }, update: {} });
  res.json({ saved: true });
}
export async function unsaveDestination(req, res) {
  await prisma.savedDestination.delete({ where: { userId_destinationId: { userId: req.userId, destinationId: req.params.destId } } });
  res.json({ saved: false });
}
