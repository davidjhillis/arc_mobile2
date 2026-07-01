"use client"

import { cn } from "@/lib/utils"
import { useReaderTextSize } from "@/hooks/use-reader-text-size"

interface ButtonProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

/** Round toolbar Aa button. Pair with <ReaderTextSizeSlider open={...} />. */
export function ReaderTextSizeButton({ open, onOpenChange, className }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onOpenChange(!open)}
      aria-label="Text size"
      aria-pressed={open}
      aria-expanded={open}
      className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition shrink-0 font-semibold text-[15px] leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-deep/60",
        open
          ? "bg-interactive-soft/40 text-interactive-deep"
          : "active:bg-muted text-foreground",
        className,
      )}
    >
      <span aria-hidden>
        <span className="text-[13px]">A</span>
        <span className="text-[17px]">a</span>
      </span>
    </button>
  )
}

interface SliderProps {
  open: boolean
  className?: string
}

/** Slider row rendered below the header button row. Reads/writes shared state. */
export function ReaderTextSizeSlider({ open, className }: SliderProps) {
  const { px, setPx, min, max } = useReaderTextSize()
  if (!open) return null
  return (
    <div className={cn("flex items-center gap-3 px-4 pb-3", className)}>
      <span className="text-[13px] text-muted-foreground leading-none" aria-hidden>A</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={px}
        onChange={(e) => setPx(Number(e.target.value))}
        aria-label="Reader text size"
        className="flex-1"
        style={{ accentColor: "var(--interactive-deep)" }}
      />
      <span className="text-[20px] text-muted-foreground leading-none" aria-hidden>A</span>
      <span className="text-xs font-medium text-foreground tabular-nums w-10 text-right">
        {px}px
      </span>
    </div>
  )
}
