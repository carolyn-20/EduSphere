import 'dotenv/config'; import { readFile } from 'node:fs/promises'; import { pool } from './pool.js';
try { await pool.query(await readFile(new URL('../../sql/seed.sql', import.meta.url),'utf8')); console.log('Seed applied'); }
finally { await pool.end(); }
