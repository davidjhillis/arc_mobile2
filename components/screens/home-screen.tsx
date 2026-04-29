"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Bed,
  Stethoscope,
  Users,
  Truck,
  BarChart,
  Handshake,
  Briefcase,
  HardHat,
  ChevronRight,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"
import { massCareContent } from "@/lib/mass-care-content"

interface HomeScreenProps {
  onNavigate: (screen: Screen, disasterType?: string, doctrineId?: string, group?: string) => void
}

const assignments = [
  { id: "mass-care", icon: Bed, label: "Mass Care" },
  { id: "client-care", icon: Stethoscope, label: "Client Care" },
  { id: "workforce", icon: Users, label: "Workforce" },
  { id: "logistics", icon: Truck, label: "Logistics" },
  { id: "dat-regional-response", icon: HardHat, label: "DAT: Regional Response" },
  { id: "information-planning", icon: BarChart, label: "Information & Planning" },
  { id: "external-relations", icon: Handshake, label: "External Relations" },
  { id: "operations-management", icon: Briefcase, label: "Operations Management" },
]

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=facearea&facepad=2.2&auto=format&q=80"

const defaultProfile = {
  name: "Sarah",
  fullName: "Sarah Johnson",
  serviceAreas: ["Mass Care", "Feeding"],
}

