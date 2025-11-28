"use client"

import { useState } from "react"
import { ArrowLeft, Download, Trash2, Check, Clock, Flame, CloudRain, Wind, WifiOff, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface DownloadsScreenProps {
  onNavigate: (screen: Screen) => void
}

interface DownloadedItem {
  id: number
  title: string
  category: string
  disasterType: string
  readTime: string
  downloadedAt: string
  size: string
}

const downloadedItems: DownloadedItem[] = [
  {
    id: 1,
    title: "Shelter Registration Process",
    category: "Mass Care",
    disasterType: "fire",
    readTime: "8 min",
    downloadedAt: "Today",
    size: "2.4 MB",
  },
  {
    id: 2,
    title: "Bulk Feeding Operations",
    category: "Feeding",
    disasterType: "storm",
    readTime: "12 min",
    downloadedAt: "Today",
    size: "3.1 MB",
  },
  {
    id: 3,
    title: "Client Casework Essentials",
    category: "Client Care",
    disasterType: "flood",
    readTime: "10 min",
    downloadedAt: "Yesterday",
    size: "2.8 MB",
  },
]

const availableForDownload: DownloadedItem[] = [
  {
    id: 4,
    title: "Wildfire Evacuation Procedures",
    category: "Evacuation",
    disasterType: "fire",
    readTime: "15 min",
    downloadedAt: "",
    size: "4.2 MB",
  },
  {
    id: 5,
    title: "Warming Center Operations",
    category: "Sheltering",
    disasterType: "winter",
    readTime: "9 min",
    downloadedAt: "",
    size: "2.1 MB",
  },
]

const disasterIcons: Record<string, typeof Flame> = {
  fire: Flame,
  flood: CloudRain,
  storm: Wind,
  winter: Wind,
}

export function DownloadsScreen({ onNavigate }: DownloadsScreenProps) {
  const [downloads, setDownloads] = useState(downloadedItems)
  const [downloading, setDownloading] = useState<Set<number>>(new Set())

  const handleDelete = (id: number) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDownload = (item: DownloadedItem) => {
    setDownloading((prev) => new Set(prev).add(item.id))
    setTimeout(() => {
      setDownloading((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
      setDownloads((prev) => [...prev, { ...item, downloadedAt: "Just now" }])
    }, 2000)
  }

  const totalSize = downloads.reduce((acc, item) => acc + Number.parseFloat(item.size), 0).toFixed(1)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate("profile")}
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-medium text-foreground">Offline Content</h1>
            <p className="text-xs text-muted-foreground">{downloads.length} items saved</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10">
            <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600">Available offline</span>
          </div>
        </div>

        {/* Storage info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{totalSize} MB used</p>
            <p className="text-xs text-muted-foreground">{downloads.length} doctrine documents</p>
          </div>
        </div>
      </header>

      {/* Downloaded items */}
      <section className="px-5 pb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Downloaded</h2>
        <div className="space-y-2">
          {downloads.map((item) => {
            const Icon = disasterIcons[item.disasterType] || Flame
            return (
              <div
                key={item.id}
                className={cn("flex items-center gap-3 p-4 rounded-xl", "bg-card border border-border")}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className="w-3 h-3" />
                      {item.category}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{item.size}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center active:scale-95 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recommended downloads */}
      <section className="px-5 pb-8">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Recommended for Download
        </h2>
        <div className="space-y-2">
          {availableForDownload
            .filter((item) => !downloads.find((d) => d.id === item.id))
            .map((item) => {
              const Icon = disasterIcons[item.disasterType] || Flame
              const isDownloading = downloading.has(item.id)
              return (
                <div
                  key={item.id}
                  className={cn("flex items-center gap-3 p-4 rounded-xl", "bg-card border border-border")}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {item.readTime}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{item.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(item)}
                    disabled={isDownloading}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      "active:scale-95 transition-all",
                      isDownloading ? "bg-muted" : "bg-primary/10",
                    )}
                  >
                    {isDownloading ? (
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 text-primary" />
                    )}
                  </button>
                </div>
              )
            })}
        </div>
      </section>
    </div>
  )
}
