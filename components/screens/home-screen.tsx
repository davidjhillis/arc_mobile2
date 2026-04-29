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

  // Carousel: track which recommended card is currently centered
  const recCarouselRef = useRef<HTMLDivElement>(null)
  const recCardRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([])
  const [activeRec, setActiveRec] = useState(0)

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
            className="flex gap-3 overflow-x-auto touch-scroll snap-x snap-mandatory px-5 pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {recommended.map((doc, i) => (
              <button
                key={doc.id}
                ref={(el) => {
                  recCardRefs.current[i] = el
                }}
                onClick={() => onNavigate("doctrine-detail", undefined, doc.id)}
                className="snap-start shrink-0 w-[calc(100%-2.5rem)] text-left rounded-2xl bg-card border border-border p-4 hover:border-interactive/40 active:scale-[0.99] transition"
                style={{ scrollSnapAlign: "start" }}
              >
                <p className="text-sm font-semibold text-foreground leading-snug mb-1">{doc.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.summary}</p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                  <span>
                    {doc.category} · {doc.readTime}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-interactive font-semibold">
                    Read <ChevronRight className="w-3 h-3" aria-hidden />
                  </span>
                </div>
              </button>
            ))}
          </div>
          {recommended.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2" role="tablist" aria-label="Recommended pagination">
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
                    activeRec === i ? "w-5 bg-interactive" : "w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/60"
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
