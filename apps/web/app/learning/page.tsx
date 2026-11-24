'use client';
import {useEffect,useState} from 'react';
import SiteHeader from '../components/SiteHeader';
import {API,learnerToken} from '../lib/demo';

type Enrollment={course_id:string;title:string;description:string;instructor:string;status:string;lesson_count:number;lessons_completed:number;progress:number};
export default function LearningPage(){
  const [items,setItems]=useState<Enrollment[]>([]);const [message,setMessage]=useState('Loading your learning…');
  useEffect(()=>{let active=true;(async()=>{try{const token=await learnerToken();const response=await fetch(`${API}/learning/enrollments`,{headers:{Authorization:`Bearer ${token}`}});const body=await response.json();if(!response.ok)throw new Error(body.error||'Could not load your learning.');if(active){setItems(body.data||[]);setMessage(body.data?.length?'':'You have no enrolled courses yet. Browse the catalog to get started.');}}catch(e){if(active)setMessage(e instanceof Error?e.message:'Could not load your learning.');}})();return()=>{active=false;};},[]);
  const finished=items.filter(item=>item.status==='completed');const inProgress=items.filter(item=>item.status!=='completed');
  return <main className="shell"><SiteHeader/><section className="page-intro"><div className="tag">LEARNER WORKSPACE</div><h1>My learning</h1><p className="muted">Your enrolled courses and completed learning.</p></section>
    {message&&<p className="notice">{message}</p>}
    {finished.length>0&&<><div className="section"><h2>Finished courses</h2></div><div className="grid">{finished.map(course=><article className="card" key={course.course_id}><span className="pill success">COMPLETED</span><h2>{course.title}</h2><p className="muted">{course.description}</p><small>Instructor: {course.instructor}</small><div className="progress-label"><span>Course complete</span><strong>100%</strong></div><div className="bar"><span style={{width:'100%'}}/></div></article>)}</div></>}
    {inProgress.length>0&&<><div className="section"><h2>In progress</h2></div><div className="grid">{inProgress.map(course=><article className="card" key={course.course_id}><span className="pill">IN PROGRESS</span><h2>{course.title}</h2><p className="muted">{course.description}</p><small>{course.lessons_completed} of {course.lesson_count} lessons complete</small><div className="bar"><span style={{width:`${course.progress}%`}}/></div></article>)}</div></>}
  </main>;
}