function dayLabel(d: Date, now: Date): string {
  const diff = (now.getTime() - d.getTime()) / 86_400_000
  if (diff < 1) return "earlier today"
  if (diff < 2) return "yesterday"
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: "long" })
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [profile, setProfile] = useState(defaultProfile)
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR)
  const [readIds, setReadIds] = useState<string[]>([])
  const [lastVisit, setLastVisit] = useState<Date | null>(null)

  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem("arc_profile")
      if (rawProfile) {
        const p = JSON.parse(rawProfile)
        setProfile((curr) => ({
          name: p.name?.split(" ")[0] || curr.name,
          fullName: p.name || curr.fullName,
          serviceAreas: Array.isArray(p.serviceAreas) ? p.serviceAreas : curr.serviceAreas,
        }))
      }
      const rawAvatar = localStorage.getItem("arc_profile_avatar")
      if (rawAvatar) setAvatarUrl(rawAvatar)
      const rawRead = localStorage.getItem("arc_read_doctrines")
      if (rawRead) setReadIds(JSON.parse(rawRead))
      const rawVisit = localStorage.getItem("arc_last_visit")
      if (rawVisit) setLastVisit(new Date(rawVisit))
      localStorage.setItem("arc_last_visit", new Date().toISOString())

    } catch {}
  }, [])

  const continueReading = useMemo(() => {
    if (readIds.length === 0) return []
    return readIds
      .slice(-3)
      .reverse()
      .map((id) => massCareContent[id])
      .filter(Boolean)
      .slice(0, 2)
  }, [readIds])

  const activitySince = useMemo(() => {
    if (!lastVisit) return null
    const now = new Date()
    const hours = (now.getTime() - lastVisit.getTime()) / 3_600_000
    if (hours < 1) return null
    const changed = hours < 24 ? 2 : Math.min(8, Math.max(3, Math.floor(hours / 24) + 2))
    return { changed, since: dayLabel(lastVisit, now) }
  }, [lastVisit])

  const isMyArea = (label: string) =>
    profile.serviceAreas.some((sa) => label.toLowerCase().includes(sa.toLowerCase()))

  const myAssignments = useMemo(
    () => assignments.filter((a) => isMyArea(a.label)),
    [profile.serviceAreas]
  )
  const otherAssignments = useMemo(
    () => assignments.filter((a) => !isMyArea(a.label)),
    [profile.serviceAreas]
  )

  // Recommended for you — up to 3 unread docs from the user's service
  // areas, preferring task-sheets (the actionable kind).
  const recommended = useMemo(() => {
    const readSet = new Set(readIds)
    return Object.values(massCareContent)
      .filter((d) => !readSet.has(d.id))
      .filter((d) => profile.serviceAreas.some((sa) => d.category.toLowerCase().includes(sa.toLowerCase())))
      .sort((a, b) => {
        const ax = a.type === "task-sheet" ? 0 : 1
        const bx = b.type === "task-sheet" ? 0 : 1
        return ax - bx
      })
      .slice(0, 3)
  }, [readIds, profile.serviceAreas])

  // Carousel: track which recommended card is currently centered, plus
  // which card the user has tapped to expand (one at a time).
  const recCarouselRef = useRef<HTMLDivElement>(null)
  const recCardRefs = useRef<Array<HTMLDivElement | null>>([])
  const [activeRec, setActiveRec] = useState(0)
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null)

  // Lightweight preview from the underlying doctrine content — same shape
  // as the feed expand pattern.
  const buildRecPreview = (id: string): { lead: string; bullets: string[] } => {
    const doc = massCareContent[id]
    if (!doc) return { lead: "", bullets: [] }
    const lines = doc.content.split("\n").map((l) => l.trim())
    let lead = ""
    for (const line of lines) {
      if (!line) continue
      if (/^#{1,6}\s/.test(line)) continue
      if (/^[-*]\s/.test(line)) continue
      lead = line.replace(/\*\*(.+?)\*\*/g, "$1")
      break
    }
    const bullets: string[] = []
    let inList = false
    for (const line of lines) {
      const isBullet = /^[-*]\s+/.test(line)
      if (isBullet) {
        inList = true
        bullets.push(line.replace(/^[-*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1"))
        if (bullets.length >= 3) break
      } else if (inList && !line) {
        if (bullets.length > 0) break
      }
    }
    return { lead, bullets }
  }

  useEffect(() => {
    const carousel = recCarouselRef.current
    if (!carousel || recommended.length <= 1) return
    const handler = () => {
      const center = carousel.scrollLeft + carousel.clientWidth / 2
      let bestIdx = 0
      let bestDist = Infinity
      recCardRefs.current.forEach((el, i) => {
        if (!el) return
        const cardCenter = el.offsetLeft + el.offsetWidth / 2
        const dist = Math.abs(cardCenter - center)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      })
      setActiveRec(bestIdx)
    }
    carousel.addEventListener("scroll", handler, { passive: true })
    return () => carousel.removeEventListener("scroll", handler)
  }, [recommended.length])

  const scrollToRec = (idx: number) => {
    const card = recCardRefs.current[idx]
    if (card && recCarouselRef.current) {
      recCarouselRef.current.scrollTo({
        left: card.offsetLeft - 20, // px-5 padding
        behavior: "smooth",
      })
    }
  }

  // Click-and-drag horizontal scrolling for desktop (mouse can't natively
  // scroll horizontally). Touch users keep the native swipe behavior.
  const dragState = useRef({ active: false, startX: 0, startScroll: 0, moved: false })

  const onCarouselMouseDown = (e: React.MouseEvent) => {
    const el = recCarouselRef.current
    if (!el) return
    dragState.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    }
    el.style.scrollSnapType = "none" // disable snap mid-drag for smoothness
  }

  const onCarouselMouseMove = (e: React.MouseEvent) => {
    const el = recCarouselRef.current
    const s = dragState.current
    if (!s.active || !el) return
    const dx = e.clientX - s.startX
    if (Math.abs(dx) > 4) s.moved = true
    el.scrollLeft = s.startScroll - dx
  }

  const onCarouselMouseEnd = () => {
    const el = recCarouselRef.current
    if (!el) return
    if (dragState.current.active) {
      el.style.scrollSnapType = "x mandatory"
      const dragDelta = el.scrollLeft - dragState.current.startScroll
      const last = recCardRefs.current.length - 1
      requestAnimationFrame(() => {
        // Loop: if user dragged forward and was already at the last card,
        // wrap to the first. Same in reverse from the first card.
        const FORWARD_INTENT = 30
        if (activeRec === last && dragDelta > FORWARD_INTENT) {
          scrollToRec(0)
          return
        }
        if (activeRec === 0 && dragDelta < -FORWARD_INTENT) {
          scrollToRec(last)
          return
        }
        // Otherwise: snap to nearest
        const center = el.scrollLeft + el.clientWidth / 2
        let bestIdx = 0
        let bestDist = Infinity
        recCardRefs.current.forEach((card, i) => {
          if (!card) return
          const cardCenter = card.offsetLeft + card.offsetWidth / 2
          const d = Math.abs(cardCenter - center)
          if (d < bestDist) {
            bestDist = d
            bestIdx = i
          }
        })
        scrollToRec(bestIdx)
      })
    }
    dragState.current.active = false
  }

  // Suppress card-click when the user just finished a drag.
  const onCardClickGuard = (e: React.MouseEvent, then: () => void) => {
    if (dragState.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    then()
  }

  return (
    <div className="flex flex-col min-h-full bg-background pb-6">
      {/* Hero — page title is the function; greeting demoted to subtitle */}
      <header className="flex items-end justify-between gap-3 px-5 pt-12 pb-4">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-bold text-foreground tracking-tight">
            Doctrine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            Welcome back, {profile.name}
          </p>
        </div>
        <button
          onClick={() => onNavigate("profile")}
          aria-label="Open profile"
          className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-card shadow-sm active:scale-95 transition shrink-0"
        >
          <img src={avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
        </button>
      </header>

      {/* Search bar — placeholder shows by example what's possible */}
      <div className="px-5">
        <button
          onClick={() => onNavigate("ask")}
          className="w-full flex items-center gap-3 h-12 px-4 rounded-full bg-muted active:scale-[0.99] hover:bg-muted/70 transition"
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
          <span className="flex-1 text-left text-muted-foreground text-[15px] truncate">
            Ask a question or search procedures
          </span>
        </button>
      </div>

      {/* Activity — single inline line, optional */}
      {activitySince && (
        <button
          onClick={() => onNavigate("feed")}
          className="mx-5 mt-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground active:scale-95 self-start"
        >
          <span className="font-semibold text-foreground">{activitySince.changed}</span>
          <span>changed since {activitySince.since}</span>
          <ChevronRight className="w-3 h-3" aria-hidden />
        </button>
      )}

      {/* Continue reading — minimal list, no outer card */}
      {continueReading.length > 0 && (
        <section className="px-5 mt-6" aria-labelledby="continue-heading">
          <h2 id="continue-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Continue reading
          </h2>
          <div className="space-y-1">
            {continueReading.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onNavigate("doctrine-detail", undefined, doc.id)}
                className="w-full flex items-center gap-3 py-2 text-left hover:bg-muted/50 active:bg-muted rounded-xl px-2 -mx-2 transition"
              >
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden />
                <p className="flex-1 text-sm text-foreground truncate">{doc.title}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recommended for you — swipeable carousel of up to 3 unread docs from your areas */}
      {recommended.length > 0 && (
        <section className="mt-6" aria-labelledby="recommended-heading">
          <h2
            id="recommended-heading"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-5"
          >
            Recommended for you
          </h2>
          <div
            ref={recCarouselRef}
            onMouseDown={onCarouselMouseDown}
            onMouseMove={onCarouselMouseMove}
            onMouseUp={onCarouselMouseEnd}
            onMouseLeave={onCarouselMouseEnd}
            className="flex gap-3 overflow-x-auto touch-scroll snap-x snap-mandatory px-5 pb-2 items-start cursor-grab active:cursor-grabbing select-none"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {recommended.map((doc, i) => {
              const expanded = expandedRecId === doc.id
              const preview = expanded ? buildRecPreview(doc.id) : null
              return (
                <div
                  key={doc.id}
                  ref={(el) => {
                    recCardRefs.current[i] = el
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => onCardClickGuard(e, () => setExpandedRecId(expanded ? null : doc.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setExpandedRecId(expanded ? null : doc.id)
                    }
                  }}
                  className={cn(
                    "snap-start shrink-0 w-[calc(100%-2.5rem)] cursor-pointer rounded-2xl bg-card border p-4 transition",
                    expanded
                      ? "border-interactive/50 shadow-md"
                      : "border-border hover:border-interactive/40 active:scale-[0.99]"
                  )}
                  style={{ scrollSnapAlign: "start" }}
                >
                  <p className="text-sm font-semibold text-foreground leading-snug mb-1">{doc.title}</p>
                  <p
                    className={cn(
                      "text-xs text-muted-foreground",
                      expanded ? "" : "line-clamp-2"
                    )}
                  >
                    {doc.summary}
                  </p>

                  {expanded && preview && (
                    <div className="mt-3 pt-3 border-t border-border/60 space-y-2.5">
                      {preview.lead && (
                        <p className="text-[13px] text-foreground/90 leading-relaxed">{preview.lead}</p>
                      )}
                      {preview.bullets.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1 text-[12.5px] text-foreground/90">
                          {preview.bullets.map((b, bi) => (
                            <li key={bi}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                    <span>
                      {doc.category} · {doc.readTime}
                    </span>
                    {expanded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigate("doctrine-detail", undefined, doc.id)
                        }}
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-foreground text-background text-xs font-semibold active:scale-95 transition"
                      >
                        Open article
                        <ChevronRight className="w-3 h-3" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {recommended.length > 1 && (
            <div
              className="flex items-center justify-center gap-1.5 mt-2"
              role="tablist"
              aria-label="Recommended pagination"
            >
              {recommended.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={activeRec === i}
                  aria-label={`Go to recommendation ${i + 1}`}
                  onClick={() => scrollToRec(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    activeRec === i
                      ? "w-5 bg-interactive"
                      : "w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/60"
                  )}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Your assignments */}
      {myAssignments.length > 0 && (
        <section className="px-5 mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Your assignments
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {myAssignments.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate("doctrine", item.id)}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left bg-card border border-interactive/30 hover:border-interactive/50 active:scale-[0.98] transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-interactive/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-interactive" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-snug min-w-0 truncate">
                    {item.label}
                  </p>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* All other assignments */}
      <section className="px-5 mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {myAssignments.length > 0 ? "All assignments" : "Browse by assignment"}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {otherAssignments.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate("doctrine", item.id)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left bg-card border border-border hover:border-interactive/30 active:scale-[0.98] transition"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground leading-snug min-w-0 truncate">
                  {item.label}
                </p>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
