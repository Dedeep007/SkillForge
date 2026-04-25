"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function EmployerJobPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : null
  const router = useRouter()
  const supabase = createClient()

  const [job, setJob] = useState<any>(null)
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchJobAndCandidates()
  }, [id])

  const fetchJobAndCandidates = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch job details
    const { data: jobData } = await supabase.from('jobs').select('*').eq('id', id).single()
    if (jobData) setJob(jobData)

    // Fetch assessments for this job
    const { data: assessmentData } = await supabase.from('assessments')
      .select('id, status, created_at, result_data, profiles(email)')
      .eq('job_id', id)
      
    if (assessmentData) {
      const mapped = assessmentData.map((a: any) => {
        let score = 0;
        if (a.result_data && a.result_data.skill_scores && a.result_data.skill_scores.length > 0) {
          score = Math.round((a.result_data.skill_scores.reduce((sum: number, s: any) => sum + s.final_score, 0) / a.result_data.skill_scores.length) * 100)
        }
        return { ...a, score }
      })
      // Sort by score descending
      mapped.sort((a, b) => b.score - a.score)
      setAssessments(mapped)
    }

    setLoading(false)
  }

  if (loading || !job) return <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-accent animate-pulse">Loading Job Details...</div>

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-8">
        <button onClick={() => router.push('/employer')} className="text-sm font-mono text-muted hover:text-accent transition-colors">
          ← Back to Dashboard
        </button>
        
        <header className="border-b border-border/40 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tighter mb-2 text-accent">{job.title}</h1>
            <p className="text-muted font-mono text-sm">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
          </div>
          <div className="bg-surface/50 border border-border/50 px-4 py-2 rounded-lg">
            <span className="font-mono text-xl text-text font-bold">{assessments.length}</span>
            <span className="text-muted text-xs uppercase ml-2">Candidates</span>
          </div>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-mono text-text">Candidate Assessments</h2>
          
          {assessments.length === 0 ? (
            <div className="border border-dashed border-border/50 rounded-2xl p-12 text-center text-muted font-mono bg-surface/20">
              No candidates have applied to this job yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="bg-surface/40 backdrop-blur-md border border-border/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-accent/50 transition-colors">
                  <div>
                    <h3 className="text-lg font-mono text-text mb-1">{assessment.profiles?.email}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono px-2 py-1 rounded-md border ${
                        assessment.status === 'completed' 
                          ? 'border-green-500/50 text-green-400 bg-green-500/10' 
                          : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                      }`}>
                        {assessment.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                      {assessment.status === 'completed' && (
                        <span className="text-xs font-mono px-2 py-1 rounded-md border border-accent/50 text-accent bg-accent/10">
                          SCORE: {assessment.score}/100
                        </span>
                      )}
                      <span className="text-xs text-muted font-mono">{new Date(assessment.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    disabled={assessment.status !== 'completed'}
                    onClick={() => router.push(`/results/${assessment.id}`)}
                    className="bg-background border border-border text-text px-6 py-2 rounded-lg font-mono font-bold hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:hover:border-border disabled:hover:text-text"
                  >
                    {assessment.status === 'completed' ? "View Results →" : "Awaiting Completion"}
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
