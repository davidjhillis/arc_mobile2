"use client"

import { useState } from "react"
import { ArrowLeft, Flame, CloudRain, Wind, Mountain, Snowflake, Zap, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface DisasterScreenProps {
  onNavigate: (screen: Screen, disasterType?: string) => void
}

const disasterTypes = [
  {
    id: "fire",
    icon: Flame,
    label: "Fire",
    description: "Wildfires, house fires, burn incidents",
    doctrines: 24,
  },
  {
    id: "flood",
    icon: CloudRain,
    label: "Flood",
    description: "Flash floods, river flooding, coastal surge",
    doctrines: 18,
  },
  {
    id: "storm",
    icon: Wind,
    label: "Storm",
    description: "Hurricanes, tornadoes, severe weather",
    doctrines: 31,
  },
  {
    id: "earthquake",
    icon: Mountain,
    label: "Earthquake",
    description: "Seismic events and aftershocks",
    doctrines: 15,
  },
  {
    id: "winter",
    icon: Snowflake,
    label: "Winter Storm",
    description: "Blizzards, ice storms, extreme cold",
    doctrines: 12,
  },
  {
    id: "other",
    icon: Zap,
    label: "Other Events",
    description: "Power outages, evacuations, misc",
    doctrines: 22,
  },
]

export function DisasterScreen({ onNavigate }: DisasterScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = disasterTypes.filter(
    (d) =>
      d.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate("home")}
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-base font-medium text-foreground">All Disaster Types</h1>
            <p className="text-xs text-muted-foreground">Browse by event type</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className={cn(
              "w-full h-10 pl-9 pr-4 rounded-xl",
              "bg-muted/50 border-none",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-1 focus:ring-primary/50",
              "transition-all",
            )}
          />
        </div>
      </header>

      {/* Disaster Types Grid */}
      <div className="px-5 pb-6 grid grid-cols-2 gap-2">
        {filtered.map((disaster) => {
          const Icon = disaster.icon
          return (
            <button
              key={disaster.id}
              onClick={() => onNavigate("doctrine", disaster.id)}
              className={cn(
                "flex flex-col items-start p-4 rounded-xl text-left",
                "bg-card border border-border",
                "active:scale-[0.97] transition-all duration-200",
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-0.5">{disaster.label}</h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{disaster.description}</p>
              <span className="text-[10px] text-muted-foreground font-medium">{disaster.doctrines} documents</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
