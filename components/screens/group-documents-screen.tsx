"use client"

import { useState } from "react"
import { ArrowLeft, Search, BookOpen, Sparkles, FileText, Shield, Users, Clipboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReaderTextSize } from "@/hooks/use-reader-text-size"
import { ReaderTextSizeButton, ReaderTextSizeSlider } from "@/components/reader-text-size-control"
import type { Screen } from "../app-shell"
import { massCareContent, taskSheets } from "@/lib/mass-care-content"

interface GroupDocumentsScreenProps {
  subActivity: string | null
  group: string | null
  onNavigate: (screen: Screen, disasterType?: string, doctrineId?: string, group?: string) => void
}

const phaseLabels: Record<string, string> = {
  "operations": "Operations",
  "planning": "Planning",
  "closing": "Closing",
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

// Get documents for a phase - dynamically generated from massCareContent
function getPhaseDocuments(phaseId: string): string[] {
  const allDocs = Object.keys(massCareContent)
  return allDocs.filter((docId) => {
    const doc = massCareContent[docId]
    if (!doc) return false
    return doc.phase === phaseId
  })
}

function getDocumentIcon(type: string) {
  switch (type) {
    case "overview":
      return FileText
    case "standard":
      return Shield
    case "role":
      return Users
    case "task-sheet":
      return Clipboard
    default:
      return BookOpen
  }
}

function getDocumentType(docId: string): string {
  if (docId.includes("overview")) return "overview"
  if (docId.includes("standards")) return "standard"
  if (docId.includes("roles")) return "role"
  if (docId.includes("task") || docId.includes("planning") || docId.includes("transitioning") || docId.includes("coordinating") || docId.includes("accessing") || docId.includes("attending") || docId.includes("using") || docId.includes("creating") || docId.includes("determining") || docId.includes("approving") || docId.includes("closing") || docId.includes("resource")) return "task-sheet"
  return "overview"
}

export function GroupDocumentsScreen({ subActivity, group, onNavigate }: GroupDocumentsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [textSizeOpen, setTextSizeOpen] = useState(false)
  const { scale: readerScale } = useReaderTextSize()

  const phaseId = group || "operations"
  const assignmentId = subActivity || "mass-care"
  const phaseLabel = phaseLabels[phaseId] || "Operations"
  const assignmentLabel = assignmentLabels[assignmentId] || "Mass Care"

  // Get documents for this phase
  const documentIds = getPhaseDocuments(phaseId)
  const documents = documentIds
    .map((id) => {
      const content = massCareContent[id]
      if (!content) return null
      return {
        id,
        title: content.title,
        summary: content.summary,
        type: content.type,
        readTime: content.readTime,
      }
    })
    .filter((doc) => doc !== null)

  // Filter by search
  const filtered = documents.filter(
    (doc) =>
      doc &&
      (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Group documents by type
  const groupedByType = {
    overview: filtered.filter((doc) => doc && getDocumentType(doc.id) === "overview"),
    standard: filtered.filter((doc) => doc && getDocumentType(doc.id) === "standard"),
    role: filtered.filter((doc) => doc && getDocumentType(doc.id) === "role"),
    "task-sheet": filtered.filter((doc) => doc && getDocumentType(doc.id) === "task-sheet"),
  }

  const sections = [
    { label: "Overview", key: "overview", docs: groupedByType.overview },
    { label: "Standards", key: "standard", docs: groupedByType.standard },
    { label: "Roles", key: "role", docs: groupedByType.role },
    { label: "Task Sheets", key: "task-sheet", docs: groupedByType["task-sheet"] },
  ].filter((section) => section.docs.length > 0)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate("doctrine", assignmentId)}
            className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
              {phaseLabel}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {filtered.length} documents
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
            placeholder="Search documents..."
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

      {/* Documents List */}
      <div
        className="flex-1 px-5 pb-6 space-y-6 reader-scope"
        style={{ ["--reader-scale" as any]: readerScale }}
      >
        {sections.map((section) => {
          const Icon = getDocumentIcon(section.key)
          return (
            <div key={section.key}>
              <h2 className="text-base font-extrabold text-interactive-deep mb-2 tracking-tight">
                {section.label}
              </h2>
              <div className="space-y-2">
                {section.docs.map((doc) => {
                  if (!doc) return null
                  const DocIcon = getDocumentIcon(getDocumentType(doc.id))
                  return (
                    <button
                      key={doc.id}
                      onClick={() => onNavigate("doctrine-detail", undefined, doc.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-4 rounded-xl text-left",
                        "bg-card border border-interactive-deep/20 shadow-sm",
                        "active:border-interactive-deep/40 active:bg-interactive-soft/10 active:scale-[0.99] transition-all duration-200",
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-interactive-soft/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <DocIcon className="w-5 h-5 text-interactive-deep" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="reader-body font-semibold text-foreground mb-1 leading-snug">
                          {doc.title}
                        </h3>
                        <p className="reader-small text-muted-foreground line-clamp-2 mb-2 leading-snug">
                          {doc.summary}
                        </p>
                        <span className="reader-small text-muted-foreground">{doc.readTime}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
