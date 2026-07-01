"use client"

import { useState } from "react"
import { ArrowLeft, Search, BookOpen, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReaderTextSize } from "@/hooks/use-reader-text-size"
import { ReaderTextSizeButton, ReaderTextSizeSlider } from "@/components/reader-text-size-control"
import type { Screen } from "../app-shell"

interface DoctrineScreenProps {
  disasterType: string | null
  onNavigate: (screen: Screen, disasterType?: string, doctrineId?: string) => void
}

const assignmentLabels: Record<string, string> = {
  "dat-regional-response": "DAT: Regional Response",
  "mass-care": "Mass Care",
  "client-care": "Client Care",
  "workforce": "Workforce",
  "logistics": "Logistics",
  "information-planning": "Information & Planning",
  "external-relations": "External Relations",
  "operations-management": "Operations Management",
}

// Phases for Mass Care content (matching folder structure)
const massCarePhases: string[] = [
  "Operations",
  "Planning",
  "Closing",
]

export function DoctrineScreen({ disasterType, onNavigate }: DoctrineScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [textSizeOpen, setTextSizeOpen] = useState(false)
  const { scale: readerScale } = useReaderTextSize()

  const assignmentId = disasterType || "mass-care"
  const label = assignmentLabels[assignmentId] || "Mass Care"
  
  // For Mass Care, show phases. For other assignments, show phases as well (content will be filtered)
  const phases = assignmentId === "mass-care" 
    ? massCarePhases 
    : massCarePhases // For now, all assignments show phases (content filtering happens in group-documents screen)
  
  const filtered = phases.filter((phase) =>
    phase.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate("home")}
            className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
              {label}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {filtered.length} phases
            </p>
          </div>
          <ReaderTextSizeButton open={textSizeOpen} onOpenChange={setTextSizeOpen} />
          <button
            onClick={() => onNavigate("ask")}
            aria-label="Search doctrine"
            className="w-11 h-11 rounded-xl bg-interactive/10 flex items-center justify-center active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5 text-interactive" />
          </button>
        </div>
        <ReaderTextSizeSlider open={textSizeOpen} />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className={cn(
              "w-full h-10 pl-9 pr-4 rounded-xl",
              "bg-muted/50 border-none",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-interactive/40",
              "transition-all",
            )}
          />
        </div>
      </header>

      {/* Phases List */}
      <div
        className="flex-1 px-5 pb-6 space-y-2 reader-scope"
        style={{ ["--reader-scale" as any]: readerScale }}
      >
        {filtered.map((phase, index) => (
          <button
            key={`${assignmentId}-${index}`}
            onClick={() => {
              const phaseId = phase.toLowerCase()
              onNavigate("group-documents", assignmentId, undefined, phaseId)
            }}
            className={cn(
              "w-full flex items-start gap-3 p-4 rounded-xl text-left",
              "bg-card border border-interactive-deep/20 shadow-sm",
              "active:border-interactive-deep/40 active:bg-interactive-soft/10 active:scale-[0.99] transition-all duration-200",
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-interactive-soft/60 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5 text-interactive-deep" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="reader-body font-semibold text-foreground leading-snug">{phase}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
