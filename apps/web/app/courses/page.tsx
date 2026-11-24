'use client';
import {useEffect,useState} from 'react';
import SiteHeader from '../components/SiteHeader';
import {API,learnerToken} from '../lib/demo';

type Course={id:string;title:string;description:string;instructor:string;price_cents:number};
export default function CoursesPage(){
  const [courses,setCourses]=useState<Course[]>([]);const [message,setMessage]=useState('Loading courses…');const [busy,setBusy]=useState('');
  async function load(){try{const response=await fetch(`${API}/courses`);const body=await response.json();if(!response.ok)throw new Error(body.error||'Could not load courses.');setCourses(body.data||[]);setMessage(body.data?.length?'':'No courses are published yet.');}catch(e){setMessage(e instanceof Error?e.message:'Could not load courses.');}}
  useEffect(()=>{void load();},[]);
  async function enroll(course:Course){setBusy(course.id);try{const token=await learnerToken();const response=await fetch(`${API}/courses/${course.id}/enroll`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});const body=await response.json();if(!response.ok)throw new Error(body.error||'Could not enroll.');setMessage(`You’re enrolled in ${course.title}. Open My learning to see it.`);}catch(e){setMessage(e instanceof Error?e.message:'Could not enroll.');}finally{setBusy('');}}
  return <main className="shell"><SiteHeader/><section className="page-intro"><div className="tag">EXPLORE</div><h1>Course catalog</h1><p className="muted">Choose a course and start learning. Enrolling uses the local learner demo account.</p></section>
    {message&&<p className="notice">{message}</p>}
    <div className="grid">{courses.map(course=><article className="card course" key={course.id}><span className="pill">COURSE</span><h2>{course.title}</h2><p className="muted">{course.description}</p><p><small>Instructor: {course.instructor}</small></p><button className="button" disabled={busy===course.id} onClick={()=>void enroll(course)}>{busy===course.id?'Enrolling…':'Enroll in course'}</button></article>)}</div>
  </main>;
}
