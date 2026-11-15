import Link from "next/link";

export default function NotFound() {
  return (
    <div className="world-bg flex min-h-screen flex-col items-center justify-center px-6 pt-[var(--hud-h)] text-center">
      <p className="chroma font-pixel text-6xl text-gold md:text-8xl">404</p>
      <h1 className="mt-6 font-serif text-4xl text-ink md:text-5xl">You fell out of the map.</h1>
      <p className="mt-3 font-term text-xl text-dim">This room doesn&apos;t exist (yet).</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-pixel btn-pixel--gold text-xs">Respawn at studio</Link>
        <Link href="/projects" className="btn-pixel text-xs">All projects</Link>
      </div>
    </div>
  );
}
