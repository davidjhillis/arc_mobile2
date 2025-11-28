"use client"

import { Bell, BookOpen, Download, ChevronRight, LogOut, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void
}

const userProfile = {
  name: "Sarah Johnson",
  email: "sarah.johnson@redcross.org",
  chapter: "Greater Metro Chapter",
  positions: ["Service Associate", "Shelter Manager", "Feeding Lead"],
  serviceAreas: ["Mass Care", "Feeding"],
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header - clean and minimal */}
      <header className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-lg">SJ</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium text-foreground truncate">{userProfile.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{userProfile.chapter}</p>
          </div>
        </div>

        {/* Positions as badges - not selectable */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Positions</p>
          <div className="flex flex-wrap gap-1.5">
            {userProfile.positions.map((position) => (
              <span
                key={position}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {position}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Service Areas */}
      <section className="px-5 pb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Service Areas</p>
        <div className="flex flex-wrap gap-1.5">
          {userProfile.serviceAreas.map((area) => (
            <span key={area} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground">
              {area}
            </span>
          ))}
        </div>
      </section>

      <section className="px-5 pb-6">
        <button
          onClick={() => onNavigate("downloads")}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-xl",
            "bg-emerald-500/10 border border-emerald-500/20",
            "active:scale-[0.99] transition-all duration-200",
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <WifiOff className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-sm font-medium text-foreground">Offline Content</h3>
            <p className="text-xs text-muted-foreground">3 doctrine documents saved · 8.3 MB</p>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-600" />
        </button>
      </section>

      {/* Divider */}
      <div className="h-2 bg-muted/30" />

      {/* Settings - minimal list */}
      <section className="px-5 py-6 flex-1">
        <div className="space-y-1">
          {[
            { icon: Bell, label: "Notifications", value: "On" },
            { icon: Download, label: "Auto-Download", value: "Wi-Fi only" },
            { icon: BookOpen, label: "Reading History" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={cn(
                  "w-full flex items-center gap-4 px-3 py-3.5 -mx-3 rounded-xl",
                  "text-left active:bg-muted/50 transition-colors",
                )}
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-sm text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Sign Out */}
      <section className="px-5 pb-8">
        <button
          className={cn(
            "w-full flex items-center justify-center gap-2 h-12 rounded-xl",
            "border border-border",
            "text-muted-foreground text-sm font-medium",
            "active:bg-muted/50 transition-colors",
          )}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <p className="text-center text-xs text-muted-foreground mt-4">Red Cross Doctrine v1.0</p>
      </section>
    </div>
  )
}
