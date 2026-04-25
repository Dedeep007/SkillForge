import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  ExtractionResult, AssessmentResult, ChatMessage, SSEEvent
} from "./types"

interface SkillForgeStore {
  jdText: string
  resumeText: string
  hoursPerDay: number
  setJdText: (t: string) => void
  setResumeText: (t: string) => void
  setHoursPerDay: (h: number) => void

  assessmentId: string | null
  extraction: ExtractionResult | null
  messages: ChatMessage[]
  currentSkillId: string | null
  progress: number
  isAssessing: boolean
  setAssessmentId: (id: string) => void
  setExtraction: (e: ExtractionResult) => void
  addMessage: (m: ChatMessage) => void
  handleSSEEvent: (e: SSEEvent) => void

  result: AssessmentResult | null
  setResult: (r: AssessmentResult) => void
  resetAssessment: () => void
}

export const useStore = create<SkillForgeStore>()(
  persist(
    (set, get) => ({
      jdText: "",
      resumeText: "",
      hoursPerDay: 2,
      setJdText: (t) => set({ jdText: t }),
      setResumeText: (t) => set({ resumeText: t }),
      setHoursPerDay: (h) => set({ hoursPerDay: h }),

      assessmentId: null,
      extraction: null,
      messages: [],
      currentSkillId: null,
      progress: 0,
      isAssessing: false,
      
      setAssessmentId: (id) => set({ 
        assessmentId: id, 
        isAssessing: true,
        messages: [],
        currentSkillId: null,
        result: null
      }),
      setExtraction: (e) => set({ extraction: e }),
      addMessage: (m) => set((state) => ({ messages: [...state.messages, m] })),
      
      handleSSEEvent: (e) => {
        if (e.event === "question" || e.event === "challenge") {
          set({ currentSkillId: e.skill_id })
          get().addMessage({
            id: Math.random().toString(36).substr(2, 9),
            role: e.event === "challenge" ? "challenge" : "agent",
            content: e.content || "",
            skill_id: e.skill_id,
            timestamp: new Date()
          })
        }
      },

      result: null,
      setResult: (r) => set({ result: r, isAssessing: false }),
      resetAssessment: () => set({
        assessmentId: null,
        extraction: null,
        messages: [],
        currentSkillId: null,
        progress: 0,
        isAssessing: false,
        result: null
      }),
    }),
    {
      name: 'skillforge-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
