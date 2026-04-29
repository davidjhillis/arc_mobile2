"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import {
  ArrowLeft,
  Download,
  Check,
  BookmarkPlus,
  Bookmark,
  ChevronRight,
  Search,
  Sparkles,
  Flame,
  RefreshCw,
  X,
  Plus,
  PencilLine,
  UserCircle2,
  ListChecks,
  BookOpen,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"
import { massCareContent, type DoctrineContent } from "@/lib/mass-care-content"

interface FeedScreenProps {
  onNavigate: (screen: Screen, disasterType?: string, doctrineId?: string) => void
}

type DownloadState = "none" | "downloading" | "downloaded"
type ChangeKind = "new" | "updated" | "unchanged"

interface FeedItem {
  id: string
  title: string
  summary: string
  section: string
  type: DoctrineContent["type"]
  readTime: string
  lastUpdated: string
  publishedAt: number // ms timestamp — used for time grouping
  change: ChangeKind
  changeNote?: string // "Added Form 215 procedure", "v0.2 → v0.3"
  versionFrom?: string
  versionTo?: string
  reads: number // synthetic activity signal
  bookmarkers: number
}

const SECTION_LABELS: Record<string, string> = {
  "dat-regional-response": "DAT: Regional Response",
  "mass-care": "Mass Care",
  "client-care": "Client Care",
  workforce: "Workforce",
  logistics: "Logistics",
  "information-planning": "Information & Planning",
  "external-relations": "External Relations",
  "operations-management": "Operations Management",
}

const TYPE_LABEL: Record<DoctrineContent["type"], string> = {
  overview: "Overview",
  standard: "Standard",
  "task-sheet": "Task Sheet",
  role: "Role",
}

const TYPE_ICON: Record<DoctrineContent["type"], typeof FileText> = {
  overview: BookOpen,
  standard: FileText,
  "task-sheet": ListChecks,
  role: UserCircle2,
}

// Synthetic change notes — gives the demo realistic "what changed" copy.
const CHANGE_NOTE_POOL = [
  "Added Form 215 procedure",
  "Updated coordination steps",
  "Clarified handoff with Logistics",
  "Revised closing checklist",
  "New section: client privacy",
  "Updated reporting cadence",
  "Edited examples for accuracy",
  "Tightened roles section",
]

// Build a feed with synthetic but stable timestamps and activity signals.
function buildFeed(): FeedItem[] {
  const now = Date.now()
  const docs = Object.values(massCareContent)
  return docs.map((doc, idx) => {
    // Stagger items across time buckets so the demo feels like a live feed.
    // First few items: hours ago. Next: days. Next: a week+. Older: weeks.
    const minutesAgo =
      idx < 2
        ? 30 + idx * 90 // 30m, 2h
        : idx < 5
          ? 60 * (4 + idx * 4) // ~hours today
          : idx < 9
            ? 60 * 24 * (idx - 4) // 1–4 days
            : idx < 14
              ? 60 * 24 * (idx - 5) // ~a week+
              : 60 * 24 * (10 + (idx - 13) * 5) // older
    const publishedAt = now - minutesAgo * 60 * 1000

    // Change kind:
    // - First item is always brand-new
    // - Items 1–6 are updates with synthetic change notes
    // - Older items are unchanged (no badge)
    let change: ChangeKind = "unchanged"
    let changeNote: string | undefined
    let versionFrom: string | undefined
    let versionTo: string | undefined
    if (idx === 0) {
      change = "new"
    } else if (idx <= 6) {
      change = "updated"
      changeNote = CHANGE_NOTE_POOL[idx % CHANGE_NOTE_POOL.length]
      const major = Number.parseInt(doc.version?.split(".")[0] ?? "0", 10) || 0
      const minor = Number.parseInt(doc.version?.split(".")[1] ?? "1", 10) || 1
      versionFrom = `v${major}.${minor}`
      versionTo = `v${major}.${minor + 1}`
    }

    // Synthetic engagement — stable per index, larger numbers for newer items.
    const seed = (idx + 1) * 7
    const reads = Math.floor(40 + (seed * 13) % 320)
    const bookmarkers = Math.floor(2 + (seed * 3) % 18)

    return {
      id: doc.id,
      title: doc.title,
      summary: doc.summary,
      section: doc.subActivity || "mass-care",
      type: doc.type,
      readTime: doc.readTime,
      lastUpdated: doc.lastUpdated,
      publishedAt,
      change,
      changeNote,
      versionFrom,
      versionTo,
      reads,
      bookmarkers,
    }
  })
}

