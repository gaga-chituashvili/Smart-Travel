import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import { prisma } from "./config/db.js";
import { redisClient } from "./config/redis.js";
import { initSocket } from "./socket/index.js";
import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trips.js";
import destinationRoutes from "./routes/destinations.js";
import userRoutes from "./routes/users.js";
import budgetRoutes from "./routes/budget.js";
import collabRoutes from "./routes/collab.js";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

initSocket(io);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api", limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trips/:tripId/budget", budgetRoutes);
app.use("/api/trips/:tripId/collab", collabRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await prisma.$connect();
  await redisClient.connect();
  httpServer.listen(PORT, () => {
    console.log(`🚀 StayBook API running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  await redisClient.disconnect();
  process.exit(0);
});
