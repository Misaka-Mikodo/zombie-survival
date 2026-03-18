// JWT认证模块
import jwt from 'jsonwebtoken';
import { User } from '../db/entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'zombie-game-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  username: string;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// JWT中间件
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Token无效或已过期' });
  }
  
  req.user = payload;
  next();
}
