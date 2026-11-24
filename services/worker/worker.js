import { Worker } from 'bullmq';import IORedis from 'ioredis';
const connection=new IORedis(process.env.REDIS_URL||'redis://localhost:6379',{maxRetriesPerRequest:null});
const worker=new Worker('notifications',async job=>({processed:true,notificationId:job.id,type:job.data.type}),{connection});
worker.on('completed',job=>console.log(JSON.stringify({event:'job_completed',id:job.id})));
worker.on('failed',(job,err)=>console.error(JSON.stringify({event:'job_failed',id:job?.id,message:err.message})));
