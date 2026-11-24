import { Router } from 'express'; import { pool } from '../db/pool.js'; import { authenticate,allow } from '../middleware/auth.js'; import { z } from 'zod';
const r=Router();r.use(authenticate);
r.get('/enrollments',allow('learner','admin'),async(req,res)=>{
 const q=await pool.query(`
  SELECT c.id AS course_id,c.title,c.description,u.name AS instructor,e.status,
   count(l.id)::int AS lesson_count,
   count(lp.id) FILTER (WHERE lp.completed_at IS NOT NULL)::int AS lessons_completed,
   CASE WHEN e.status='completed' THEN 100
        WHEN count(l.id)=0 THEN 0
        ELSE round(100.0*count(lp.id) FILTER (WHERE lp.completed_at IS NOT NULL)/count(l.id))::int END AS progress
  FROM enrollments e JOIN courses c ON c.id=e.course_id
  JOIN users u ON u.id=c.instructor_id
  LEFT JOIN topics t ON t.course_id=c.id
  LEFT JOIN lessons l ON l.topic_id=t.id
  LEFT JOIN lesson_progress lp ON lp.enrollment_id=e.id AND lp.lesson_id=l.id
  WHERE e.learner_id=$1
  GROUP BY c.id,c.title,c.description,u.name,e.status,e.enrolled_at
  ORDER BY e.enrolled_at DESC`,[req.user!.id]);
 res.json({data:q.rows});
});
r.post('/lessons/:lessonId/complete',allow('learner'),async(req,res)=>{const c=await pool.connect();try{await c.query('BEGIN');
const l=await c.query(`SELECT l.id,t.course_id,l.prerequisite_lesson_id FROM lessons l JOIN topics t ON t.id=l.topic_id WHERE l.id=$1`,[req.params.lessonId]);if(!l.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Lesson not found'});}
const e=await c.query(`SELECT id FROM enrollments WHERE learner_id=$1 AND course_id=$2 AND status='active' FOR UPDATE`,[req.user!.id,l.rows[0].course_id]);if(!e.rowCount){await c.query('ROLLBACK');return res.status(403).json({error:'Enrollment required'});}
if(l.rows[0].prerequisite_lesson_id){const p=await c.query('SELECT 1 FROM lesson_progress WHERE enrollment_id=$1 AND lesson_id=$2 AND completed_at IS NOT NULL',[e.rows[0].id,l.rows[0].prerequisite_lesson_id]);if(!p.rowCount){await c.query('ROLLBACK');return res.status(409).json({error:'Prerequisite lesson is incomplete'});}}
const q=await c.query(`INSERT INTO lesson_progress(enrollment_id,lesson_id,completed_at) VALUES($1,$2,now()) ON CONFLICT(enrollment_id,lesson_id) DO UPDATE SET completed_at=COALESCE(lesson_progress.completed_at,now()) RETURNING *`,[e.rows[0].id,req.params.lessonId]);await c.query('COMMIT');res.json(q.rows[0]);
}catch{await c.query('ROLLBACK');res.status(500).json({error:'Could not update progress'});}finally{c.release();}});
r.post('/assessments/:id/attempts',allow('learner'),async(req,res)=>{const c=await pool.connect();try{await c.query('BEGIN');const a=await c.query('SELECT id,course_id,max_attempts FROM assessments WHERE id=$1 FOR UPDATE',[req.params.id]);if(!a.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Assessment not found'});}
const e=await c.query("SELECT id FROM enrollments WHERE learner_id=$1 AND course_id=$2 AND status='active'",[req.user!.id,a.rows[0].course_id]);if(!e.rowCount){await c.query('ROLLBACK');return res.status(403).json({error:'Enrollment required'});}
const n=await c.query("SELECT count(*)::int AS n FROM attempts WHERE assessment_id=$1 AND learner_id=$2 AND status <> 'void'",[req.params.id,req.user!.id]);if(n.rows[0].n>=a.rows[0].max_attempts){await c.query('ROLLBACK');return res.status(409).json({error:'Attempt limit reached'});}
const p=z.object({answers:z.record(z.any())}).safeParse(req.body);if(!p.success){await c.query('ROLLBACK');return res.status(400).json({error:'Answers must be an object'});}
const q=await c.query('INSERT INTO attempts(assessment_id,learner_id,answers) VALUES($1,$2,$3) RETURNING *',[req.params.id,req.user!.id,JSON.stringify(p.data.answers)]);await c.query('COMMIT');res.status(201).json(q.rows[0]);}catch{await c.query('ROLLBACK');res.status(500).json({error:'Attempt could not be submitted'});}finally{c.release();}});
r.post('/submissions',allow('learner'),async(req,res)=>{const p=z.object({courseId:z.string().uuid(),title:z.string().min(2),content:z.string().min(1).max(20000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid submission'});
const e=await pool.query("SELECT 1 FROM enrollments WHERE learner_id=$1 AND course_id=$2 AND status='active'",[req.user!.id,p.data.courseId]);if(!e.rowCount)return res.status(403).json({error:'Enrollment required'});
const q=await pool.query('INSERT INTO submissions(course_id,learner_id,title,content) VALUES($1,$2,$3,$4) RETURNING id,title,status,submitted_at',[p.data.courseId,req.user!.id,p.data.title,p.data.content]);res.status(201).json(q.rows[0]);});
r.patch('/submissions/:id/grade',allow('assessor','instructor','admin'),async(req,res)=>{const p=z.object({grade:z.number().min(0).max(100),feedback:z.string().max(5000)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Grade must be 0–100'});
const q=await pool.query("UPDATE submissions SET grade=$1,feedback=$2,status='graded' WHERE id=$3 RETURNING id,grade,feedback,status",[p.data.grade,p.data.feedback,req.params.id]);if(!q.rowCount)return res.status(404).json({error:'Submission not found'});res.json(q.rows[0]);});
r.post('/enrollments/:id/certificate',allow('learner','admin'),async(req,res)=>{const c=await pool.connect();try{await c.query('BEGIN');const e=await c.query('SELECT * FROM enrollments WHERE id=$1 AND learner_id=$2 FOR UPDATE',[req.params.id,req.user!.id]);if(!e.rowCount){await c.query('ROLLBACK');return res.status(404).json({error:'Enrollment not found'});}
const totals=await c.query(`SELECT count(*)::int total,count(*) FILTER(WHERE completed_at IS NOT NULL)::int done FROM lesson_progress WHERE enrollment_id=$1`,[req.params.id]);if(!totals.rows[0].total||totals.rows[0].done!==totals.rows[0].total){await c.query('ROLLBACK');return res.status(409).json({error:'All course lessons must be completed'});}
const q=await c.query(`INSERT INTO certificates(enrollment_id,certificate_code) VALUES($1,'EDU-'||upper(substr(encode(gen_random_bytes(8),'hex'),1,12))) ON CONFLICT(enrollment_id) DO UPDATE SET enrollment_id=EXCLUDED.enrollment_id RETURNING *`,[req.params.id]);await c.query('COMMIT');res.status(201).json(q.rows[0]);}catch{await c.query('ROLLBACK');res.status(500).json({error:'Certificate issuance failed'});}finally{c.release();}});
export default r;
