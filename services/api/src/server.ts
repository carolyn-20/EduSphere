import 'dotenv/config';import {app} from './app.js';import {pool} from './db/pool.js';
const port=Number(process.env.PORT||4000);const server=app.listen(port,()=>console.log(`EduSphere API listening on ${port}`));
const shutdown=async()=>{server.close();await pool.end();process.exit(0);};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
