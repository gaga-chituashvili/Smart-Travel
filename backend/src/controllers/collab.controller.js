import { prisma } from '../config/db.js';
import { io } from '../index.js';

export async function getComments(req, res) {
  const comments = await prisma.comment.findMany({ where: { tripId: req.params.tripId }, include: { author: { select: { id: true, name: true, avatarUrl: true } }, reactions: true }, orderBy: { createdAt: 'asc' } });
  res.json(comments);
}
export async function postComment(req, res) {
  const { tripId } = req.params;
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Text required' });
  const comment = await prisma.comment.create({ data: { tripId, authorId: req.userId, text: text.trim() }, include: { author: { select: { id: true, name: true, avatarUrl: true } }, reactions: true } });
  io.to(`trip:${tripId}`).emit('comment:new', comment);
  res.status(201).json(comment);
}
export async function reactToComment(req, res) {
  const { tripId, commentId } = req.params;
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'Emoji required' });
  const existing = await prisma.reaction.findUnique({ where: { commentId_userId_emoji: { commentId, userId: req.userId, emoji } } });
  if (existing) { await prisma.reaction.delete({ where: { id: existing.id } }); }
  else { await prisma.reaction.create({ data: { commentId, userId: req.userId, emoji } }); }
  const reactions = await prisma.reaction.findMany({ where: { commentId } });
  io.to(`trip:${tripId}`).emit('comment:reacted', { commentId, reactions });
  res.json({ reactions });
}
export async function getMembers(req, res) {
  const members = await prisma.tripMember.findMany({ where: { tripId: req.params.tripId }, include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } } });
  res.json(members);
}
