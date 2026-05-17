import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

const tripRooms = new Map();

export function initSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, avatarUrl: true } });
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    socket.join(`user:${user.id}`);

    socket.on('trip:join', async ({ tripId }) => {
      const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: user.id } } });
      if (!member) return socket.emit('error', { message: 'Access denied' });
      socket.join(`trip:${tripId}`);
      if (!tripRooms.has(tripId)) tripRooms.set(tripId, new Map());
      tripRooms.get(tripId).set(socket.id, { user });
      socket.to(`trip:${tripId}`).emit('trip:member_joined', { user });
    });

    socket.on('trip:leave', ({ tripId }) => {
      socket.leave(`trip:${tripId}`);
      tripRooms.get(tripId)?.delete(socket.id);
    });

    socket.on('cursor:move', ({ tripId, x, y }) => {
      socket.to(`trip:${tripId}`).emit('cursor:moved', { userId: user.id, name: user.name, x, y });
    });

    socket.on('comment:typing', ({ tripId }) => {
      socket.to(`trip:${tripId}`).emit('comment:user_typing', { userId: user.id, name: user.name });
    });

    socket.on('disconnect', () => {
      tripRooms.forEach((room, tripId) => {
        if (room.has(socket.id)) {
          room.delete(socket.id);
          io.to(`trip:${tripId}`).emit('trip:member_left', { userId: user.id });
        }
      });
    });
  });
}
