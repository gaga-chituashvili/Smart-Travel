import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import {
  generateTokens,
  setTokenCookies,
  verifyRefreshToken,
} from "../utils/jwt.js";

export async function register(req, res) {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res
      .status(400)
      .json({ error: "Email, name and password are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, avatarUrl: true },
  });

  const { accessToken, refreshToken } = generateTokens(user.id);
  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({ user, accessToken });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
  });
}

export function logout(_req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
}

export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const payload = verifyRefreshToken(token);
    const { accessToken, refreshToken } = generateTokens(payload.userId);
    setTokenCookies(res, accessToken, refreshToken);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
}

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      createdAt: true,
      _count: { select: { trips: true, savedDests: true } },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

export function googleCallback(req, res) {
  const user = req.user;
  const { accessToken, refreshToken } = generateTokens(user.id);
  setTokenCookies(res, accessToken, refreshToken);
  res.redirect(`${process.env.CLIENT_URL}/auth/success`);
}
