export type GapLevel = "high_gap" | "medium_gap" | "ready"
export type MismatchSeverity = "none" | "mild" | "significant"
export type Domain = "backend" | "data_engineering" | "ml" | "devops"
export type Priority = "high" | "medium" | "low"

export interface JDSkill {
  skill_id: string
  label: string
  priority: Priority
  years_required: number | null
  context: string
}

export interface ResumeSkill {
  skill_id: string
  label: string
  evidence_strength: number
  years_mentioned: number | null
  context: string
}

export interface ExtractionResult {
  jd_skills: JDSkill[]
  resume_skills: ResumeSkill[]
  seniority_level: string
  domain: Domain
}

export interface SkillScore {
  skill_id: string
  label: string
  resume_evidence: number
  conversation_score: number
  final_score: number
  gap_level: GapLevel
  mismatch: boolean
  mismatch_severity: MismatchSeverity
}

export interface RoadmapWeek {
  week: number
  skill_id: string
  label: string
  tier: 1 | 2 | 3
  resources: { title: string; url: string; hours: number; type: string }[]
  mini_project: string
  graph_path: string[]
  why: string
}

export interface AssessmentResult {
  assessment_id: string
  extraction: ExtractionResult
  skill_scores: SkillScore[]
  roadmap: RoadmapWeek[]
  time_to_ready_weeks: number
  domain: Domain
}

export type SSEEventType =
  | "question"
  | "challenge"
  | "skill_complete"
  | "assessment_complete"
  | "error"
  | "extraction_complete"

export interface SSEEvent {
  event: SSEEventType
  skill_id?: string
  skill_label?: string
  content?: string
  progress?: number
  data?: any
}

export interface ChatMessage {
  id: string
  role: "agent" | "user" | "system" | "challenge"
  content: string
  skill_id?: string
  timestamp: Date
}
