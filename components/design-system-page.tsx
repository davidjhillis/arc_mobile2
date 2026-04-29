"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  Search,
  Bookmark,
  BookmarkCheck,
  Download,
  Share2,
  Check,
  ChevronRight,
  Mic,
  Volume2,
  Loader2,
  Info,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Small building blocks for the design-system page itself.
// (Intentionally local to this page — these aren't reused in the app.)
// ---------------------------------------------------------------------------

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 py-10 border-b border-border">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="mt-1.5 text-[15px] text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
        )}
      </header>
      {children}
    </section>
  )
}

function Swatch({
  name,
  cssVar,
  hex,
  pantone,
  usage,
  textOn,
}: {
  name: string
  cssVar: string
  hex?: string
  pantone?: string
  usage?: string
  textOn?: "light" | "dark"
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div
        className="aspect-[4/3] w-full flex items-end p-3"
        style={{ background: `var(${cssVar})` }}
      >
        {hex && (
          <span
            className={cssVar.includes("foreground") || textOn === "dark" ? "text-zinc-900 text-[11px] font-mono font-semibold" : "text-white text-[11px] font-mono font-semibold drop-shadow"}
          >
            {hex}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          {pantone && <p className="text-[11px] font-mono text-muted-foreground">{pantone}</p>}
        </div>
        <p className="text-[11px] font-mono text-muted-foreground mb-1.5">{cssVar}</p>
        {usage && <p className="text-xs text-muted-foreground leading-snug">{usage}</p>}
      </div>
    </div>
  )
}

function TokenRow({ name, value, note }: { name: string; value: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{name}</p>
        {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
      </div>
      <code className="text-xs font-mono text-muted-foreground shrink-0">{value}</code>
    </div>
  )
}

function ExampleCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      </div>
      <div className="p-5 bg-background">{children}</div>
    </div>
  )
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "brand" | "interactive" | "success" | "warning" }) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-foreground",
    brand: "bg-primary text-primary-foreground",
    interactive: "bg-interactive text-interactive-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
  }
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
          <div className="flex-1" />
          <p className="text-xs font-mono text-muted-foreground hidden sm:block">v1 · Apr 2026</p>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-interactive mb-3">
          Red Cross Doctrine PWA
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.05] text-balance">
          Design system
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The colors, type, and components used across the volunteer-facing PWA. Built on the
          official ARC brand standards (PMS 485 Crimson, Pacific Blue, Akzidenz-Grotesk family) and
          tuned for calm, fast reading on a mobile device under field conditions.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { id: "principles", label: "Principles" },
            { id: "color", label: "Color" },
            { id: "type", label: "Typography" },
            { id: "spacing", label: "Spacing & radius" },
            { id: "elevation", label: "Elevation" },
            { id: "components", label: "Components" },
            { id: "iconography", label: "Iconography" },
            { id: "motion", label: "Motion" },
            { id: "do-dont", label: "Do / Don't" },
          ].map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition"
            >
              {t.label}
            </a>
          ))}
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {/* Principles */}
        <Section
          id="principles"
          title="Principles"
          description="Why the system looks the way it does. These ground every decision below."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                t: "Calm under pressure",
                d: "Volunteers open this app in shelters and disaster zones. The interface stays quiet — small surfaces, neutral grays, restrained color — so attention goes to the content.",
              },
              {
                t: "Crimson is sacred",
                d: "ARC Red (#ED1B2E) means Red Cross or critical action — never decoration. We reserve it for the brand mark, one primary CTA per screen, and destructive states.",
              },
              {
                t: "Reading first",
                d: "Doctrine is long-form. Type, leading, and section callouts are tuned for actually reading on a 5–6 inch phone with a wet glove on.",
              },
              {
                t: "AI as assistant, not host",
                d: "Generative output is clearly attributed, paired with source documents, and easy to dismiss. The AI never replaces the doctrine — it points to it.",
              },
            ].map((p) => (
              <div key={p.t} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold text-foreground mb-1.5">{p.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Color */}
        <Section
          id="color"
          title="Color"
          description="Two-tier palette: ARC Crimson reserved for brand & critical, Pacific Blue as the workhorse interactive color, neutrals for surface, status colors for state."
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 mt-2">Brand</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Swatch
              name="Crimson"
              cssVar="--primary"
              hex="#ED1B2E"
              pantone="PMS 485 C"
              usage="ARC brand mark · primary CTA · critical/destructive states"
            />
            <Swatch
              name="Falu Red"
              cssVar="--primary-deep"
              hex="#7F181B"
              usage="Hover/pressed for primary; depth accent"
            />
            <Swatch
              name="Pacific Blue"
              cssVar="--interactive"
              hex="#0091CD"
              usage="Links · focus rings · selected nav · AI accents"
            />
            <Swatch
              name="Regal Blue"
              cssVar="--interactive-deep"
              hex="#004B79"
              usage="Hover/pressed for interactive; strong text accent"
            />
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Surfaces & neutrals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Swatch name="Background" cssVar="--background" usage="Page surface" textOn="dark" />
            <Swatch name="Card" cssVar="--card" usage="Elevated content surface" textOn="dark" />
            <Swatch name="Muted" cssVar="--muted" usage="Subtle fills, chips, inputs" textOn="dark" />
            <Swatch name="Border" cssVar="--border" usage="Hairlines & dividers" textOn="dark" />
            <Swatch name="Foreground" cssVar="--foreground" hex="#222" usage="Body text" />
            <Swatch name="Muted text" cssVar="--muted-foreground" hex="#6D6E70" pantone="Cool Gray 11" usage="Secondary copy, captions" />
            <Swatch name="Interactive soft" cssVar="--interactive-soft" hex="#C4DFF6" usage="AI cards · active backgrounds" textOn="dark" />
            <Swatch name="Iron" cssVar="--input" usage="Input field background" textOn="dark" />
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Swatch name="Success" cssVar="--success" hex="#537B35" usage="Fern Green — saved, downloaded, available offline" />
            <Swatch name="Warning" cssVar="--warning" hex="#ECB731" usage='Tulip Tree — "Considerations" callouts, search highlight' />
            <Swatch name="Destructive" cssVar="--destructive" hex="#ED1B2E" usage="Same as brand Crimson — destructive intent" />
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-warning bg-warning/10 p-4">
            <p className="text-sm text-foreground leading-relaxed">
              <strong className="font-semibold">Color rule:</strong> Crimson never appears on passive UI (icon
              tiles, selected nav, focus rings). If it isn't a primary CTA, brand mark, or critical state, use
              Pacific Blue or a neutral.
            </p>
          </div>
        </Section>

        {/* Typography */}
        <Section
          id="type"
          title="Typography"
          description="Inter as the open-source stand-in for Akzidenz-Grotesk (ARC's primary typeface). Georgia for the few places long-form serif reads better."
        >
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <p className="text-xs font-mono uppercase text-muted-foreground mb-1.5">Display · 32 / 700 · -0.01em</p>
              <p className="text-[2rem] leading-[1.05] font-bold tracking-tight text-foreground">Closing Mass Care Activities</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-muted-foreground mb-1.5">H1 · 24 / 700</p>
              <p className="text-2xl leading-tight font-bold text-foreground">Daily tactics planning</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-muted-foreground mb-1.5">H2 · 22 / 700</p>
              <p className="text-[1.375rem] leading-snug font-bold text-foreground">What to do</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-muted-foreground mb-1.5">H3 · 18 / 600</p>
              <p className="text-lg leading-snug font-semibold text-foreground">Typically performed by</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-muted-foreground mb-1.5">Body · 17 / 1.65</p>
              <p className="text-[17px] leading-[1.65] text-foreground/90 max-w-prose">
                Confirm all objectives for each Mass Care activity have been met. Coordinate with Logistics and
                Workforce sections to ensure orderly demobilization of personnel and resources.
              </p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-muted-foreground mb-1.5">Caption · 13 / 1.5</p>
              <p className="text-[13px] leading-snug text-muted-foreground">8 min read · v0.2 · Updated Mar 2025</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-muted-foreground mb-1.5">Mono · Geist Mono</p>
              <p className="text-sm font-mono text-foreground">category:&quot;Mass Care&quot; AND closing</p>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted p-4">
              <p className="font-medium text-foreground mb-1">Brand spec: Akzidenz-Grotesk</p>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                Used in print, packaging, and licensed digital deliverables. Akzidenz is licensed and not
                bundled with the web app.
              </p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="font-medium text-foreground mb-1">Web typeface: Inter · Georgia</p>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                Inter is the open-source nearest neighbor to Akzidenz and the typeface this PWA actually
                ships. Georgia covers long-form serif on the rare screen that needs it. Arial remains the
                last-resort system fallback if Inter fails to load.
              </p>
            </div>
          </div>
        </Section>

        {/* Spacing */}
        <Section
          id="spacing"
          title="Spacing & radius"
          description="One radius scale derived from --radius (14px), one spacing scale from Tailwind's 4px grid."
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Radius</h3>
              <TokenRow name="--radius-sm" value="0.5rem (8px)" note="Buttons, chips, focus rings" />
              <TokenRow name="--radius-md" value="0.75rem (12px)" note="Inputs, small cards" />
              <TokenRow name="--radius-lg" value="0.875rem (14px)" note="Default — cards, badges" />
              <TokenRow name="--radius-xl" value="1.25rem (20px)" note="Prominent cards, list items" />
              <TokenRow name="--radius-2xl" value="1.75rem (28px)" note="Bottom sheets, hero cards" />
              <TokenRow name="rounded-full" value="9999px" note="Pills, FABs, action buttons" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Spacing</h3>
              <TokenRow name="Tap target" value="≥ 44 × 44px" note="WCAG / Apple HIG minimum" />
              <TokenRow name="Section padding" value="px-5 (20px)" note="Mobile content gutter" />
              <TokenRow name="Card padding" value="p-5 (20px)" note="Generous, not cramped" />
              <TokenRow name="Block gap" value="gap-3 / gap-4" note="12 / 16px" />
              <TokenRow name="Hairline" value="1px / --border" note="Use sparingly; prefer space" />
              <TokenRow name="Hero copy width" value="max 65ch" note="Long-form readability" />
            </div>
          </div>
        </Section>

        {/* Elevation */}
        <Section
          id="elevation"
          title="Elevation"
          description="Three layers, no more. Light shadows + a 1px tinted border do most of the work."
        >
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Resting", cls: "elevation-resting", note: "Cards in a list" },
              { label: "Raised", cls: "elevation-raised", note: "Hover, sticky bars, modals" },
              { label: "Floating", cls: "elevation-floating", note: "Bottom sheets, popovers" },
            ].map((e) => (
              <div key={e.label} className={`rounded-2xl bg-card p-6 ${e.cls}`}>
                <p className="text-sm font-semibold text-foreground mb-1">{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Components */}
        <Section
          id="components"
          title="Components"
          description="The building blocks used across the app. Every interactive element meets the 44pt tap-target minimum."
        >
          <div className="grid lg:grid-cols-2 gap-5">
            <ExampleCard title="Buttons">
              <div className="flex flex-wrap gap-3">
                <button className="h-11 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm active:scale-95 transition">
                  Primary CTA
                </button>
                <button className="h-11 px-5 rounded-full bg-interactive text-interactive-foreground text-sm font-semibold shadow-sm active:scale-95 transition">
                  Interactive
                </button>
                <button className="h-11 px-5 rounded-full bg-foreground text-background text-sm font-semibold shadow-sm active:scale-95 transition">
                  Neutral solid
                </button>
                <button className="h-11 px-5 rounded-full bg-card border border-border text-foreground text-sm font-medium hover:border-interactive/40 active:scale-95 transition">
                  Secondary
                </button>
                <button className="h-11 px-4 rounded-full text-foreground text-sm font-medium hover:bg-muted active:scale-95 transition">
                  Ghost
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">One Crimson primary per screen. Use Interactive (Pacific Blue) for everything else that's an action.</p>
            </ExampleCard>

            <ExampleCard title="Icon buttons (top rail)">
              <div className="flex gap-1">
                {[Sparkles, Bookmark, Download, Share2].map((Icon, i) => (
                  <button key={i} className="w-11 h-11 rounded-full hover:bg-muted active:scale-95 flex items-center justify-center transition">
                    <Icon className={`w-5 h-5 ${i === 0 ? "text-interactive" : "text-foreground"}`} />
                  </button>
                ))}
                <button className="w-11 h-11 rounded-full bg-success/10 active:scale-95 flex items-center justify-center transition">
                  <BookmarkCheck className="w-5 h-5 text-interactive" />
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">44 × 44 minimum. Active state uses Pacific Blue tint, never Crimson.</p>
            </ExampleCard>

            <ExampleCard title="Search input (Gemini-style expand)">
              <div className="rounded-3xl bg-card border border-interactive/40 shadow-md p-2 pt-2 pb-2">
                <div className="flex items-start gap-2 px-2 pt-1.5">
                  <Search className="w-5 h-5 text-muted-foreground mt-1.5" />
                  <div className="flex-1 min-h-[3rem] py-1 text-[17px] text-muted-foreground">Search doctrine…</div>
                  <button className="w-9 h-9 rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Auto-grows on focus or content. Submit arrow appears when text is present, mic when empty.</p>
            </ExampleCard>

            <ExampleCard title="Filter chips">
              <div className="flex gap-2 flex-wrap">
                <button className="h-9 px-3.5 rounded-full bg-foreground text-background text-sm font-medium">All</button>
                <button className="h-9 px-3.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">Task Sheets</button>
                <button className="h-9 px-3.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">Standards</button>
                <button className="h-9 px-3.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">Roles</button>
              </div>
            </ExampleCard>

            <ExampleCard title="Badges & pills">
              <div className="flex flex-wrap gap-2">
                <Pill tone="neutral">Mass Care</Pill>
                <Pill tone="brand">Critical</Pill>
                <Pill tone="interactive">6 new</Pill>
                <Pill tone="success">Saved offline</Pill>
                <Pill tone="warning">Update available</Pill>
              </div>
            </ExampleCard>

            <ExampleCard title="Result card">
              <button className="w-full text-left rounded-2xl bg-card border border-border p-4 hover:border-interactive/40 transition">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Sparkles className="w-4.5 h-4.5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Task Sheet</span>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-[10px] text-muted-foreground">Mass Care</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">
                      Daily tactics planning (completing the 215s)
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      Process for daily tactics planning and communicating Mass Care needs to DRO leaders…
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              </button>
            </ExampleCard>

            <ExampleCard title="AI answer card (with shimmer)">
              <div className="rounded-2xl bg-interactive-soft/40 border border-interactive/15 overflow-hidden">
                <header className="flex items-center gap-2.5 px-5 pt-4 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-interactive flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-interactive-foreground" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">AI Answer</h2>
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin ml-1" />
                  <div className="flex-1" />
                  <button className="h-9 px-3.5 rounded-full bg-card border border-border text-foreground text-xs font-medium flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Listen
                  </button>
                </header>
                <div className="px-5 pb-4">
                  <div className="ai-shimmer space-y-2">
                    <div className="h-3.5 rounded bg-foreground/10 w-[88%]" />
                    <div className="h-3.5 rounded bg-foreground/10 w-[72%]" />
                    <div className="h-3.5 rounded bg-foreground/10 w-[80%]" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Shimmer placeholder during generation. Pacific Blue accents identify this as AI-generated. TTS button on the right.</p>
            </ExampleCard>

            <ExampleCard title="Section callouts (article body)">
              <div className="prose-arc">
                <div data-callout="what-to-do">
                  <h3>What to do</h3>
                  <ul>
                    <li>Confirm all objectives have been met</li>
                    <li>Notify the DRO Director of Mass Care closure</li>
                  </ul>
                </div>
                <div data-callout="considerations">
                  <h3>Considerations</h3>
                  <p>Mass Care typically ends when all Red Cross shelters are closed.</p>
                </div>
              </div>
            </ExampleCard>

            <ExampleCard title="Bottom sheet (modal)">
              <div className="rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
                <div className="pt-2 pb-2">
                  <div className="mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/30 mb-3" />
                  <div className="px-5 pb-1">
                    <p className="text-base font-semibold text-foreground">AI assistance</p>
                  </div>
                </div>
                <div className="px-5 pb-5 flex gap-2">
                  <button className="flex-1 h-11 rounded-xl bg-interactive text-interactive-foreground text-sm font-medium">Summarize</button>
                  <button className="flex-1 h-11 rounded-xl bg-muted text-foreground text-sm font-medium">Ask</button>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Drag handle, sticky header, padded content. Used for AI assistance and Share.</p>
            </ExampleCard>

            <ExampleCard title="Status & feedback">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border text-[13px] font-medium text-foreground shadow-sm">
                  <Check className="w-3.5 h-3.5 text-success" /> Link copied
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border text-[13px] font-medium text-muted-foreground shadow-sm">
                  <Info className="w-3.5 h-3.5" /> AI summary — verify
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Top-anchored card pills, never heavy black toasts.</p>
            </ExampleCard>
          </div>
        </Section>

        {/* Iconography */}
        <Section
          id="iconography"
          title="Iconography"
          description="Lucide icons exclusively — single weight, 1.5px stroke, 20–24px on mobile. Never mix with other icon sets."
        >
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[
              ["Search", Search],
              ["Sparkles", Sparkles],
              ["Bookmark", Bookmark],
              ["Download", Download],
              ["Share2", Share2],
              ["Check", Check],
              ["Mic", Mic],
              ["Volume2", Volume2],
            ].map(([name, Icon]) => {
              const I = Icon as typeof Search
              return (
                <div key={name as string} className="flex flex-col items-center gap-2 py-3 rounded-xl bg-muted/40">
                  <I className="w-5 h-5 text-foreground" />
                  <code className="text-[10px] font-mono text-muted-foreground">{name as string}</code>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Motion */}
        <Section
          id="motion"
          title="Motion"
          description="Calm, purposeful, and respectful of prefers-reduced-motion. Every animation is < 300ms unless it's a streaming indicator."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Tokens</h3>
              <TokenRow name="Press feedback" value="active:scale-95" note="≈ 100ms tap pulse" />
              <TokenRow name="Hover/state" value="200ms ease-out" />
              <TokenRow name="Bottom sheet" value="200–250ms" note="slide-in-from-bottom" />
              <TokenRow name="Streaming shimmer" value="1.4–2s loop" note="Pauses with reduced-motion" />
              <TokenRow name="Toast" value="fade + slide-from-top, 1.8s lifetime" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Reduced motion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Globals override animation-duration and transition-duration to ~0 when the user has reduced
                motion enabled. The streaming shimmer is paused. All affordances still function.
              </p>
            </div>
          </div>
        </Section>

        {/* Do / Don't */}
        <Section
          id="do-dont"
          title="Do / Don't"
          description="Quick checks for anyone shipping new screens."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border-l-4 border-success bg-success/5 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Do</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Use Pacific Blue for links, focus rings, and selected states</li>
                <li>Reserve Crimson for the brand mark and one primary CTA per screen</li>
                <li>Use Lucide icons at 20–24px with the foreground color</li>
                <li>Keep tap targets ≥ 44 × 44px</li>
                <li>Show the AI source documents alongside any AI answer</li>
                <li>Respect prefers-reduced-motion</li>
              </ul>
            </div>
            <div className="rounded-2xl border-l-4 border-primary bg-primary/5 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Don't</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Use Crimson for icon tiles, doc counts, or selected nav</li>
                <li>Mix icon families or stroke weights</li>
                <li>Stack heavy black toasts at the bottom of the screen</li>
                <li>Use gradients on brand surfaces</li>
                <li>Surface a count where the actual work could be shown</li>
                <li>Build new sticky chrome above the article body — use the rail or sheet</li>
              </ul>
            </div>
          </div>
        </Section>

        <footer className="pt-8 pb-4 text-xs text-muted-foreground">
          <p>
            Sources: <a className="text-interactive-deep underline" href="https://www.redcross.org/lp/brand-standards.html" target="_blank" rel="noreferrer">ARC Brand Standards</a>{" "}
            · design questions: <a className="font-mono text-interactive-deep underline" href="mailto:dhillis@ingeniux.com">dhillis@ingeniux.com</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
