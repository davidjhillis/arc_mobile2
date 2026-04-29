"use client"

import { Home, Download, Search, User, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "./app-shell"

interface MobileNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "feed", label: "Feed", icon: Compass },
  { id: "ask", label: "Search", icon: Search },
  { id: "downloads", label: "Saved", icon: Download },
  { id: "profile", label: "Profile", icon: User },
]

export function MobileNav({ activeScreen, onNavigate }: MobileNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-background/95 backdrop-blur-md border-t border-border"
    >
      <ul className="flex items-stretch justify-around pt-2 pb-7">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            activeScreen === item.id ||
            (activeScreen === "doctrine" && item.id === "home") ||
            (activeScreen === "group-documents" && item.id === "home") ||
            (activeScreen === "doctrine-detail" && item.id === "home")

          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "w-full min-h-[48px] flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl",
                  "active:scale-95 transition-transform"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-interactive" : "text-muted-foreground"
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-interactive" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
