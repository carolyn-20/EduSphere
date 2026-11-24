import { Router } from 'express'; import { pool } from '../db/pool.js'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import { z } from 'zod';
const r=Router();
r.post('/register',async(req,res)=>{
 const parsed=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254),password:z.string().min(8).max(72)}).safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:'Enter a name, valid email, and password with at least 8 characters.'});
 const {name,email,password}=parsed.data;
 try{
  const hash=await bcrypt.hash(password,10);
  const q=await pool.query(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'learner') RETURNING id,email,name,role`,[name,email.toLowerCase(),hash]);
  const user=q.rows[0];
  const token=jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET || 'local-development-secret-change-me',{expiresIn:'2h'});
  res.status(201).json({token,user});
 }catch(error){
  if((error as {code?:string}).code==='23505')return res.status(409).json({error:'An account with this email already exists. Log in instead.'});
  res.status(500).json({error:'Could not create your account.'});
 }
});
r.post('/login',async(req,res)=>{ const parsed=z.object({email:z.string().email(),password:z.string().min(8)}).safeParse(req.body);
 if(!parsed.success) return res.status(400).json({error:'Valid email and password (8+ chars) required'});
 const q=await pool.query('SELECT id,email,password_hash,role,name FROM users WHERE email=$1',[parsed.data.email.toLowerCase()]);
 if(!q.rowCount || !(await bcrypt.compare(parsed.data.password,q.rows[0].password_hash))) return res.status(401).json({error:'Invalid credentials'});
 const u=q.rows[0]; const token=jwt.sign({id:u.id,role:u.role},process.env.JWT_SECRET || 'local-development-secret-change-me',{expiresIn:'2h'});
 res.json({token,user:{id:u.id,name:u.name,email:u.email,role:u.role}});
});
export default r;
