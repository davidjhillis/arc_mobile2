"use client"

import React, { useState, useMemo } from "react"
import {
  ArrowLeft,
  Download,
  Check,
  BookmarkPlus,
  Bookmark,
  Clock,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"
import { massCareContent } from "@/lib/mass-care-content"

interface FeedScreenProps {
  onNavigate: (screen: Screen, disasterType?: string) => void
}

type DownloadState = "none" | "downloading" | "downloaded"

interface FeedItem {
  id: string
  title: string
  summary: string
  section: string
  type: "overview" | "standard" | "task-sheet" | "role"
  readTime: string
  lastUpdated: string
  isNew: boolean
}

// Content sections (assignments)
const contentSections = [
  { id: "dat-regional-response", label: "DAT: Regional Response" },
  { id: "mass-care", label: "Mass Care" },
  { id: "client-care", label: "Client Care" },
  { id: "workforce", label: "Workforce" },
  { id: "logistics", label: "Logistics" },
  { id: "information-planning", label: "Information & Planning" },
  { id: "external-relations", label: "External Relations" },
  { id: "operations-management", label: "Operations Management" },
]

// Content types
const contentTypes = [
  { id: "overview", label: "Overview" },
  { id: "standard", label: "Standard" },
  { id: "role", label: "Role" },
  { id: "task-sheet", label: "Task Sheet" },
]

// Convert massCareContent to feed items
function getFeedItems(): FeedItem[] {
  return Object.values(massCareContent).map((doc) => ({
    id: doc.id,
    title: doc.title,
    summary: doc.summary,
    section: doc.subActivity || "mass-care",
    type: doc.type,
    readTime: doc.readTime,
    lastUpdated: doc.lastUpdated,
    isNew: doc.lastUpdated.includes("2025") || doc.version === "0.x", // Mark recent items as new
  }))
}

const filterTabs = ["All", "New", "Downloaded", "Saved"]

export function FeedScreen({ onNavigate }: FeedScreenProps) {
  // Memoize feed items to prevent re-computation on every render (hydration safety)
  const feedItems = useMemo(() => getFeedItems(), [])
  
  const [downloadStates, setDownloadStates] = useState<Record<string, DownloadState>>({})
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (downloadStates[id] === "downloaded") return

    setDownloadStates((prev) => ({ ...prev, [id]: "downloading" }))
    setTimeout(() => {
      setDownloadStates((prev) => ({ ...prev, [id]: "downloaded" }))
    }, 1500)
  }

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredItems = feedItems
    .filter((item) => {
      // Filter by active tab
      if (activeFilter === "New") return item.isNew
      if (activeFilter === "Downloaded") return downloadStates[item.id] === "downloaded"
      if (activeFilter === "Saved") return savedItems.has(item.id)
      return true
    })
    .filter((item) => {
      // Filter by section
      if (selectedSection && item.section !== selectedSection) return false
      return true
    })
    .filter((item) => {
      // Filter by type
      if (selectedType && item.type !== selectedType) return false
      return true
    })
    .filter((item) => {
      // Filter by search query
      if (!searchQuery) return true
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })

  return (
    <div className="flex flex-col min-h-full bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 pt-12 pb-3">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => onNavigate("home")}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">Doctrine Update</h1>
              <p className="text-xs text-muted-foreground">Personalized for your roles</p>
            </div>
            {/* Filter button removed - now using expandable section below */}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search doctrine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-3">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  activeFilter === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Expandable Filter Section */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-xl mb-3 transition-all",
              "bg-muted/50 border border-border/50",
              "active:scale-[0.99]",
              showFilters && "bg-muted border-border",
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters</span>
              {(selectedSection || selectedType) && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {(selectedSection ? 1 : 0) + (selectedType ? 1 : 0)}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                showFilters && "rotate-180",
              )}
            />
          </button>

          {/* Taxonomy Filters */}
          {showFilters && (
            <div className="space-y-3 pt-3 border-t border-border/50 pb-3">
              {/* Section Filter */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Content Section
                </label>
                <div className="flex flex-wrap gap-2">
                  {contentSections.map((section) => {
                    const isSelected = selectedSection === section.id
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(isSelected ? null : section.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80",
                        )}
                      >
                        {section.label}
                        {isSelected && <X className="w-3 h-3 inline-block ml-1.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Content Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => {
                    const isSelected = selectedType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(isSelected ? null : type.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80",
                        )}
                      >
                        {type.label}
                        {isSelected && <X className="w-3 h-3 inline-block ml-1.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedSection || selectedType) && (
                <button
                  onClick={() => {
                    setSelectedSection(null)
                    setSelectedType(null)
                  }}
                  className="text-xs text-interactive font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filteredItems.map((item) => {
          const downloadState = downloadStates[item.id] || "none"
          const isSaved = savedItems.has(item.id)
          const sectionLabel = contentSections.find((s) => s.id === item.section)?.label || item.section
          const typeLabel = contentTypes.find((t) => t.id === item.type)?.label || item.type

          return (
            <button
              key={item.id}
              onClick={() => onNavigate("doctrine-detail", undefined, item.id)}
              className={cn(
                "w-full bg-card border border-border/50 rounded-2xl p-4 text-left",
                "active:scale-[0.99] transition-all duration-200",
                "shadow-sm",
              )}
            >
              {/* Top row: tags */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded-full">
                  {sectionLabel}
                </span>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {typeLabel}
                </span>
                {item.isNew && (
                  <span className="text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
                {downloadState === "downloaded" && (
                  <span className="text-xs font-medium bg-interactive/10 text-interactive-deep px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Offline
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Clock className="w-3 h-3" />
                  {item.readTime}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>

              {/* Summary */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{item.summary}</p>

              {/* Bottom row: last updated + actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Updated {item.lastUpdated}</span>
                <div className="flex items-center gap-2">
                  {/* Download button */}
                  <button
                    onClick={(e) => handleDownload(item.id, e)}
                    disabled={downloadState === "downloading"}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      downloadState === "downloaded"
                        ? "bg-success/10 text-success"
                        : downloadState === "downloading"
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted text-foreground active:scale-95",
                    )}
                  >
                    {downloadState === "downloaded" ? (
                      <Check className="w-4 h-4" />
                    ) : downloadState === "downloading" ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={(e) => handleSave(item.id, e)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95",
                      isSaved ? "bg-interactive/10 text-interactive" : "bg-muted text-foreground",
                    )}
                  >
                    {isSaved ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
                  </button>

                  {/* View arrow */}
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </button>
          )
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No doctrine found</p>
          </div>
        )}
      </div>
    </div>
  )
}
