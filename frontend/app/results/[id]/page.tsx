"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { getRoadmap } from "@/lib/api"
import { createClient } from "@/utils/supabase/client"
import SkillHeatmap from "@/components/results/SkillHeatmap"
import RoadmapTimeline from "@/components/results/RoadmapTimeline"
import GraphPathViz from "@/components/results/GraphPathViz"

export default function ResultsPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : null
  const router = useRouter()
  const { hoursPerDay, setHoursPerDay, result, setResult, resetAssessment } = useStore()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [role, setRole] = useState("")

  useEffect(() => {
    setMounted(true)
    if (!id) return
    const loadResults = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) setRole(profile.role)
      }

      // 1. Try to load completed result from Supabase
      const { data: assessment } = await supabase.from('assessments').select('status, result_data, resume_text').eq('id', id).single()
      
      if (assessment) {
        setResumeText(assessment.resume_text || "")
        if (assessment.status === 'completed' && assessment.result_data) {
          setResult(assessment.result_data)
          return
        }
      }

      // 2. If not completed or not in Supabase, try to fetch from Python backend (live computation)
      try {
        const res = await getRoadmap(id, hoursPerDay)
        setResult(res)
        
        // 3. Save the newly computed result to Supabase
        await supabase.from('assessments').update({
          status: 'completed',
          result_data: res
        }).eq('id', id)
      } catch (err) {
        console.error("Failed to load roadmap:", err)
        setError("This assessment session was interrupted or wiped from memory before completion.")
      }
    }
    
    loadResults()
  }, [id, hoursPerDay, setResult, router])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg font-mono text-center p-6 space-y-6">
        <h1 className="text-3xl font-bold text-red-500">Session Expired</h1>
        <p className="text-muted max-w-md">{error}</p>
        <button onClick={() => router.back()} className="text-accent border border-accent/50 px-6 py-2 rounded-lg hover:bg-accent/10">Go Back</button>
      </div>
    )
  }

  if (!mounted || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg font-mono text-accent animate-pulse">
        Compiling Results...
      </div>
    )
  }

  const overallScore = result?.skill_scores?.length > 0 
    ? Math.round((result.skill_scores.reduce((sum: number, s: any) => sum + s.final_score, 0) / result.skill_scores.length) * 100)
    : 0;

  if (role === 'candidate') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg font-sans text-center p-6 space-y-6">
        <div className="bg-surface border border-border p-12 rounded-3xl shadow-xl max-w-lg w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-text mb-4">Assessment Submitted</h1>
          <p className="text-muted mb-8">
            Your technical assessment has been successfully completed and securely transmitted to the employer. They will review your results and contact you soon.
          </p>
          <button 
            onClick={() => {
              resetAssessment()
              router.push('/candidate')
            }}
            className="w-full bg-accent text-white font-bold py-4 rounded-xl hover:scale-[1.02] shadow-md transition-all"
          >
            Return to Candidate Portal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/40 pb-8 gap-6 backdrop-blur-md bg-bg/40 p-8 rounded-2xl border shadow-lg">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-tighter mb-3">
              <span className="text-accent">Assessment</span> Results
            </h1>
            <p className="text-muted font-mono flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent mr-3 animate-pulse"></span>
              Profile: {result.extraction.seniority_level} {result.extraction.domain}
            </p>
          </div>
          
          <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-5 rounded-xl w-full md:w-72 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
             <label className="flex justify-between text-sm font-mono text-muted mb-3">
                <span>Availability</span>
                <span className="text-accent font-bold">{hoursPerDay}h/day</span>
             </label>
             <input 
                type="range" min="1" max="8" step="0.5" 
                value={hoursPerDay} onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer accent-accent transition-all hover:h-2"
             />
          </div>
        </header>

        {/* Score Overview */}
        <section className="bg-surface/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-500 flex flex-col items-center">
          <h2 className="text-2xl font-mono text-accent mb-8">Overall Capability Score</h2>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border" />
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (overallScore/100)*251.2} className="text-accent transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono text-text">{overallScore}</span>
              <span className="text-sm text-accent font-mono mt-1">/ 100</span>
            </div>
          </div>
        </section>

        {/* Skill Map */}
        <section className="bg-surface/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-500">
          <h2 className="text-2xl font-mono text-accent mb-8 flex items-center">
            <span className="w-10 h-px bg-accent/50 mr-4"></span>
            Skill Map
            <span className="ml-4 text-xs font-sans text-muted bg-surface px-3 py-1 rounded-full border border-border/50 hidden sm:inline-block">Performance Overview</span>
          </h2>
          <SkillHeatmap skillScores={result.skill_scores} />
        </section>

        {/* Learning Path */}
        {result.roadmap.filter(r => r.tier === 1).length > 0 && (
          <section className="bg-surface/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-500">
            <h2 className="text-2xl font-mono text-accent mb-8 flex items-center">
              <span className="w-10 h-px bg-accent/50 mr-4"></span>
              Prerequisite Pathways
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {result.roadmap.filter(r => r.tier === 1).map(r => (
                <div key={r.skill_id} className="bg-background/80 border border-border/50 rounded-xl p-6 transition-transform hover:-translate-y-1 duration-300">
                  <h3 className="font-mono text-text mb-4 flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-sm mr-3"></div>
                    {r.label}
                  </h3>
                  <GraphPathViz path={r.graph_path} edgeTypes={Array(r.graph_path.length - 1).fill("PREREQUISITE")} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Roadmap */}
        <section className="bg-surface/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-500">
          <h2 className="text-2xl font-mono text-accent mb-8 flex items-center">
            <span className="w-10 h-px bg-accent/50 mr-4"></span>
            Personalized Roadmap
          </h2>
          <RoadmapTimeline roadmap={result.roadmap} />
        </section>

        {/* Resume View */}
        {resumeText && (
          <section className="bg-surface/40 backdrop-blur-md border border-border/40 p-8 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-500">
            <h2 className="text-2xl font-mono text-accent mb-8 flex items-center">
              <span className="w-10 h-px bg-accent/50 mr-4"></span>
              Candidate Resume
            </h2>
            <div className="bg-background/80 border border-border/50 rounded-xl p-6 max-h-[500px] overflow-y-auto font-mono text-sm text-muted whitespace-pre-wrap leading-relaxed">
              {resumeText}
            </div>
          </section>
        )}

        <section className="flex justify-center mt-16 pb-16">
          <button
            onClick={() => {
              resetAssessment()
              router.push('/')
            }}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-mono font-bold text-background bg-accent rounded-xl overflow-hidden transition-all hover:scale-105 shadow-sm hover:shadow-md"
          >
            <span className="relative z-10 flex items-center">
              Start New Assessment 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>
        </section>
      </div>
    </div>
  )
}
