"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { startAssessment } from "@/lib/api"
import UploadZone from "@/components/upload/UploadZone"

export default function LandingPage() {
  const router = useRouter()
  
  const { hoursPerDay, setHoursPerDay, setJdText, resumeText, setResumeText, setAssessmentId, setExtraction } = useStore()

  const [jdTextLocal, setJdTextLocal] = useState("")
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")

  const handleBegin = async () => {
    if (!jdTextLocal || !resumeText) return
    setStarting(true)
    setError("")
    
    try {
      // 1. Start Python Backend Assessment
      const res = await startAssessment(jdTextLocal, resumeText, hoursPerDay)
      
      // 2. Save to Zustand store and navigate
      setJdText(jdTextLocal)
      setAssessmentId(res.assessment_id)
      setExtraction(res.extraction)
      router.push(`/assess/${res.assessment_id}`)
      
    } catch (err: any) {
      setError(err.message)
      setStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="border-b border-border pb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-tighter mb-4 text-accent">SkillForge</h1>
          <p className="text-muted font-mono text-sm">Upload a Job Description and a Candidate Resume to begin the AI assessment.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border shadow-sm p-6 rounded-3xl">
            <h2 className="text-lg font-mono text-text mb-4">1. Job Description</h2>
            <UploadZone label="Upload JD (PDF)" endpoint="jd" onUpload={setJdTextLocal} />
            {jdTextLocal && <div className="mt-4 text-xs text-green-600 font-mono">✓ JD Extracted</div>}
          </div>
          <div className="bg-surface border border-border shadow-sm p-6 rounded-3xl">
            <h2 className="text-lg font-mono text-text mb-4">2. Candidate Resume</h2>
            <UploadZone label="Upload Resume (PDF)" endpoint="resume" onUpload={setResumeText} />
            {resumeText && <div className="mt-4 text-xs text-green-600 font-mono">✓ Resume Extracted</div>}
          </div>
        </div>

        <div className="bg-surface border border-border shadow-sm p-8 rounded-3xl space-y-8 max-w-lg mx-auto">
          <div className="bg-gray-50 border border-border p-5 rounded-xl">
            <label className="flex justify-between text-sm font-mono text-muted mb-4">
              <span>Availability (hours/day)</span>
              <span className="text-accent font-bold">{hoursPerDay}h</span>
            </label>
            <input 
              type="range" min="1" max="8" step="0.5" 
              value={hoursPerDay} onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-accent transition-all hover:h-2"
            />
          </div>

          {error && <div className="text-red-500 font-mono text-sm text-center">{error}</div>}

          <button
            onClick={handleBegin}
            disabled={!resumeText || !jdTextLocal || starting}
            className="w-full bg-accent text-white px-8 py-4 rounded-xl font-mono font-bold text-lg hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            {starting ? "Initializing Engine..." : "Begin AI Interview →"}
          </button>
        </div>
      </div>
    </div>
  )
}
