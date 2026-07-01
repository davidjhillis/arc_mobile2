/**
 * Category color-coding — a single low-chroma hue per major content area, used
 * for the card left-stripe, category chip background, and small color dots.
 *
 * Colors are chosen to stay muted (not hot) so several can appear together on
 * a list without the surface reading as chaotic. Red is reserved for the ARC
 * primary and never used here.
 */

export interface CategoryColor {
  /** left-stripe color (used via --stripe on .card-stripe) */
  stripe: string
  /** chip / soft badge background */
  chipBg: string
  /** chip text / dot color */
  chipText: string
}

const DEEP_BLUE: CategoryColor = {
  stripe: "var(--interactive-deep)",
  chipBg: "oklch(0.92 0.04 235)",
  chipText: "var(--interactive-deep)",
}

/**
 * Palette. Chroma held at 0.09–0.12, lightness ≥ 0.4 to keep text legible.
 */
const PALETTE: Record<string, CategoryColor> = {
  // Core service areas
  "mass care":        { stripe: "oklch(0.42 0.10 240)",  chipBg: "oklch(0.92 0.04 235)", chipText: "oklch(0.34 0.10 240)" },
  "sheltering":       { stripe: "oklch(0.45 0.10 200)",  chipBg: "oklch(0.93 0.03 200)", chipText: "oklch(0.35 0.10 200)" },
  "feeding":          { stripe: "oklch(0.55 0.11 65)",   chipBg: "oklch(0.94 0.04 75)",  chipText: "oklch(0.42 0.11 60)" },
  "client care":      { stripe: "oklch(0.48 0.10 165)",  chipBg: "oklch(0.93 0.04 165)", chipText: "oklch(0.38 0.10 165)" },
  "evacuation":       { stripe: "oklch(0.55 0.12 30)",   chipBg: "oklch(0.94 0.04 35)",  chipText: "oklch(0.42 0.12 30)" },

  // Assignments
  "workforce":        { stripe: "oklch(0.48 0.10 300)",  chipBg: "oklch(0.94 0.03 300)", chipText: "oklch(0.38 0.10 300)" },
  "logistics":        { stripe: "oklch(0.44 0.06 260)",  chipBg: "oklch(0.93 0.02 260)", chipText: "oklch(0.35 0.06 260)" },
  "information & planning": { stripe: "oklch(0.50 0.10 150)", chipBg: "oklch(0.93 0.04 150)", chipText: "oklch(0.40 0.10 150)" },
  "external relations":     { stripe: "oklch(0.52 0.10 340)", chipBg: "oklch(0.94 0.03 340)", chipText: "oklch(0.42 0.10 340)" },
  "operations management":  { stripe: "oklch(0.42 0.09 260)", chipBg: "oklch(0.93 0.03 255)", chipText: "oklch(0.35 0.09 260)" },
  "dat: regional response": DEEP_BLUE,
}

export function getCategoryColor(category: string | undefined | null): CategoryColor {
  if (!category) return DEEP_BLUE
  return PALETTE[category.trim().toLowerCase()] ?? DEEP_BLUE
}
