import type { RoadmapWeek } from "@/lib/types"
import { BookOpen, Video, Code, Box } from "lucide-react"
import GraphPathViz from "./GraphPathViz"

export default function RoadmapTimeline({ roadmap }: { roadmap: RoadmapWeek[] }) {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {roadmap.map((item, idx) => (
        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-accent text-background font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {item.week}
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface p-6 rounded-xl border border-border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-mono text-accent text-xl">{item.label}</h3>
              <span className="text-xs px-2 py-1 bg-background text-muted rounded border border-border">
                Tier {item.tier}
              </span>
            </div>
            
            <p className="text-sm text-text mb-4 italic">"{item.why}"</p>
            
            <div className="mb-4">
              <GraphPathViz path={item.graph_path} edgeTypes={Array(item.graph_path.length - 1).fill("PREREQUISITE")} />
            </div>
            
            {item.resources && item.resources.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="text-xs text-muted uppercase tracking-wider">Resources</h4>
                {item.resources.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded bg-background border border-border hover:border-accent transition-colors group/link">
                    {res.type === "course" ? <Video className="w-4 h-4 mr-2 text-muted group-hover/link:text-accent" /> : <BookOpen className="w-4 h-4 mr-2 text-muted group-hover/link:text-accent" />}
                    <span className="text-sm text-text flex-1 truncate">{res.title}</span>
                    <span className="text-xs text-muted">{res.hours}h</span>
                  </a>
                ))}
              </div>
            )}
            
            <div>
               <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Mini Project</h4>
               <div className="flex items-start bg-background p-3 rounded border border-border">
                 <Code className="w-4 h-4 mr-2 text-accent mt-0.5 shrink-0" />
                 <span className="text-sm text-text">{item.mini_project}</span>
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
