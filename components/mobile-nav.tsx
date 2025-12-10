"use client"

import { Home, Download, Sparkles, User, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "./app-shell"

interface MobileNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "feed", label: "Feed", icon: Compass },
  { id: "ask", label: "Ask", icon: Sparkles },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "profile", label: "Profile", icon: User },
]

export function MobileNav({ activeScreen, onNavigate }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-around py-2 pb-7">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            activeScreen === item.id ||
            (activeScreen === "doctrine" && item.id === "home") ||
            (activeScreen === "group-documents" && item.id === "home") ||
            (activeScreen === "doctrine-detail" && item.id === "home")
          const isAsk = item.id === "ask"

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl",
                "active:scale-90 transition-all duration-200",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center",
                  isAsk && isActive && "w-8 h-8 rounded-full bg-primary",
                  isAsk && !isActive && "w-8 h-8 rounded-full bg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary" : "text-muted-foreground",
                    isAsk && isActive && "text-primary-foreground w-4 h-4",
                    isAsk && !isActive && "w-4 h-4",
                  )}
                />
              </div>
              {!isAsk && (
                <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
