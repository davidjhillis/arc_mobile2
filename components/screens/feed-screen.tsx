"use client"

import type React from "react"

import { useState } from "react"
import {
  ArrowLeft,
  Download,
  Check,
  BookmarkPlus,
  Bookmark,
  Clock,
  Flame,
  CloudRain,
  Wind,
  Snowflake,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface FeedScreenProps {
  onNavigate: (screen: Screen, disasterType?: string) => void
}

type DownloadState = "none" | "downloading" | "downloaded"

interface FeedItem {
  id: number
  title: string
  summary: string
  category: string
  disasterType: string
  readTime: string
  isNew: boolean
  relevance: string
}

const feedItems: FeedItem[] = [
  {
    id: 1,
    title: "Shelter Registration Process",
    summary:
      "Complete workflow for registering evacuees at emergency shelters including intake procedures and documentation.",
    category: "Mass Care",
    disasterType: "fire",
    readTime: "8 min",
    isNew: true,
    relevance: "Shelter Manager",
  },
  {
    id: 2,
    title: "Bulk Feeding Operations",
    summary:
      "Guidelines for setting up large-scale feeding operations during disaster response with food safety protocols.",
    category: "Feeding",
    disasterType: "storm",
    readTime: "12 min",
    isNew: true,
    relevance: "Feeding Lead",
  },
  {
    id: 3,
    title: "Client Casework Essentials",
    summary: "Core principles for conducting effective client casework interviews and resource allocation.",
    category: "Client Care",
    disasterType: "flood",
    readTime: "10 min",
    isNew: false,
    relevance: "All Volunteers",
  },
  {
    id: 4,
    title: "Wildfire Evacuation Procedures",
    summary: "Critical protocols for managing evacuations during wildfire events including communication strategies.",
    category: "Evacuation",
    disasterType: "fire",
    readTime: "15 min",
    isNew: false,
    relevance: "Service Associate",
  },
  {
    id: 5,
    title: "Warming Center Operations",
    summary: "Complete guide to establishing warming centers during winter emergencies with safety protocols.",
    category: "Sheltering",
    disasterType: "winter",
    readTime: "9 min",
    isNew: true,
    relevance: "Seasonal",
  },
  {
    id: 6,
    title: "Spiritual Care First Contact",
    summary: "Guidelines for providing emotional and spiritual support to disaster survivors with sensitivity.",
    category: "Spiritual Care",
    disasterType: "storm",
    readTime: "7 min",
    isNew: false,
    relevance: "Service Associate",
  },
]

const disasterIcons: Record<string, typeof Flame> = {
  fire: Flame,
  flood: CloudRain,
  storm: Wind,
  winter: Snowflake,
}

const filterTabs = ["All", "New", "Downloaded", "Saved"]

export function FeedScreen({ onNavigate }: FeedScreenProps) {
  const [downloadStates, setDownloadStates] = useState<Record<number, DownloadState>>({
    3: "downloaded", // Pre-downloaded item
  })
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set([3]))
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const handleDownload = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (downloadStates[id] === "downloaded") return

    setDownloadStates((prev) => ({ ...prev, [id]: "downloading" }))
    setTimeout(() => {
      setDownloadStates((prev) => ({ ...prev, [id]: "downloaded" }))
    }, 1500)
  }

  const handleSave = (id: number, e: React.MouseEvent) => {
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
      if (activeFilter === "New") return item.isNew
      if (activeFilter === "Downloaded") return downloadStates[item.id] === "downloaded"
      if (activeFilter === "Saved") return savedItems.has(item.id)
      return true
    })
    .filter((item) => {
      if (!searchQuery) return true
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h1 className="text-lg font-semibold text-foreground">Doctrine Feed</h1>
              <p className="text-xs text-muted-foreground">Personalized for your roles</p>
            </div>
            <button className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-all">
              <Filter className="w-5 h-5 text-foreground" />
            </button>
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
          <div className="flex gap-2">
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
        </div>
      </header>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filteredItems.map((item) => {
          const Icon = disasterIcons[item.disasterType] || Flame
          const downloadState = downloadStates[item.id] || "none"
          const isSaved = savedItems.has(item.id)

          return (
            <button
              key={item.id}
              onClick={() => onNavigate("doctrine", item.disasterType)}
              className={cn(
                "w-full bg-card border border-border/50 rounded-2xl p-4 text-left",
                "active:scale-[0.99] transition-all duration-200",
                "shadow-sm",
              )}
            >
              {/* Top row: tags */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Icon className="w-3 h-3" />
                  {item.category}
                </span>
                {item.isNew && (
                  <span className="text-xs font-medium bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
                {downloadState === "downloaded" && (
                  <span className="text-xs font-medium bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
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

              {/* Bottom row: relevance + actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary/70">{item.relevance}</span>
                <div className="flex items-center gap-2">
                  {/* Download button */}
                  <button
                    onClick={(e) => handleDownload(item.id, e)}
                    disabled={downloadState === "downloading"}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      downloadState === "downloaded"
                        ? "bg-emerald-500/10 text-emerald-600"
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
                      isSaved ? "bg-primary/10 text-primary" : "bg-muted text-foreground",
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
