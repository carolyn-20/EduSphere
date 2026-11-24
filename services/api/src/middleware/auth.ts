import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export type Role = 'learner'|'instructor'|'author'|'assessor'|'admin';
declare global { namespace Express { interface Request { user?: { id:string; role:Role } } } }
export function authenticate(req:Request,res:Response,next:NextFunction) {
 const token=req.headers.authorization?.replace(/^Bearer\s+/i,'');
 if(!token) return res.status(401).json({error:'Authentication required'});
 try { req.user=jwt.verify(token,process.env.JWT_SECRET || 'local-development-secret-change-me') as any; next(); }
 catch { return res.status(401).json({error:'Invalid or expired token'}); }
}
export const allow = (...roles:Role[]) => (req:Request,res:Response,next:NextFunction) =>
 req.user && roles.includes(req.user.role) ? next() : res.status(403).json({error:'Insufficient permissions'});
