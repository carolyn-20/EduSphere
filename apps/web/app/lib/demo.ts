const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000';

export function getToken(){return typeof window==='undefined'?'':localStorage.getItem('edusphere-token')||'';}
export function saveToken(token:string){localStorage.setItem('edusphere-token',token);}

export async function learnerToken(){
  const current=getToken();
  if(current)return current;
  const response=await fetch(`${API}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'learner@edusphere.local',password:'Password123!'})});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Could not sign in to the learner demo.');
  saveToken(data.token);
  return data.token as string;
}

export {API};
