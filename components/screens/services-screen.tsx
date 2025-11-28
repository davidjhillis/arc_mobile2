"use client"

import { useState } from "react"
import { ArrowLeft, Users, Utensils, Heart, Cross, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface ServicesScreenProps {
  onNavigate: (screen: Screen) => void
}

const serviceGroups = [
  {
    id: "mass-care",
    label: "Mass Care",
    icon: Users,
    activities: [
      { name: "Shelter Operations", doctrines: 15 },
      { name: "Reception & Placement", doctrines: 8 },
      { name: "Bulk Distribution", doctrines: 12 },
    ],
  },
  {
    id: "feeding",
    label: "Feeding",
    icon: Utensils,
    activities: [
      { name: "Fixed Feeding Sites", doctrines: 10 },
      { name: "Mobile Feeding", doctrines: 7 },
      { name: "Kitchen Management", doctrines: 14 },
    ],
  },
  {
    id: "client-care",
    label: "Client Care",
    icon: Heart,
    activities: [
      { name: "Casework", doctrines: 18 },
      { name: "Mental Health Support", doctrines: 11 },
      { name: "Health Services", doctrines: 9 },
    ],
  },
  {
    id: "spiritual-care",
    label: "Spiritual Care",
    icon: Cross,
    activities: [
      { name: "Emotional Support", doctrines: 8 },
      { name: "Memorial Services", doctrines: 5 },
      { name: "Staff Support", doctrines: 6 },
    ],
  },
]

export function ServicesScreen({ onNavigate }: ServicesScreenProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>("mass-care")

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("home")}
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-base font-medium text-foreground">Services</h1>
            <p className="text-xs text-muted-foreground">Browse by service area</p>
          </div>
        </div>
      </header>

      {/* Service Groups */}
      <div className="px-5 pb-6 space-y-2">
        {serviceGroups.map((group) => {
          const Icon = group.icon
          const isExpanded = expandedGroup === group.id
          const totalDoctrines = group.activities.reduce((sum, a) => sum + a.doctrines, 0)

          return (
            <div key={group.id} className="rounded-xl overflow-hidden bg-card border border-border">
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                className={cn("w-full flex items-center gap-3 p-4 text-left", "active:bg-muted/50 transition-colors")}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">{group.label}</h3>
                  <p className="text-xs text-muted-foreground">
                    {group.activities.length} activities · {totalDoctrines} docs
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border/50">
                  {group.activities.map((activity, index) => (
                    <button
                      key={activity.name}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3",
                        "text-left active:bg-muted/30 transition-colors",
                        index !== group.activities.length - 1 && "border-b border-border/30",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-primary/50" />
                        <span className="text-sm text-foreground">{activity.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{activity.doctrines}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
