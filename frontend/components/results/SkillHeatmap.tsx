import type { SkillScore } from "@/lib/types"
import MismatchBadge from "./MismatchBadge"

interface Props {
  skillScores: SkillScore[]
}

export default function SkillHeatmap({ skillScores }: Props) {
  const sorted = [...skillScores].sort((a, b) => {
    const order = { high_gap: 0, medium_gap: 1, ready: 2 }
    return order[a.gap_level] - order[b.gap_level]
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sorted.map((s) => (
        <div key={s.skill_id} className="bg-surface border border-border rounded-lg p-5 flex flex-col relative">
          {s.mismatch && (
            <div className="absolute top-4 right-4">
              <MismatchBadge severity={s.mismatch_severity} />
            </div>
          )}
          <h3 className="font-mono text-lg text-text mb-4">{s.label}</h3>
          
          <div className="space-y-3 flex-1">
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Claimed</span>
                <span>{Math.round(s.resume_evidence * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: `${s.resume_evidence * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Assessed</span>
                <span>{Math.round(s.conversation_score * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full">
                <div className="h-full bg-accent rounded-full" style={{ width: `${s.conversation_score * 100}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              s.gap_level === "ready" ? "bg-green-500/20 text-green-500" :
              s.gap_level === "medium_gap" ? "bg-amber-500/20 text-amber-500" :
              "bg-red-500/20 text-red-500"
            }`}>
              {s.gap_level === "ready" ? "READY" : s.gap_level === "medium_gap" ? "UPSKILL" : "HIGH GAP"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
