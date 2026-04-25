"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { submitAnswer } from "@/lib/api"
import { useAssessmentStream } from "@/hooks/useAssessmentStream"
import ChatInterface from "@/components/assessment/ChatInterface"
import ProgressBar from "@/components/assessment/ProgressBar"

export default function AssessPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : null
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  const { isConnected, error, isComplete } = useAssessmentStream(id)
  
  const { messages, extraction, addMessage, currentSkillId } = useStore()
  const [isWaiting, setIsWaiting] = useState(false)
  
  const handleSend = async (answer: string) => {
    if (!id) return
    setIsWaiting(true)
    addMessage({
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: answer,
      timestamp: new Date()
    })
    try {
      await submitAnswer(id, answer)
    } catch (err) {
      console.error(err)
    }
  }
  
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg && (lastMsg.role === "agent" || lastMsg.role === "challenge")) {
      setIsWaiting(false)
    }
  }, [messages])
  
  useEffect(() => {
    if (isComplete) {
      router.push(`/results/${id}`)
    }
  }, [isComplete, id, router])
  
  const jdSkills = extraction?.jd_skills || []
  const resumeSkills = extraction?.resume_skills || []
  
  const gapSkills = jdSkills.filter(jd => {
    const rs = resumeSkills.find(r => r.skill_id === jd.skill_id)
    return !rs || rs.evidence_strength < 0.6
  })
  
  const currentIdx = currentSkillId ? gapSkills.findIndex(s => s.skill_id === currentSkillId) : 0
  const progressPct = gapSkills.length > 0 ? ((currentIdx) / gapSkills.length) * 100 : 0
  
  if (!mounted) return <div className="h-screen bg-bg"></div>
  
  return (
    <div className="flex h-screen bg-bg text-text">
      <div className="w-[30%] p-6 border-r border-border overflow-y-auto hidden md:block">
        <h2 className="text-xl font-mono text-accent mb-8">SkillForge Assessment</h2>
        
        <ProgressBar current={currentIdx} total={gapSkills.length} label="ASSESSMENT PROGRESS" />
        
        <div className="mt-8 space-y-4">
          <h3 className="text-xs text-muted uppercase tracking-wider font-mono">Skills to verify</h3>
          {gapSkills.map((s, idx) => (
            <div key={s.skill_id} className={`p-4 rounded-lg border transition-colors ${
              s.skill_id === currentSkillId ? "border-accent bg-accent/5" : "border-border bg-surface"
            } ${idx < currentIdx ? "opacity-50" : ""}`}>
              <div className="flex justify-between items-center">
                <span className={`font-mono text-sm ${s.skill_id === currentSkillId ? "text-accent" : "text-text"}`}>{s.label}</span>
                {idx < currentIdx && <span className="text-xs text-muted">Complete</span>}
                {s.skill_id === currentSkillId && <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full md:w-[70%] h-full">
        {error ? (
           <div className="flex items-center justify-center h-full text-red-500 font-mono">
             {error}. <button onClick={() => window.location.reload()} className="ml-4 underline">Retry</button>
             <button onClick={() => router.push(`/results/${id}`)} className="ml-4 underline text-accent">Go to Results</button>
           </div>
        ) : (
          <ChatInterface messages={messages} onSend={handleSend} isWaiting={isWaiting} />
        )}
      </div>
    </div>
  )
}
