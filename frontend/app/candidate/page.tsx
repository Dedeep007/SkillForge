"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function CandidateDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    
    if (error || !profile) {
      await supabase.auth.signOut()
      router.push('/login')
      return
    }

    if (profile.role !== 'candidate') {
      router.push('/employer')
      return
    }

    // Fetch all jobs
    const { data } = await supabase.from('jobs').select('*, profiles(email)').order('created_at', { ascending: false })
    if (data) setJobs(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-accent animate-pulse">Loading Opportunities...</div>

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-border/40 pb-6">
          <div>
            <h1 className="text-4xl font-bold font-mono tracking-tighter mb-2">Candidate <span className="text-accent">Portal</span></h1>
            <p className="text-muted font-mono">Discover roles and prove your skills</p>
          </div>
          <button onClick={handleLogout} className="text-sm font-mono text-muted hover:text-red-400 transition-colors">Log Out</button>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-mono text-text">Open Positions</h2>
          
          {jobs.length === 0 ? (
            <div className="border border-dashed border-border/50 rounded-2xl p-12 text-center text-muted font-mono">
              No open positions at the moment. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map(job => (
                <div key={job.id} className="bg-surface/40 backdrop-blur-md border border-border/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-accent/50 transition-colors">
                  <div>
                    <h3 className="text-xl font-mono text-accent mb-2">{job.title}</h3>
                    <p className="text-xs font-mono text-muted">Posted by: {job.profiles?.email}</p>
                    <p className="text-xs font-mono text-muted mt-1">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/candidate/job/${job.id}`)}
                    className="bg-accent/10 text-accent border border-accent/30 px-6 py-2 rounded-lg font-mono font-bold hover:bg-accent hover:text-background transition-all"
                  >
                    Apply & Assess →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
