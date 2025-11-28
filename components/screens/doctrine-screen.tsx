"use client"

import { useState } from "react"
import { ArrowLeft, Search, BookOpen, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface DoctrineScreenProps {
  disasterType: string | null
  onNavigate: (screen: Screen, disasterType?: string, doctrineId?: string) => void
}

const disasterLabels: Record<string, string> = {
  fire: "Fire Response",
  flood: "Flood Response",
  storm: "Storm Response",
  earthquake: "Earthquake Response",
  winter: "Winter Storm",
  other: "General Response",
}

const doctrineByType: Record<string, Array<{ id: string; title: string; category: string; readTime: string }>> = {
  fire: [
    {
      id: "post-fire-support",
      title: "Support Services After a House Fire",
      category: "Client Care",
      readTime: "10 min",
    },
    { id: "shelter-setup-fire", title: "Shelter Setup for Fire Evacuees", category: "Sheltering", readTime: "12 min" },
    { id: "smoke-inhalation", title: "Smoke Inhalation First Aid", category: "Health", readTime: "5 min" },
    { id: "property-damage", title: "Property Damage Assessment", category: "Recovery", readTime: "10 min" },
    { id: "volunteer-safety-fire", title: "Volunteer Safety in Fire Zones", category: "Safety", readTime: "6 min" },
  ],
  flood: [
    { id: "flash-flood-protocol", title: "Flash Flood Response Protocol", category: "Emergency", readTime: "7 min" },
    { id: "water-damage", title: "Water Damage Assessment", category: "Recovery", readTime: "9 min" },
    { id: "flood-shelter", title: "Flood Shelter Operations", category: "Sheltering", readTime: "11 min" },
    { id: "contaminated-water", title: "Contaminated Water Safety", category: "Health", readTime: "6 min" },
  ],
  storm: [
    { id: "hurricane-prep", title: "Hurricane Preparedness", category: "Preparation", readTime: "15 min" },
    { id: "tornado-response", title: "Tornado Response Protocol", category: "Emergency", readTime: "8 min" },
    { id: "post-storm-survey", title: "Post-Storm Damage Survey", category: "Recovery", readTime: "10 min" },
    { id: "power-outage", title: "Power Outage Support", category: "Services", readTime: "7 min" },
  ],
  earthquake: [
    { id: "earthquake-immediate", title: "Earthquake Immediate Response", category: "Emergency", readTime: "6 min" },
    { id: "building-safety", title: "Building Safety Assessment", category: "Safety", readTime: "12 min" },
    { id: "aftershock-protocols", title: "Aftershock Protocols", category: "Safety", readTime: "5 min" },
  ],
  winter: [
    { id: "warming-center", title: "Warming Center Operations", category: "Sheltering", readTime: "9 min" },
    { id: "hypothermia-prevention", title: "Hypothermia Prevention", category: "Health", readTime: "7 min" },
    { id: "ice-storm-response", title: "Ice Storm Response", category: "Emergency", readTime: "8 min" },
  ],
  other: [
    { id: "shelter-pet-policy", title: "Pet Policy in Emergency Shelters", category: "Sheltering", readTime: "6 min" },
    { id: "shelter-duration", title: "Shelter Stay Duration Policy", category: "Sheltering", readTime: "8 min" },
    { id: "dietary-restrictions", title: "Supporting Dietary Restrictions", category: "Feeding", readTime: "7 min" },
    { id: "volunteer-deployment", title: "Volunteer Deployment Basics", category: "Operations", readTime: "8 min" },
  ],
}

export function DoctrineScreen({ disasterType, onNavigate }: DoctrineScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const type = disasterType || "other"
  const doctrines = doctrineByType[type] || doctrineByType.other
  const label = disasterLabels[type] || "Response Doctrine"

  const filtered = doctrines.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()),
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
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-medium text-foreground">{label}</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} documents</p>
          </div>
          <button
            onClick={() => onNavigate("ask")}
            className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </button>
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

      {/* Doctrine List */}
      <div className="flex-1 px-5 pb-6 space-y-2">
        {filtered.map((doctrine) => (
          <button
            key={doctrine.id}
            onClick={() => onNavigate("doctrine-detail", undefined, doctrine.id)}
            className={cn(
              "w-full flex items-start gap-3 p-4 rounded-xl text-left",
              "bg-card border border-border",
              "active:scale-[0.99] transition-all duration-200",
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground mb-1.5 leading-snug">{doctrine.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 rounded bg-muted/50">{doctrine.category}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {doctrine.readTime}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
