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
  Flame,
  ChevronDown,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"
import { massCareContent } from "@/lib/mass-care-content"

interface HomeScreenProps {
  onNavigate: (screen: Screen, disasterType?: string, doctrineId?: string, group?: string) => void
}

// Master list of assignments (the high-level groupings volunteers identify with).
const assignments = [
  { id: "mass-care", icon: Bed, label: "Mass Care", description: "Shelter and community services" },
  { id: "client-care", icon: Stethoscope, label: "Client Care", description: "Health, mental health, spiritual" },
  { id: "workforce", icon: Users, label: "Workforce", description: "Services for deployed responders" },
  { id: "logistics", icon: Truck, label: "Logistics", description: "Material, facility, equipment" },
  { id: "dat-regional-response", icon: HardHat, label: "DAT: Regional Response", description: "Regional response" },
  { id: "information-planning", icon: BarChart, label: "Information & Planning", description: "Assessment & ops data" },
  { id: "external-relations", icon: Handshake, label: "External Relations", description: "Government & partners" },
  { id: "operations-management", icon: Briefcase, label: "Operations Management", description: "DRO oversight" },
]

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=facearea&facepad=2.2&auto=format&q=80"

// Suggested AI prompts on the home screen — each one is known to surface
// real doctrine and demonstrates a different kind of question.
const QUICK_PROMPTS = [
  "Who completes a Form 215?",
  "Brief me on closing shelter operations",
  "What changed for Mass Care this week?",
]

// Fallback profile if nothing is in localStorage yet
const defaultProfile = {
  name: "Sarah",
  fullName: "Sarah Johnson",
  positions: ["Service Associate", "Shelter Manager", "Feeding Lead"],
  serviceAreas: ["Mass Care", "Feeding"],
}

