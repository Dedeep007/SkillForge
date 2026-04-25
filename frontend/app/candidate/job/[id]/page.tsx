"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useStore } from "@/lib/store"
import { startAssessment } from "@/lib/api"
import UploadZone from "@/components/upload/UploadZone"

export default function CandidateJobPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : null
  const router = useRouter()
  const supabase = createClient()

  const { hoursPerDay, setHoursPerDay, setJdText, resumeText, setResumeText, setAssessmentId, setExtraction } = useStore()

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase.from('jobs').select('*, profiles(email)').eq('id', id).single()
    if (data) {
      setJob(data)
      setJdText(data.jd_text)
    }
    setLoading(false)
  }

  const handleBegin = async () => {
    if (!job || !resumeText) return
    setStarting(true)
    setError("")
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 1. Create Assessment Row in Supabase
      const { data: assessment, error: dbError } = await supabase.from('assessments').insert({
        job_id: job.id,
        candidate_id: user.id,
        resume_text: resumeText,
        status: 'in_progress'
      }).select().single()

      if (dbError) throw dbError

      // 2. Start Python Backend Assessment with that same Supabase ID
      const res = await startAssessment(job.jd_text, resumeText, hoursPerDay, assessment.id)
      
      // 3. Save to Zustand store and navigate
      setAssessmentId(assessment.id)
      setExtraction(res.extraction)
      router.push(`/assess/${assessment.id}`)
      
    } catch (err: any) {
      setError(err.message)
      setStarting(false)
    }
  }

  if (loading || !job) return <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-accent animate-pulse">Loading Job...</div>

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={() => router.push('/candidate')} className="text-sm font-mono text-muted hover:text-accent transition-colors">
          ← Back to Portal
        </button>
        
        <header className="border-b border-border/40 pb-6">
          <h1 className="text-3xl font-bold font-mono tracking-tighter mb-2 text-accent">{job.title}</h1>
          <p className="text-muted font-mono text-sm">Posted by: {job.profiles?.email}</p>
        </header>

        <div className="bg-surface/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl space-y-8">
          <div>
            <h2 className="text-xl font-mono text-text mb-4 flex items-center">
               <span className="w-8 h-px bg-accent/50 mr-4"></span>
               Apply & Test
            </h2>
            <p className="text-muted text-sm mb-6">
               Upload your resume below to begin. Our AI will instantly evaluate your resume against this job description and conduct a dynamic technical interview.
            </p>
            
            <div className="max-w-lg">
              <UploadZone label="Your Candidate Resume (PDF)" endpoint="resume" onUpload={setResumeText} />
            </div>
          </div>
          
          <div className="max-w-lg bg-background/50 border border-border/30 p-5 rounded-xl">
            <label className="flex justify-between text-sm font-mono text-muted mb-4">
              <span>Availability (hours/day)</span>
              <span className="text-accent font-bold">{hoursPerDay}h</span>
            </label>
            <input 
              type="range" min="1" max="8" step="0.5" 
              value={hoursPerDay} onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-accent transition-all hover:h-2"
            />
          </div>

          {error && <div className="text-red-500 font-mono text-sm">{error}</div>}

          <button
            onClick={handleBegin}
            disabled={!resumeText || starting}
            className="bg-accent text-background px-8 py-4 rounded-xl font-mono font-bold text-lg hover:scale-[1.02] shadow-[0_0_20px_rgba(232,255,107,0.2)] disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            {starting ? "Initializing Engine..." : "Begin AI Interview →"}
          </button>
        </div>
      </div>
    </div>
  )
}
