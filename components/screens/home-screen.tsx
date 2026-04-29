"use client"

import { Search, Bed, Stethoscope, Users, Truck, BarChart, Handshake, Briefcase, HardHat, ChevronRight, Sparkles, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface HomeScreenProps {
  onNavigate: (screen: Screen, disasterType?: string) => void
}

// Assignment sections (these are the tiles)
const assignments = [
  { id: "dat-regional-response", icon: HardHat, label: "DAT: Regional Response", description: "Regional response operations", docs: 12 },
  { id: "mass-care", icon: Bed, label: "Mass Care", description: "Services for shelters and the community", docs: 18 },
  { id: "client-care", icon: Stethoscope, label: "Client Care", description: "Health, mental health, and spiritual services", docs: 15 },
  { id: "workforce", icon: Users, label: "Workforce", description: "Services for deployed responders", docs: 10 },
  { id: "logistics", icon: Truck, label: "Logistics", description: "Material, facility, and equipment resources", docs: 14 },
  { id: "information-planning", icon: BarChart, label: "Information & Planning", description: "Assessment and operational data", docs: 20 },
  { id: "external-relations", icon: Handshake, label: "External Relations", description: "Liaison with government and other partners", docs: 8 },
  { id: "operations-management", icon: Briefcase, label: "Operations Management", description: "Oversight and direction for DROs", docs: 12 },
]

const userProfile = {
  name: "Sarah",
  positions: ["Service Associate", "Shelter Manager", "Feeding Lead"],
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="flex flex-col min-h-full bg-muted/30">
      <div className="px-4 pt-14 pb-6">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          {/* Greeting with positions as badges */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-muted-foreground text-sm">Welcome back,</p>
                <h1 className="text-xl font-semibold text-foreground">{userProfile.name}</h1>
              </div>
              <button
                onClick={() => onNavigate("profile")}
                aria-label="Open profile"
                className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-card shadow-sm active:scale-95 transition"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=facearea&facepad=2.2&auto=format&q=80"
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {userProfile.positions.map((position) => (
                <span
                  key={position}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                >
                  {position}
                </span>
              ))}
            </div>
          </div>

          {/* Perplexity-style search bar */}
          <button
            onClick={() => onNavigate("ask")}
            className={cn(
              "w-full flex items-center gap-3 h-14 px-4 rounded-2xl",
              "bg-muted/50 border border-border/50",
              "active:scale-[0.99] transition-all duration-200",
            )}
          >
            <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
            <span className="flex-1 text-left text-muted-foreground text-sm">Search doctrine or ask a question…</span>
          </button>
        </div>
      </div>

      <section className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">By Assignment</h2>
            <button
              onClick={() => onNavigate("disasters")}
              className="text-xs text-interactive font-semibold flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {assignments.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate("doctrine", item.id)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-2xl text-left",
                    "bg-background border border-border/50",
                    "active:scale-[0.98] transition-all duration-200",
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-xs text-muted-foreground leading-snug mb-2 line-clamp-2">{item.description}</p>
                  <span className="text-xs font-medium text-muted-foreground">{item.docs} documents</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border/50 space-y-3">
          <button
            onClick={() => onNavigate("feed")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl",
              "bg-interactive-soft/40 border border-interactive/15",
              "active:scale-[0.99] transition-all duration-200",
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-interactive flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-interactive-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-foreground">Browse Doctrine Update</h3>
              <p className="text-xs text-muted-foreground">Personalized for your roles</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-interactive text-xs font-semibold text-interactive-foreground">
              6 new
            </span>
          </button>

          <button
            onClick={() => onNavigate("downloads")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl",
              "bg-success/5 border border-success/15",
              "active:scale-[0.99] transition-all duration-200",
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-success-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-foreground">Offline Content</h3>
              <p className="text-xs text-muted-foreground">3 documents ready</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </section>
    </div>
  )
}
