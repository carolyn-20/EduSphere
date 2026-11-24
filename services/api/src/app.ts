import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import rateLimit from 'express-rate-limit';
import auth from './routes/auth.js';import courses from './routes/courses.js';import learning from './routes/learning.js';
export const app=express();app.use(helmet());app.use(cors({origin:true}));app.use(express.json({limit:'1mb'}));app.use(rateLimit({windowMs:60000,max:120}));
app.get('/health',(_req,res)=>res.json({status:'ok',service:'edusphere-api'}));
app.get('/ready',async(_req,res)=>{try{const {pool}=await import('./db/pool.js');await pool.query('SELECT 1');res.json({status:'ready'});}catch{res.status(503).json({status:'not_ready'});}});
app.get('/openapi.json',(_req,res)=>res.json({
  openapi:'3.0.3',
  info:{title:'EduSphere API',version:'1.0.0'},
  servers:[{url:'http://localhost:4000'}],
  paths:{
    '/auth/login':{post:{summary:'Login and receive JWT'}},
    '/courses':{get:{summary:'List published courses'},post:{summary:'Create course'}},
    '/courses/{id}/enroll':{post:{summary:'Enroll learner'}},
    '/learning/lessons/{lessonId}/complete':{post:{summary:'Complete lesson'}},
    '/learning/assessments/{id}/attempts':{post:{summary:'Submit assessment attempt'}},
    '/learning/submissions':{post:{summary:'Submit assignment'}},
    '/learning/submissions/{id}/grade':{patch:{summary:'Grade assignment'}},
    '/learning/enrollments/{id}/certificate':{post:{summary:'Issue eligible certificate'}}
  }
}));
app.use('/auth',auth);app.use('/courses',courses);app.use('/learning',learning);
app.use((err:any,_req:any,res:any,_next:any)=>{res.status(500).json({error:'Unexpected server error'});});
