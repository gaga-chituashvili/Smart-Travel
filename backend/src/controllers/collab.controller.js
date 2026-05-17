import { prisma } from "../config/db.js";
import { io } from "../index.js";

export async function getComments(req, res) {
  const { tripId } = req.params;

  const comments = await prisma.comment.findMany({
    where: { tripId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      reactions: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(comments);
}

export async function postComment(req, res) {
  const { tripId } = req.params;
  const { text } = req.body;

  if (!text?.trim())
    return res.status(400).json({ error: "Comment text is required" });

  const comment = await prisma.comment.create({
    data: { tripId, authorId: req.userId, text: text.trim() },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      reactions: true,
    },
  });

  // Broadcast to all trip members
  io.to(`trip:${tripId}`).emit("comment:new", comment);

  // Notify other members
  const members = await prisma.tripMember.findMany({
    where: { tripId, userId: { not: req.userId } },
    select: { userId: true },
  });

  for (const { userId } of members) {
    io.to(`user:${userId}`).emit("notification:new", {
      type: "COMMENT",
      message: "New comment on your trip",
      tripId,
    });
  }

  res.status(201).json(comment);
}

export async function reactToComment(req, res) {
  const { tripId, commentId } = req.params;
  const { emoji } = req.body;

  if (!emoji) return res.status(400).json({ error: "Emoji is required" });

  // Toggle reaction
  const existing = await prisma.reaction.findUnique({
    where: { commentId_userId_emoji: { commentId, userId: req.userId, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({
      data: { commentId, userId: req.userId, emoji },
    });
  }

  const reactions = await prisma.reaction.findMany({
    where: { commentId },
    include: { user: { select: { id: true, name: true } } },
  });

  io.to(`trip:${tripId}`).emit("comment:reacted", { commentId, reactions });
  res.json({ reactions });
}

export async function getMembers(req, res) {
  const { tripId } = req.params;

  const members = await prisma.tripMember.findMany({
    where: { tripId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, email: true } },
    },
  });

  res.json(members);
}

export async function removeMember(req, res) {
  const { tripId, userId } = req.params;

  // Can't remove owner
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (trip.ownerId === userId) {
    return res.status(400).json({ error: "Cannot remove trip owner" });
  }

  await prisma.tripMember.delete({
    where: { tripId_userId: { tripId, userId } },
  });

  io.to(`trip:${tripId}`).emit("trip:member_removed", { userId });
  res.status(204).send();
}
