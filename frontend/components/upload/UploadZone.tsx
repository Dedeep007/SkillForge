"use client"
import { useState, useRef } from "react"
import { uploadFile } from "@/lib/api"
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react"

interface Props {
  label: string
  endpoint: "jd" | "resume"
  onUpload: (text: string) => void
}

export default function UploadZone({ label, endpoint, onUpload }: Props) {
  const [state, setState] = useState<"idle" | "dragging" | "uploading" | "done" | "error">("idle")
  const [filename, setFilename] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setState("uploading")
    try {
      const res = await uploadFile(endpoint, file)
      setFilename(res.filename)
      onUpload(res.text)
      setState("done")
    } catch (err: any) {
      setErrorMsg(err.message)
      setState("error")
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setState("idle")
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div
      className={`relative border-2 border-dashed p-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
        state === "dragging" ? "border-accent bg-surface" : "border-border hover:border-muted"
      } ${state === "error" ? "border-red-500" : ""} ${state === "done" ? "border-green-500" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setState("dragging") }}
      onDragLeave={() => setState("idle")}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={(e) => {
        if (e.target.files?.[0]) handleFile(e.target.files[0])
      }} />
      
      {state === "idle" || state === "dragging" ? (
        <>
          <UploadCloud className="w-8 h-8 text-muted mb-4" />
          <h3 className="text-text font-medium font-mono">{label}</h3>
          <p className="text-muted text-sm mt-2">Drop PDF or .txt here</p>
        </>
      ) : state === "uploading" ? (
        <p className="text-accent animate-pulse">Extracting text...</p>
      ) : state === "done" ? (
        <>
          <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
          <p className="text-text font-mono">{filename}</p>
          <p className="text-muted text-xs mt-2">Click to replace</p>
        </>
      ) : (
        <>
          <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        </>
      )}
    </div>
  )
}
