"use client"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 0%, var(--bg) 100%)" }}></div>
      
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold font-mono text-text mb-4 tracking-tighter">SkillForge<span className="text-accent">.ai</span></h1>
        <p className="text-xl text-muted mb-12 font-mono max-w-2xl">
          The next-generation technical assessment platform. Move beyond basic resume parsing and test real capability.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          <div className="flex-1 bg-surface/60 backdrop-blur-xl border border-border/50 p-8 rounded-3xl flex flex-col items-center">
            <h2 className="text-2xl font-mono text-accent mb-4">For Employers</h2>
            <p className="text-muted text-sm mb-8 text-center">Post jobs, set requirements, and let AI conduct the first-round technical interviews for you.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-background border border-border text-text px-6 py-3 rounded-xl font-mono hover:border-accent hover:text-accent transition-colors"
            >
              Employer Portal →
            </button>
          </div>

          <div className="flex-1 bg-surface/60 backdrop-blur-xl border border-border/50 p-8 rounded-3xl flex flex-col items-center">
            <h2 className="text-2xl font-mono text-accent mb-4">For Candidates</h2>
            <p className="text-muted text-sm mb-8 text-center">Apply to open roles, take interactive AI-driven technical assessments, and prove your skills.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-accent text-background px-6 py-3 rounded-xl font-mono font-bold hover:scale-[1.02] shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all"
            >
              Candidate Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