function dayLabel(d: Date, now: Date): string {
  const sameYear = d.getFullYear() === now.getFullYear()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return "earlier today"
  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)
  if (d.toDateString() === yest.toDateString()) return "yesterday"
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "long" })
  return d.toLocaleDateString(undefined, sameYear ? { month: "short", day: "numeric" } : undefined)
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [profile, setProfile] = useState(defaultProfile)
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR)
  const [readIds, setReadIds] = useState<string[]>([])
  const [lastVisit, setLastVisit] = useState<Date | null>(null)
  const [showAllAssignments, setShowAllAssignments] = useState(false)

  // Hydrate persisted state and bump "last visit" once per mount
  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem("arc_profile")
      if (rawProfile) {
        const p = JSON.parse(rawProfile)
        setProfile((curr) => ({
          ...curr,
          name: p.name?.split(" ")[0] || curr.name,
          fullName: p.name || curr.fullName,
          positions: Array.isArray(p.positions) ? p.positions : curr.positions,
          serviceAreas: Array.isArray(p.serviceAreas) ? p.serviceAreas : curr.serviceAreas,
        }))
      }
      const rawAvatar = localStorage.getItem("arc_profile_avatar")
      if (rawAvatar) setAvatarUrl(rawAvatar)

      const rawRead = localStorage.getItem("arc_read_doctrines")
      if (rawRead) setReadIds(JSON.parse(rawRead))

      const rawVisit = localStorage.getItem("arc_last_visit")
      if (rawVisit) setLastVisit(new Date(rawVisit))
      // Bump for next time
      localStorage.setItem("arc_last_visit", new Date().toISOString())
    } catch {}
  }, [])

  // Continue-reading: most recent read items, mapped back to doctrine
  const continueReading = useMemo(() => {
    if (readIds.length === 0) return []
    return readIds
      .slice(-3)
      .reverse()
      .map((id) => massCareContent[id])
      .filter(Boolean)
      .slice(0, 2)
  }, [readIds])

  // Synthetic activity since last visit. For the demo we use light fixed
  // numbers driven by how long it's been since last visit.
  const activitySince = useMemo(() => {
    if (!lastVisit) return null
    const now = new Date()
    const hours = (now.getTime() - lastVisit.getTime()) / 3_600_000
    if (hours < 1) return null
    const changed = hours < 24 ? 2 : Math.min(8, Math.max(3, Math.floor(hours / 24) + 2))
    const inRoles = Math.max(0, Math.min(3, Math.floor(changed / 2)))
    return { changed, inRoles, since: dayLabel(lastVisit, now) }
  }, [lastVisit])

  // Identify which assignments match the user's service areas — those get
  // pinned to the top with a "Your area" tag.
  const myAssignments = useMemo(() => {
    return assignments.filter((a) =>
      profile.serviceAreas.some((sa) => a.label.toLowerCase().includes(sa.toLowerCase()))
    )
  }, [profile.serviceAreas])

  const otherAssignments = useMemo(
    () => assignments.filter((a) => !myAssignments.find((m) => m.id === a.id)),
    [myAssignments]
  )

  const handleQuickPrompt = (q: string) => {
    try {
      localStorage.setItem("arc_initial_query", q)
    } catch {}
    onNavigate("ask")
  }

  const handleSearchTap = () => onNavigate("ask")

  return (
    <div className="flex flex-col min-h-full bg-muted/20 pb-4">
      {/* Hero */}
      <header className="px-4 pt-12 pb-4">
        <div className="bg-card rounded-3xl p-5 border border-border/60 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-sm">Welcome back,</p>
              <h1 className="text-xl font-semibold text-foreground truncate">{profile.name}</h1>
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.positions.slice(0, 2).map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground"
                  >
                    {p}
                  </span>
                ))}
                {profile.positions.length > 2 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground">
                    +{profile.positions.length - 2}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigate("profile")}
              aria-label="Open profile"
              className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-card shadow-sm active:scale-95 transition shrink-0"
            >
              <img src={avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            </button>
          </div>

          {/* Activity nudge */}
          {activitySince && (
            <button
              onClick={() => onNavigate("feed")}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-interactive-soft/40 border border-interactive/15 hover:border-interactive/30 active:scale-[0.99] transition"
            >
              <Flame className="w-3.5 h-3.5 text-interactive shrink-0" aria-hidden />
              <p className="text-[13px] text-foreground text-left flex-1">
                <span className="font-semibold">{activitySince.changed}</span> changed since {activitySince.since}
                {activitySince.inRoles > 0 && (
                  <>
                    {" · "}
                    <span className="font-semibold text-interactive-deep">
                      {activitySince.inRoles} in your roles
                    </span>
                  </>
                )}
              </p>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
            </button>
          )}
        </div>
      </header>

      {/* Continue reading */}
      {continueReading.length > 0 && (
        <section className="px-4 mb-4" aria-labelledby="continue-heading">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 id="continue-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Continue reading
            </h2>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" aria-hidden />
          </div>
          <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border overflow-hidden">
            {continueReading.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onNavigate("doctrine-detail", undefined, doc.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 active:bg-muted transition"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-muted-foreground" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {doc.category} · {doc.readTime}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Search + AI quick prompts */}
      <section className="px-4 mb-5">
        <button
          onClick={handleSearchTap}
          className="w-full flex items-center gap-3 h-12 px-4 rounded-2xl bg-card border border-border/60 active:scale-[0.99] transition"
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
          <span className="flex-1 text-left text-muted-foreground text-sm">
            Search doctrine or ask a question…
          </span>
        </button>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickPrompt(q)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-card border border-border/60 text-[12px] font-medium text-foreground hover:border-interactive/40 hover:bg-interactive-soft/30 active:scale-95 transition"
            >
              <Sparkles className="w-3 h-3 text-interactive" aria-hidden />
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* Personalized assignments */}
      <section className="px-4 mb-3">
        {myAssignments.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your areas
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {myAssignments.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate("doctrine", item.id)}
                    className="flex flex-col items-start p-4 rounded-2xl text-left bg-card border border-interactive/30 active:scale-[0.98] hover:border-interactive transition"
                  >
                    <div className="w-9 h-9 rounded-xl bg-interactive/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-interactive" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">{item.label}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                  </button>
                )
              })}
            </div>
          </>
        )}

        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {myAssignments.length > 0 ? "Other assignments" : "All assignments"}
          </h2>
          {!showAllAssignments && otherAssignments.length > 4 && (
            <button
              onClick={() => setShowAllAssignments(true)}
              className="text-xs font-medium text-interactive hover:text-interactive-deep"
            >
              Show all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(showAllAssignments ? otherAssignments : otherAssignments.slice(0, 4)).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate("doctrine", item.id)}
                className="flex items-center gap-2.5 p-3 rounded-xl text-left bg-card border border-border/50 active:scale-[0.98] hover:border-interactive/40 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.label}</p>
                </div>
              </button>
            )
          })}
        </div>
        {showAllAssignments && otherAssignments.length > 4 && (
          <button
            onClick={() => setShowAllAssignments(false)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="w-3 h-3 rotate-180" aria-hidden /> Show less
          </button>
        )}
      </section>
    </div>
  )
}
