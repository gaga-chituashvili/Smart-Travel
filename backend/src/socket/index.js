import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

// tripId → Map<socketId, { user, cursor }>
const tripRooms = new Map();

function getOrCreateRoom(tripId) {
  if (!tripRooms.has(tripId)) tripRooms.set(tripId, new Map());
  return tripRooms.get(tripId);
}

export function initSocket(io) {
  // Auth middleware
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    if (!token) return next(new Error("Authentication required"));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, avatarUrl: true },
      });
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`🔌 Connected: ${user.name} (${socket.id})`);

    // Personal notification room
    socket.join(`user:${user.id}`);

    // ===== TRIP ROOM =====
    socket.on("trip:join", async ({ tripId }) => {
      const member = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: user.id } },
      });

      if (!member) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      socket.join(`trip:${tripId}`);

      const room = getOrCreateRoom(tripId);
      room.set(socket.id, { user });

      // Tell others
      socket.to(`trip:${tripId}`).emit("trip:member_joined", {
        user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
        socketId: socket.id,
      });

      // Send current online users to this socket
      const onlineUsers = Array.from(room.values());
      socket.emit("trip:online_users", onlineUsers);
    });

    socket.on("trip:leave", ({ tripId }) => {
      socket.leave(`trip:${tripId}`);
      const room = tripRooms.get(tripId);
      if (room) {
        room.delete(socket.id);
        socket.to(`trip:${tripId}`).emit("trip:member_left", {
          socketId: socket.id,
          userId: user.id,
        });
      }
    });

    // ===== CURSORS =====
    socket.on("cursor:move", ({ tripId, x, y }) => {
      const room = tripRooms.get(tripId);
      if (room?.has(socket.id)) {
        room.get(socket.id).cursor = { x, y };
      }
      socket.to(`trip:${tripId}`).emit("cursor:moved", {
        socketId: socket.id,
        userId: user.id,
        name: user.name,
        x,
        y,
      });
    });

    // ===== TYPING INDICATORS =====
    socket.on("comment:typing", ({ tripId }) => {
      socket.to(`trip:${tripId}`).emit("comment:user_typing", {
        userId: user.id,
        name: user.name,
      });
    });

    socket.on("activity:typing", ({ tripId, dayId }) => {
      socket.to(`trip:${tripId}`).emit("activity:user_typing", {
        userId: user.id,
        name: user.name,
        dayId,
      });
    });

    // ===== PING =====
    socket.on("ping", () => socket.emit("pong"));

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      console.log(`🔌 Disconnected: ${user.name}`);
      tripRooms.forEach((room, tripId) => {
        if (room.has(socket.id)) {
          room.delete(socket.id);
          io.to(`trip:${tripId}`).emit("trip:member_left", {
            socketId: socket.id,
            userId: user.id,
          });
        }
      });
    });
  });
}
