"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CardItem {
  id: number
  title: string
  category: string
  readTime: string
}

interface SwipeableCardsProps {
  items: CardItem[]
}

export function SwipeableCards({ items }: SwipeableCardsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 touch-scroll snap-x snap-mandatory">
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            "flex-shrink-0 w-[75%] p-4 rounded-xl text-left",
            "bg-card border border-border",
            "active:scale-[0.98] transition-all duration-200",
            "snap-start",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-primary uppercase tracking-wide">{item.category}</span>
            <span className="text-[10px] text-muted-foreground">{item.readTime}</span>
          </div>
          <h3 className="text-sm font-medium text-foreground mb-3 leading-snug">{item.title}</h3>
          <div className="flex items-center gap-1 text-primary text-xs font-medium">
            Read <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      ))}
    </div>
  )
}
