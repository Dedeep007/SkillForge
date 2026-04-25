import { ExtractionResult, AssessmentResult } from "./types"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function uploadFile(
  endpoint: "jd" | "resume",
  file: File
): Promise<{ text: string; filename: string }> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(`${BASE}/upload/${endpoint}`, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
  return res.json()
}

export async function startAssessment(
  jdText: string,
  resumeText: string,
  hoursPerDay: number,
  assessmentId?: string
): Promise<{ assessment_id: string; extraction: ExtractionResult }> {
  const res = await fetch(`${BASE}/assess/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd_text: jdText, resume_text: resumeText, hours_per_day: hoursPerDay, assessment_id: assessmentId })
  })
  if (!res.ok) throw new Error(`Failed to start assessment: ${res.statusText}`)
  return res.json()
}

export async function submitAnswer(
  assessmentId: string,
  answer: string
): Promise<void> {
  const res = await fetch(`${BASE}/assess/${assessmentId}/answer?answer=${encodeURIComponent(answer)}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error(`Failed to submit answer: ${res.statusText}`)
}

export async function getRoadmap(
  assessmentId: string,
  hoursPerDay: number
): Promise<AssessmentResult> {
  const res = await fetch(`${BASE}/roadmap/${assessmentId}?hours_per_day=${hoursPerDay}`)
  if (!res.ok) throw new Error(`Failed to fetch roadmap: ${res.statusText}`)
  return res.json()
}

export function getStreamUrl(assessmentId: string): string {
  return `${BASE}/assess/${assessmentId}/stream`
}
