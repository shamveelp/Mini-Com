import type { Request, Response, NextFunction } from 'express';
import logger from './logger.js';

const rates = new Map<string, { count: number, resetTime: number }>();

export const rateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const userRate = rates.get(ip);
    
    if (!userRate || now > userRate.resetTime) {
      rates.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    userRate.count++;
    
    if (userRate.count > limit) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRate.resetTime - now) / 1000)
      });
    }
    
    next();
  };
};
