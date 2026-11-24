import {describe,it,expect} from 'vitest';import request from 'supertest';import {app} from './app.js';
describe('EduSphere API',()=>{it('exposes health check',async()=>{const r=await request(app).get('/health');expect(r.status).toBe(200);expect(r.body.status).toBe('ok');});
it('rejects malformed login',async()=>{const r=await request(app).post('/auth/login').send({email:'bad',password:'x'});expect(r.status).toBe(400);});
it('requires auth for learning routes',async()=>{const r=await request(app).post('/learning/lessons/abc/complete');expect(r.status).toBe(401);});});
