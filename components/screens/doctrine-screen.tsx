"use client"

import { useState } from "react"
import { ArrowLeft, Search, BookOpen, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
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
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-medium text-foreground">{label}</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} phases</p>
          </div>
          <button
            onClick={() => onNavigate("ask")}
            aria-label="Search doctrine"
            className="w-9 h-9 rounded-xl bg-interactive/10 flex items-center justify-center active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-interactive" />
          </button>
        </div>

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
      <div className="flex-1 px-5 pb-6 space-y-2">
        {filtered.map((phase, index) => (
          <button
            key={`${assignmentId}-${index}`}
            onClick={() => {
              const phaseId = phase.toLowerCase()
              onNavigate("group-documents", assignmentId, undefined, phaseId)
            }}
            className={cn(
              "w-full flex items-start gap-3 p-4 rounded-xl text-left",
              "bg-card border border-border",
              "active:scale-[0.99] transition-all duration-200",
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground leading-snug">{phase}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
