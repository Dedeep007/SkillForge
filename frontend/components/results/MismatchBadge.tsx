import { AlertTriangle, XCircle } from "lucide-react"

export default function MismatchBadge({ severity }: { severity: "mild" | "significant" | "none" }) {
  if (severity === "none") return null
  
  if (severity === "mild") {
    return (
      <div className="flex items-center text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Slight overstatement
      </div>
    )
  }
  return (
    <div className="flex items-center text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs">
      <XCircle className="w-3 h-3 mr-1" />
      Inflation detected
    </div>
  )
}
