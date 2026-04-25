"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import UploadZone from "@/components/upload/UploadZone"

export default function EmployerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [jdText, setJdText] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [creating, setCreating] = useState(false)

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

    if (profile.role !== 'employer') {
      router.push('/candidate')
      return
    }

    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    if (data) setJobs(data)
    setLoading(false)
  }

  const handleCreateJob = async () => {
    if (!jobTitle || !jdText) return
    setCreating(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title: jobTitle,
      jd_text: jdText
    })

    setCreating(false)
    if (!error) {
      setJobTitle("")
      setJdText("")
      fetchJobs()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-accent animate-pulse">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-border/40 pb-6">
          <div>
            <h1 className="text-4xl font-bold font-mono tracking-tighter mb-2">Employer <span className="text-accent">Portal</span></h1>
            <p className="text-muted font-mono">Manage jobs and review candidate assessments</p>
          </div>
          <button onClick={handleLogout} className="text-sm font-mono text-muted hover:text-red-400 transition-colors">Log Out</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface/40 backdrop-blur-md border border-border/40 p-6 rounded-2xl">
              <h2 className="text-xl font-mono text-accent mb-6">Post New Job</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-2">Job Title</label>
                  <input 
                    type="text" 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm focus:border-accent outline-none"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                
                <div className="pt-2">
                  <UploadZone label="Job Description (PDF)" endpoint="jd" onUpload={setJdText} />
                </div>

                <button
                  onClick={handleCreateJob}
                  disabled={creating || !jobTitle || !jdText}
                  className="w-full bg-accent text-background font-bold font-mono py-3 rounded-xl hover:brightness-110 disabled:opacity-50 mt-4"
                >
                  {creating ? "Posting..." : "Create Job"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-mono text-text">Your Active Jobs</h2>
            
            {jobs.length === 0 ? (
              <div className="border border-dashed border-border/50 rounded-2xl p-12 text-center text-muted font-mono">
                No jobs posted yet. Post your first job to start receiving candidates!
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-surface/40 border border-border/40 p-6 rounded-2xl hover:border-accent/50 transition-colors flex justify-between items-center group cursor-pointer" onClick={() => router.push(`/employer/job/${job.id}`)}>
                    <div>
                      <h3 className="text-lg font-mono text-accent mb-1">{job.title}</h3>
                      <p className="text-xs text-muted font-mono">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">
                      View Candidates →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
