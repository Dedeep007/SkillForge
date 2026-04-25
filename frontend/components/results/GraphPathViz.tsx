import type { FC } from "react"
import { ArrowRight } from "lucide-react"

interface Props {
  path: string[]
  edgeTypes: string[]
}

const GraphPathViz: FC<Props> = ({ path, edgeTypes }) => {
  if (!path || path.length === 0) return null
  
  return (
    <div className="flex items-center flex-wrap gap-2 text-sm">
      {path.map((node, idx) => (
        <div key={idx} className="flex items-center">
          <span className={`px-3 py-1 rounded-full font-mono text-xs ${
            idx === 0 ? "bg-accent text-background font-bold" : "bg-background border border-border text-text"
          }`}>
            {node}
          </span>
          {idx < path.length - 1 && (
            <div className="flex items-center mx-1 group relative">
              <div className={`h-0.5 w-6 ${
                edgeTypes[idx] === "PREREQUISITE" ? "bg-green-500/50" :
                edgeTypes[idx] === "COUSIN" ? "bg-amber-500/50" : "bg-purple-500/50"
              }`}></div>
              <ArrowRight className={`w-3 h-3 -ml-2 ${
                edgeTypes[idx] === "PREREQUISITE" ? "text-green-500/50" :
                edgeTypes[idx] === "COUSIN" ? "text-amber-500/50" : "text-purple-500/50"
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default GraphPathViz
