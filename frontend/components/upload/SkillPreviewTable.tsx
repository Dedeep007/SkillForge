import type { ExtractionResult } from "@/lib/types"

export default function SkillPreviewTable({ extraction }: { extraction: ExtractionResult }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-accent font-mono text-lg mb-4">Extracted Profile</h3>
      <div className="grid grid-cols-2 gap-4 text-sm text-text">
        <div>
          <span className="text-muted">Domain:</span> {extraction.domain}
        </div>
        <div>
          <span className="text-muted">Level:</span> {extraction.seniority_level}
        </div>
      </div>
    </div>
  )
}
