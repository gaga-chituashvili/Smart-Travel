import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    req.userId = verifyAccessToken(token).userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
export function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;
  if (token) { try { req.userId = verifyAccessToken(token).userId; } catch {} }
  next();
}
export function requireTripAccess(roles = ['OWNER', 'EDITOR', 'MEMBER']) {
  return async (req, res, next) => {
    const tripId = req.params.tripId || req.params.id;
    const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId: req.userId } } });
    if (!member) return res.status(403).json({ error: 'Access denied' });
    if (!roles.includes(member.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    req.tripMember = member;
    next();
  };
}
