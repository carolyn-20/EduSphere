import Link from 'next/link';

export default function SiteHeader(){
  return <header className="top">
    <Link className="brand" href="/">✦ EduSphere</Link>
    <nav className="nav">
      <Link href="/courses">Courses</Link>
      <Link href="/learning">My learning</Link>
      <Link href="/author">Course authoring</Link>
      <Link href="/admin">Admin</Link>
      <Link href="/login">Sign in</Link>
    </nav>
    <span className="pill">LEARNING PLATFORM</span>
  </header>;
}
