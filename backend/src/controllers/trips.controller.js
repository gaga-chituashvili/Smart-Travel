import { prisma } from "../config/db.js";
import { io } from "../index.js";

export async function getTrips(req, res) {
  const trips = await prisma.trip.findMany({
    where: { members: { some: { userId: req.userId } } },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      destinations: {
        include: { destination: { select: { name: true, country: true } } },
        take: 1,
      },
      _count: { select: { days: true, expenses: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json(trips);
}

export async function getTrip(req, res) {
  const { id } = req.params;

  const trip = await prisma.trip.findFirst({
    where: {
      id,
      OR: [{ members: { some: { userId: req.userId } } }, { isPublic: true }],
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      days: {
        orderBy: { dayNumber: "asc" },
        include: { activities: { orderBy: { order: "asc" } } },
      },
      destinations: { include: { destination: true } },
    },
  });

  if (!trip) return res.status(404).json({ error: "Trip not found" });
  res.json(trip);
}

export async function createTrip(req, res) {
  const {
    name,
    description,
    startDate,
    endDate,
    totalBudget,
    currency,
    destinationIds,
  } = req.body;

  if (!name) return res.status(400).json({ error: "Trip name is required" });

  const trip = await prisma.$transaction(async (tx) => {
    const newTrip = await tx.trip.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalBudget: totalBudget || 0,
        currency: currency || "USD",
        ownerId: req.userId,
      },
    });

    await tx.tripMember.create({
      data: { tripId: newTrip.id, userId: req.userId, role: "OWNER" },
    });

    if (destinationIds?.length) {
      await tx.tripDestination.createMany({
        data: destinationIds.map((destId, i) => ({
          tripId: newTrip.id,
          destinationId: destId,
          order: i,
        })),
      });
    }

    return newTrip;
  });

  res.status(201).json(trip);
}

export async function updateTrip(req, res) {
  const { id } = req.params;
  const {
    name,
    description,
    startDate,
    endDate,
    totalBudget,
    status,
    isPublic,
  } = req.body;

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(totalBudget !== undefined && { totalBudget }),
      ...(status && { status }),
      ...(isPublic !== undefined && { isPublic }),
    },
  });

  io.to(`trip:${id}`).emit("trip:updated", trip);
  res.json(trip);
}

export async function deleteTrip(req, res) {
  await prisma.trip.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function inviteMember(req, res) {
  const { id: tripId } = req.params;
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const isMember = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: existingUser.id } },
    });
    if (isMember)
      return res.status(409).json({ error: "User is already a member" });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await prisma.tripInvite.create({
    data: { tripId, senderId: req.userId, email, expiresAt },
  });

  if (existingUser) {
    await prisma.notification.create({
      data: {
        userId: existingUser.id,
        type: "TRIP_INVITE",
        title: "Trip invitation",
        message: `You've been invited to join "${trip.name}"`,
        data: { tripId, inviteToken: invite.token },
      },
    });
    io.to(`user:${existingUser.id}`).emit("notification:new", {
      type: "TRIP_INVITE",
      tripId,
    });
  }

  res.json({ message: "Invitation sent", inviteId: invite.id });
}

export async function joinTrip(req, res) {
  const { token } = req.params;

  const invite = await prisma.tripInvite.findUnique({
    where: { token },
    include: { trip: true },
  });

  if (!invite) return res.status(404).json({ error: "Invalid invite" });
  if (invite.used)
    return res.status(400).json({ error: "Invite already used" });
  if (invite.expiresAt < new Date())
    return res.status(400).json({ error: "Invite expired" });

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (invite.email !== user.email) {
    return res
      .status(403)
      .json({ error: "This invite is for a different email" });
  }

  await prisma.$transaction([
    prisma.tripMember.create({
      data: { tripId: invite.tripId, userId: req.userId, role: "MEMBER" },
    }),
    prisma.tripInvite.update({ where: { token }, data: { used: true } }),
  ]);

  io.to(`trip:${invite.tripId}`).emit("trip:member_joined", {
    user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
  });

  res.json({ tripId: invite.tripId, message: "Joined trip successfully" });
}

// ===== ITINERARY =====

export async function addDay(req, res) {
  const { tripId } = req.params;
  const { date, title, notes } = req.body;

  const lastDay = await prisma.tripDay.findFirst({
    where: { tripId },
    orderBy: { dayNumber: "desc" },
  });

  const day = await prisma.tripDay.create({
    data: {
      tripId,
      dayNumber: (lastDay?.dayNumber || 0) + 1,
      date: date ? new Date(date) : undefined,
      title,
      notes,
    },
    include: { activities: true },
  });

  io.to(`trip:${tripId}`).emit("day:added", day);
  res.status(201).json(day);
}

export async function addActivity(req, res) {
  const { tripId, dayId } = req.params;
  const {
    name,
    type,
    startTime,
    endTime,
    cost,
    notes,
    lat,
    lng,
    address,
    imageUrl,
    bookingUrl,
  } = req.body;

  if (!name)
    return res.status(400).json({ error: "Activity name is required" });

  const lastActivity = await prisma.activity.findFirst({
    where: { dayId },
    orderBy: { order: "desc" },
  });

  const activity = await prisma.activity.create({
    data: {
      dayId,
      name,
      type: type || "SIGHT",
      startTime,
      endTime,
      cost: cost || 0,
      notes,
      lat,
      lng,
      address,
      imageUrl,
      bookingUrl,
      order: (lastActivity?.order || 0) + 1,
    },
  });

  io.to(`trip:${tripId}`).emit("activity:created", { dayId, activity });
  res.status(201).json(activity);
}

export async function updateActivity(req, res) {
  const { tripId, actId } = req.params;

  const activity = await prisma.activity.update({
    where: { id: actId },
    data: req.body,
  });

  io.to(`trip:${tripId}`).emit("activity:updated", activity);
  res.json(activity);
}

export async function deleteActivity(req, res) {
  const { tripId, actId } = req.params;

  await prisma.activity.delete({ where: { id: actId } });
  io.to(`trip:${tripId}`).emit("activity:deleted", { id: actId });
  res.status(204).send();
}

export async function reorderActivities(req, res) {
  const { tripId, dayId } = req.params;
  const { orderedIds } = req.body;

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.activity.update({ where: { id }, data: { order: index } }),
    ),
  );

  io.to(`trip:${tripId}`).emit("activity:reordered", { dayId, orderedIds });
  res.json({ success: true });
}
