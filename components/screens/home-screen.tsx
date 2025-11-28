"use client"

import { Search, Flame, CloudRain, Wind, Mountain, Snowflake, Zap, ChevronRight, Sparkles, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface HomeScreenProps {
  onNavigate: (screen: Screen, disasterType?: string) => void
}

const disasterTypes = [
  { id: "fire", icon: Flame, label: "Fire", description: "Wildfires, house fires, burn incidents", docs: 24 },
  {
    id: "flood",
    icon: CloudRain,
    label: "Flood",
    description: "Flash floods, river flooding, coastal surge",
    docs: 18,
  },
  { id: "storm", icon: Wind, label: "Storm", description: "Hurricanes, tornadoes, severe weather", docs: 31 },
  { id: "earthquake", icon: Mountain, label: "Earthquake", description: "Seismic events and aftershocks", docs: 15 },
  {
    id: "winter",
    icon: Snowflake,
    label: "Winter Storm",
    description: "Blizzards, ice storms, extreme cold",
    docs: 12,
  },
  { id: "other", icon: Zap, label: "Other Events", description: "Power outages, evacuations, misc", docs: 22 },
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
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm"
              >
                <span className="text-primary-foreground text-sm font-semibold">{userProfile.name.charAt(0)}</span>
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
              "group",
            )}
          >
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="flex-1 text-left text-muted-foreground text-sm">Ask about any doctrine...</span>
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <section className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">By Disaster Type</h2>
            <button
              onClick={() => onNavigate("disasters")}
              className="text-xs text-primary font-semibold flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {disasterTypes.map((item) => {
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
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-xs text-muted-foreground leading-snug mb-2 line-clamp-2">{item.description}</p>
                  <span className="text-xs font-medium text-primary">{item.docs} docs</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">By Service</h2>
            <button
              onClick={() => onNavigate("services")}
              className="text-xs text-primary font-semibold flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Mass Care", "Feeding", "Client Care", "Spiritual Care"].map((service) => (
              <button
                key={service}
                onClick={() => onNavigate("services")}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-xl",
                  "bg-muted/50 border border-border/50",
                  "active:scale-[0.98] transition-all duration-200",
                )}
              >
                <span className="text-sm font-medium text-foreground">{service}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border/50 space-y-3">
          <button
            onClick={() => onNavigate("feed")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl",
              "bg-primary/5 border border-primary/10",
              "active:scale-[0.99] transition-all duration-200",
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-foreground">Browse Doctrine Feed</h3>
              <p className="text-xs text-muted-foreground">Personalized for your roles</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              6 new
            </span>
          </button>

          <button
            onClick={() => onNavigate("downloads")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl",
              "bg-emerald-50 border border-emerald-200/50",
              "active:scale-[0.99] transition-all duration-200",
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-white" />
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
