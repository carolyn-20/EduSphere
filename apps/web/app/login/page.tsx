'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';
import SiteHeader from '../components/SiteHeader';
import {API,saveToken} from '../lib/demo';

export default function LoginPage(){
  const router=useRouter();const [mode,setMode]=useState<'login'|'signup'>('login');const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');setBusy(true);
    try{
      const response=await fetch(`${API}/auth/${mode==='signup'?'register':'login'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(mode==='signup'?{name,email,password}:{email,password})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not sign in.');
      saveToken(data.token);router.push('/learning');
    }catch(e){setError(e instanceof Error?e.message:'Could not connect to EduSphere.');}finally{setBusy(false);}
  }
  return <main className="shell"><SiteHeader/><section className="auth-wrap"><div className="auth-card card">
    <div className="tag">YOUR LEARNING ACCOUNT</div><h1>{mode==='login'?'Welcome back':'Create your account'}</h1><p className="muted">{mode==='login'?'Log in to continue your learning.':'Sign up to enroll in courses and track your progress.'}</p>
    <div className="auth-tabs"><button type="button" className={mode==='login'?'tab active':'tab'} onClick={()=>{setMode('login');setError('');}}>Log in</button><button type="button" className={mode==='signup'?'tab active':'tab'} onClick={()=>{setMode('signup');setError('');}}>Sign up</button></div>
    <form className="auth-form" onSubmit={submit}>
      {mode==='signup'&&<label>Full name<input autoComplete="name" value={name} onChange={event=>setName(event.target.value)} required minLength={2} maxLength={100} placeholder="Your name"/></label>}
      <label>Email address<input type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} required placeholder="you@example.com"/></label>
      <label>Password<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={event=>setPassword(event.target.value)} required minLength={8} maxLength={72} placeholder="At least 8 characters"/></label>
      {error&&<p className="auth-error" role="alert">{error}</p>}
      <button className="button auth-submit" disabled={busy}>{busy?'Please wait…':mode==='login'?'Log in':'Create account'}</button>
    </form>
    {mode==='login'&&<p className="demo-hint">Demo learner: <strong>learner@edusphere.local</strong> · Password: <strong>Password123!</strong></p>}
  </div></section></main>;
}
