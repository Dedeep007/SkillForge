"use client"
import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { getStreamUrl } from "@/lib/api"
import type { SSEEvent } from "@/lib/types"

export function useAssessmentStream(assessmentId: string | null) {
  const handleSSEEvent = useStore((s) => s.handleSSEEvent)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!assessmentId) return
    const es = new EventSource(getStreamUrl(assessmentId))
    es.onopen = () => setIsConnected(true)
    es.onmessage = (e) => {
      try {
        const event: SSEEvent = JSON.parse(e.data)
        handleSSEEvent(event)
        if (event.event === "assessment_complete") {
          setIsComplete(true)
          es.close()
        }
      } catch (err) {}
    }
    es.onerror = () => {
      setError("Stream disconnected")
      es.close()
    }
    return () => es.close()
  }, [assessmentId, handleSSEEvent])

  return { isConnected, error, isComplete }
}
