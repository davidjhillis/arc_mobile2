"use client"

import { useEffect, useMemo, useState } from "react"
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
  Sparkles,
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

const QUICK_PROMPTS = [
  "Who completes a Form 215?",
  "Brief me on closing shelter operations",
  "What changed for Mass Care this week?",
]

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

  // Sort: user's areas first, then alphabetical
  const orderedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const ax = isMyArea(a.label) ? 0 : 1
      const bx = isMyArea(b.label) ? 0 : 1
      if (ax !== bx) return ax - bx
      return a.label.localeCompare(b.label)
    })
  }, [profile.serviceAreas])

  const handleQuickPrompt = (q: string) => {
    try {
      localStorage.setItem("arc_initial_query", q)
    } catch {}
    onNavigate("ask")
  }

  return (
    <div className="flex flex-col min-h-full bg-background pb-6">
      {/* Hero — compact, one line */}
      <header className="flex items-center justify-between gap-3 px-5 pt-12 pb-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-[28px] leading-tight font-bold text-foreground tracking-tight truncate">
            {profile.name}
          </h1>
        </div>
        <button
          onClick={() => onNavigate("profile")}
          aria-label="Open profile"
          className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-card shadow-sm active:scale-95 transition shrink-0"
        >
          <img src={avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
        </button>
      </header>

      {/* Search bar */}
      <div className="px-5">
        <button
          onClick={() => onNavigate("ask")}
          className="w-full flex items-center gap-3 h-12 px-4 rounded-full bg-muted active:scale-[0.99] hover:bg-muted/70 transition"
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
          <span className="flex-1 text-left text-muted-foreground text-[15px]">
            Search doctrine or ask a question
          </span>
        </button>
      </div>

      {/* Quick prompts — chips on the page, no card frame */}
      <div className="px-5 mt-3 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            onClick={() => handleQuickPrompt(q)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-card border border-border text-[12px] font-medium text-foreground hover:border-interactive/40 hover:bg-interactive-soft/30 active:scale-95 transition"
          >
            <Sparkles className="w-3 h-3 text-interactive" aria-hidden />
            {q}
          </button>
        ))}
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

      {/* Assignments — single grid, "Your area" mark on the user's */}
      <section className="px-5 mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Browse by assignment
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {orderedAssignments.map((item) => {
            const Icon = item.icon
            const mine = isMyArea(item.label)
            return (
              <button
                key={item.id}
                onClick={() => onNavigate("doctrine", item.id)}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition active:scale-[0.98]",
                  mine
                    ? "bg-card border border-interactive/30 hover:border-interactive/50"
                    : "bg-card border border-border hover:border-interactive/30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    mine ? "bg-interactive/10" : "bg-muted"
                  )}
                >
                  <Icon className={cn("w-4 h-4", mine ? "text-interactive" : "text-foreground")} />
                </div>
                <p className="text-[13px] font-semibold text-foreground leading-snug min-w-0 truncate">
                  {item.label}
                </p>
                {mine && (
                  <span
                    className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-interactive"
                    aria-label="Your area"
                  />
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
