"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Palette } from "lucide-react"

/**
 * DeviceFrame
 *
 * Wraps the app in an iPhone-style chrome on desktop only. Hidden / pass-through
 * on mobile viewports (< md breakpoint, 768px) so it never shows on a real phone.
 *
 * Implementation notes:
 * - The screen container uses `transform-gpu` to establish a containing block
 *   for any `position: fixed` descendants (the bottom nav, modal sheets), so
 *   they lock to the phone screen instead of the desktop window.
 * - `isolate` creates a new stacking context for clean overlay layering.
 * - Sticky elements (`position: sticky`) work automatically inside the
 *   scrollable screen — no extra setup needed.
 * - On mobile (< md), the chrome divs are display:none and the AppShell
 *   renders normally to the viewport.
 *
 * Globals.css contains the media-query rules that override `min-h-dvh` /
 * `min-h-screen` inside the screen container so the AppShell fills the
 * fixed-height phone screen instead of stretching to the window.
 */

interface DeviceFrameProps {
  children: ReactNode
  /** Override the screen size. Defaults to iPhone 17 Pro logical dimensions. */
  width?: number
  height?: number
  /** Optional caption shown beside the device on desktop (design-review label). */
  label?: string
}

export function DeviceFrame({
  children,
  // iPhone 17 Pro logical resolution (CSS px).
  width = 402,
  height = 874,
  label = "iPhone 17 Pro · 402 × 874",
}: DeviceFrameProps) {
  return (
    <div className="device-stage md:min-h-screen md:flex md:items-center md:justify-center md:bg-zinc-100 md:dark:bg-zinc-900 md:p-6 md:gap-6">
      {/* Phone body (bezel) — chrome only renders on md+ */}
      <div
        className={[
          "device-shell",
          "md:rounded-[3.25rem] md:bg-zinc-950 md:p-[14px]",
          "md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.6)_inset]",
          "md:ring-1 md:ring-zinc-800",
        ].join(" ")}
      >
        {/* Side buttons (mute switch + volume + power) — purely decorative */}
        <span aria-hidden className="hidden md:block absolute -left-[2px] top-[120px] w-[3px] h-9 rounded-l-sm bg-zinc-800" />
        <span aria-hidden className="hidden md:block absolute -left-[2px] top-[180px] w-[3px] h-14 rounded-l-sm bg-zinc-800" />
        <span aria-hidden className="hidden md:block absolute -left-[2px] top-[260px] w-[3px] h-14 rounded-l-sm bg-zinc-800" />
        <span aria-hidden className="hidden md:block absolute -right-[2px] top-[200px] w-[3px] h-20 rounded-r-sm bg-zinc-800" />

        {/* Screen — fixed size on md+, full pass-through on mobile */}
        <div
          className="device-screen relative md:rounded-[2.6rem] md:overflow-hidden md:transform-gpu md:isolate md:bg-background"
          style={{
            // Apply fixed dimensions only on desktop. Tailwind's md:w-[Npx]
            // covers this — but we'd lose the no-op on mobile. Inline-style
            // would override mobile too, so we use CSS vars + media query.
            ["--device-w" as string]: `${width}px`,
            ["--device-h" as string]: `${height}px`,
          }}
        >
          {/* Dynamic Island — only on md+ */}
          <span
            aria-hidden
            className="hidden md:block absolute top-2.5 left-1/2 -translate-x-1/2 z-[60] w-[124px] h-[34px] rounded-full bg-black pointer-events-none"
          />
          {/* Home indicator — only on md+ */}
          <span
            aria-hidden
            className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 z-[60] w-[134px] h-[5px] rounded-full bg-white/55 pointer-events-none mix-blend-overlay"
          />

          {/* The actual app */}
          {children}
        </div>
      </div>

      {/* Side rail beside the frame (desktop only): caption + design-system link */}
      <div className="hidden md:flex flex-col self-end pb-3 gap-3 max-w-[180px]">
        {label && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-snug">
            {label}
          </p>
        )}
        <Link
          href="/design"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-white text-zinc-900 text-xs font-semibold border border-zinc-200 shadow-sm hover:bg-zinc-50 active:scale-95 transition w-fit dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
        >
          <Palette className="w-3.5 h-3.5" aria-hidden />
          Design system
        </Link>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
          Colors, type, and components for the staff designer review.
        </p>
      </div>
    </div>
  )
}
