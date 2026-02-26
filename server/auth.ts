import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AppRole = 'candidate' | 'employer' | 'super_admin';

export interface AuthContext {
  userId: string;
  role: AppRole;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

const allowedRoles: AppRole[] = ['candidate', 'employer', 'super_admin'];
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function normalizeRole(input: string | undefined): AppRole | null {
  if (!input) return null;

  const role = input.toLowerCase();
  if (role === 'seeker') return 'candidate';
  if (allowedRoles.includes(role as AppRole)) return role as AppRole;

  return null;
}

interface JwtPayload {
  sub: string;
  role: AppRole;
  email?: string;
}

export function signAuthToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function parseBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const bearer = parseBearerToken(req.header('authorization'));
    if (!bearer) {
      res.status(401).json({ error: 'Unauthorized', details: 'Missing Bearer token.' });
      return;
    }

    const decoded = jwt.verify(bearer, JWT_SECRET) as jwt.JwtPayload;
    const userId = String(decoded.sub || '').trim();
    const role = normalizeRole(String(decoded.role || '').trim());
    const email = decoded.email ? String(decoded.email) : undefined;

    if (!userId || !role) {
      res.status(401).json({ error: 'Unauthorized', details: 'Invalid auth token.' });
      return;
    }

    req.auth = { userId, role, email };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', details: 'Token expired or invalid.' });
  }
}

export function requireRole(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}