function timeAgo(ts: number, now: number): string {
  const sec = Math.max(0, Math.floor((now - ts) / 1000))
  if (sec < 60) return "Just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

type Bucket = "today" | "thisWeek" | "thisMonth" | "earlier"
const BUCKET_LABEL: Record<Bucket, string> = {
  today: "Today",
  thisWeek: "This week",
  thisMonth: "This month",
  earlier: "Earlier",
}

function bucketOf(ts: number, now: number): Bucket {
  const days = (now - ts) / (1000 * 60 * 60 * 24)
  if (days < 1) return "today"
  if (days < 7) return "thisWeek"
  if (days < 30) return "thisMonth"
  return "earlier"
}

type FilterChip =
  | { id: "all"; label: "All" }
  | { id: "new"; label: "New & Updated" }
  | { id: "yours"; label: "Your roles" }
  | { id: "trending"; label: "Trending" }
  | { id: "type"; label: "Task Sheets"; type: DoctrineContent["type"] }
  | { id: "type"; label: "Standards"; type: DoctrineContent["type"] }
  | { id: "type"; label: "Overviews"; type: DoctrineContent["type"] }
  | { id: "type"; label: "Roles"; type: DoctrineContent["type"] }

const CHIPS: FilterChip[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New & Updated" },
  { id: "trending", label: "Trending" },
  { id: "yours", label: "Your roles" },
  { id: "type", label: "Task Sheets", type: "task-sheet" },
  { id: "type", label: "Standards", type: "standard" },
  { id: "type", label: "Overviews", type: "overview" },
  { id: "type", label: "Roles", type: "role" },
]

// A doc qualifies as "trending" if its synthetic read count is in the top
// quartile of the feed. We compute the threshold once per feed render.
const TRENDING_TOP_N = 8

type ActiveChip = (typeof CHIPS)[number]

export function FeedScreen({ onNavigate }: FeedScreenProps) {
  const initialFeed = useMemo(() => buildFeed(), [])
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeChip, setActiveChip] = useState<ActiveChip>(CHIPS[0])

  // Persisted local state (downloads, saves, read history, user profile)
  const [downloadStates, setDownloadStates] = useState<Record<string, DownloadState>>({})
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const [readItems, setReadItems] = useState<Set<string>>(new Set())
  const [userServiceAreas, setUserServiceAreas] = useState<string[]>([])

  // Pull-to-refresh state
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pullPx, setPullPx] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const pullStart = useRef<number | null>(null)
  const PULL_THRESHOLD = 70

  // Track "now" in state so re-renders re-compute relative times consistently
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  // Hydrate persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("arc_saved_doctrines")
      if (saved) setSavedItems(new Set(JSON.parse(saved)))
      const read = localStorage.getItem("arc_read_doctrines")
      if (read) setReadItems(new Set(JSON.parse(read)))
      const dl = localStorage.getItem("arc_downloaded_doctrines")
      if (dl) {
        const ids: string[] = JSON.parse(dl)
        const map: Record<string, DownloadState> = {}
        ids.forEach((id) => (map[id] = "downloaded"))
        setDownloadStates(map)
      }
      const profile = localStorage.getItem("arc_profile")
      if (profile) {
        const p = JSON.parse(profile)
        if (Array.isArray(p.serviceAreas)) setUserServiceAreas(p.serviceAreas)
      }
    } catch {}
  }, [])

  const persistSaved = (ids: Set<string>) => {
    try {
      localStorage.setItem("arc_saved_doctrines", JSON.stringify([...ids]))
    } catch {}
  }
  const persistDownloads = (states: Record<string, DownloadState>) => {
    try {
      const downloaded = Object.entries(states)
        .filter(([, v]) => v === "downloaded")
        .map(([id]) => id)
      localStorage.setItem("arc_downloaded_doctrines", JSON.stringify(downloaded))
    } catch {}
  }

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (downloadStates[id] === "downloaded") return
    setDownloadStates((prev) => ({ ...prev, [id]: "downloading" }))
    setTimeout(() => {
      setDownloadStates((prev) => {
        const next = { ...prev, [id]: "downloaded" as DownloadState }
        persistDownloads(next)
        return next
      })
    }, 1200)
  }

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persistSaved(next)
      return next
    })
  }

  const openItem = (id: string) => {
    setReadItems((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem("arc_read_doctrines", JSON.stringify([...next]))
      } catch {}
      return next
    })
    onNavigate("doctrine-detail", undefined, id)
  }

  // ---- Personalization match ("Your roles") ----
  // We synthesize role match from the user's serviceAreas vs doc.section label.
  const matchesUserRoles = useCallback(
    (item: FeedItem) => {
      if (userServiceAreas.length === 0) return item.section === "mass-care"
      const sectionLabel = SECTION_LABELS[item.section] ?? ""
      return userServiceAreas.some((a) =>
        sectionLabel.toLowerCase().includes(a.toLowerCase())
      )
    },
    [userServiceAreas]
  )

  // Compute the trending set once — top N by reads, used by the chip filter.
  const trendingIds = useMemo(() => {
    const ids = [...feed]
      .sort((a, b) => b.reads - a.reads)
      .slice(0, TRENDING_TOP_N)
      .map((i) => i.id)
    return new Set(ids)
  }, [feed])

  // ---- Filtering ----
  const filtered = useMemo(() => {
    return feed.filter((item) => {
      // Active chip
      if (activeChip.id === "new" && item.change === "unchanged") return false
      if (activeChip.id === "trending" && !trendingIds.has(item.id)) return false
      if (activeChip.id === "yours" && !matchesUserRoles(item)) return false
      if (activeChip.id === "type" && "type" in activeChip && item.type !== activeChip.type) return false
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.summary.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [feed, activeChip, trendingIds, searchQuery, matchesUserRoles])

  // ---- Group by time bucket ----
  const grouped = useMemo(() => {
    const groups: Record<Bucket, FeedItem[]> = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      earlier: [],
    }
    filtered
      .slice()
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .forEach((item) => {
        groups[bucketOf(item.publishedAt, now)].push(item)
      })
    return groups
  }, [filtered, now])

  // ---- Activity ribbon stats ----
  const activityStats = useMemo(() => {
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const changedThisWeek = feed.filter(
      (i) => i.change !== "unchanged" && i.publishedAt >= weekAgo
    )
    const affectingYou = changedThisWeek.filter((i) => matchesUserRoles(i))
    return {
      changedThisWeek: changedThisWeek.length,
      affectingYou: affectingYou.length,
    }
  }, [feed, matchesUserRoles, now])

  // ---- Pull-to-refresh ----
  const onTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      pullStart.current = e.touches[0].clientY
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (pullStart.current == null) return
    const dy = e.touches[0].clientY - pullStart.current
    if (dy > 0) setPullPx(Math.min(dy * 0.5, 110))
  }
  const onTouchEnd = () => {
    if (pullStart.current == null) return
    pullStart.current = null
    if (pullPx >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullPx(60)
      setTimeout(() => {
        // "Refresh" — rebuild the feed (regenerates synthetic timestamps)
        setFeed(buildFeed())
        setNow(Date.now())
        setRefreshing(false)
        setPullPx(0)
      }, 900)
    } else {
      setPullPx(0)
    }
  }
  const triggerRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    setTimeout(() => {
      setFeed(buildFeed())
      setNow(Date.now())
      setRefreshing(false)
    }, 600)
  }

  // ---- Render helpers ----

  const ChangeBadge = ({ item }: { item: FeedItem }) => {
    if (item.change === "new") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold">
          <Plus className="w-2.5 h-2.5" aria-hidden /> New
        </span>
      )
    }
    if (item.change === "updated") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-interactive/10 text-interactive-deep text-[10px] font-semibold">
          <PencilLine className="w-2.5 h-2.5" aria-hidden /> Updated
        </span>
      )
    }
    return null
  }

  const ItemCard = ({ item }: { item: FeedItem }) => {
    const isRead = readItems.has(item.id)
    const isSaved = savedItems.has(item.id)
    const isDownloaded = downloadStates[item.id] === "downloaded"
    const isDownloading = downloadStates[item.id] === "downloading"
    const Icon = TYPE_ICON[item.type]
    const personal = matchesUserRoles(item)

    return (
      <button
        onClick={() => openItem(item.id)}
        className={cn(
          "w-full text-left rounded-2xl border transition",
          "active:scale-[0.99] hover:border-interactive/40",
          isRead
            ? "bg-card/70 border-border/70"
            : "bg-card border-border shadow-sm"
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-foreground" aria-hidden />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {TYPE_LABEL[item.type]}
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-[11px] text-muted-foreground truncate min-w-0 flex-1">
              {SECTION_LABELS[item.section] ?? item.section}
            </span>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {timeAgo(item.publishedAt, now)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <ChangeBadge item={item} />
            {personal && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-foreground text-[10px] font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-warning" aria-hidden /> Your roles
              </span>
            )}
            {!isRead && item.change === "unchanged" && (
              <span className="w-1.5 h-1.5 rounded-full bg-interactive" aria-label="Unread" />
            )}
          </div>

          <h3 className={cn("text-sm font-semibold leading-snug mb-1", isRead ? "text-foreground/85" : "text-foreground")}>
            {item.title}
          </h3>

          {item.change === "updated" && item.changeNote && (
            <p className="text-xs text-muted-foreground mb-1.5 inline-flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-interactive-deep">
                {item.versionFrom} → {item.versionTo}
              </span>
              <span aria-hidden>·</span>
              <span className="italic">{item.changeNote}</span>
            </p>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{item.summary}</p>

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => handleDownload(item.id, e)}
                disabled={isDownloading || isDownloaded}
                aria-label={isDownloaded ? "Downloaded" : "Save offline"}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition",
                  isDownloaded
                    ? "bg-success/10 text-success"
                    : isDownloading
                      ? "bg-muted text-muted-foreground"
                      : "bg-muted text-foreground active:scale-95"
                )}
              >
                {isDownloaded ? (
                  <Check className="w-4 h-4" />
                ) : isDownloading ? (
                  <div className="w-3.5 h-3.5 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => handleSave(item.id, e)}
                aria-label={isSaved ? "Remove bookmark" : "Bookmark"}
                aria-pressed={isSaved}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-95",
                  isSaved ? "bg-interactive/10 text-interactive" : "bg-muted text-foreground"
                )}
              >
                {isSaved ? <Bookmark className="w-4 h-4 fill-current" /> : <BookmarkPlus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </button>
    )
  }

  const buckets: Bucket[] = ["today", "thisWeek", "thisMonth", "earlier"]
  const totalResults = filtered.length

  return (
    <div className="flex flex-col min-h-full bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 pt-12 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => onNavigate("home")}
              aria-label="Back"
              className="w-10 h-10 rounded-full hover:bg-muted active:scale-95 flex items-center justify-center transition"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-foreground">Feed</h1>
            </div>
            <button
              onClick={triggerRefresh}
              aria-label="Refresh"
              className="w-10 h-10 rounded-full hover:bg-muted active:scale-95 flex items-center justify-center transition"
            >
              <RefreshCw className={cn("w-4 h-4 text-foreground", refreshing && "animate-spin")} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
            <input
              type="text"
              placeholder="Search the feed…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-full bg-muted text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-interactive/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-card"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sticky filter chips */}
          <div className="-mx-4 px-4 flex gap-2 overflow-x-auto touch-scroll pb-2" role="tablist" aria-label="Feed filters">
            {CHIPS.map((c, i) => {
              const isActive =
                c.id === "type" && "type" in c && activeChip.id === "type" && "type" in activeChip
                  ? c.type === activeChip.type
                  : c.id === activeChip.id
              return (
                <button
                  key={`${c.id}-${i}`}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveChip(c)}
                  className={cn(
                    "shrink-0 h-8 px-3 rounded-full text-[13px] font-medium transition",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Pull-to-refresh indicator */}
      <div
        className={cn(
          "flex items-center justify-center transition-all",
          pullPx > 0 || refreshing ? "opacity-100" : "opacity-0"
        )}
        style={{ height: pullPx }}
      >
        <RefreshCw
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            refreshing ? "animate-spin" : ""
          )}
          style={{ transform: !refreshing ? `rotate(${(pullPx / PULL_THRESHOLD) * 360}deg)` : undefined }}
          aria-hidden
        />
      </div>

      {/* Activity ribbon — tap to filter, then scroll to top */}
      {activityStats.changedThisWeek > 0 && (
        <div className="px-4 pt-2.5 pb-1">
          <button
            onClick={() => {
              setActiveChip(CHIPS.find((c) => c.id === "new")!)
              scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground active:scale-95 transition"
          >
            <Flame className="w-3.5 h-3.5 text-interactive shrink-0" aria-hidden />
            <span>
              <span className="font-semibold text-foreground">{activityStats.changedThisWeek}</span> changed this week
              {activityStats.affectingYou > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-interactive-deep">{activityStats.affectingYou} in your roles</span>
                </>
              )}
            </span>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
          </button>
        </div>
      )}

      {/* Time-grouped feed */}
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 px-4 pt-4 pb-8"
      >
        {totalResults === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">No matches</p>
            <p className="text-sm text-muted-foreground">
              Try a different filter or clear your search.
            </p>
          </div>
        ) : (
          buckets.map((b) => {
            const items = grouped[b]
            if (items.length === 0) return null
            return (
              <section key={b} className="mb-6">
                <div className="sticky top-[7.5rem] z-10 -mx-4 px-4 py-2 bg-muted/20 backdrop-blur-md mb-3 flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {BUCKET_LABEL[b]}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )
          })
        )}
        <p className="text-center text-[11px] text-muted-foreground pt-2 pb-4">
          You've seen everything · pull to refresh
        </p>
      </div>
    </div>
  )
}
