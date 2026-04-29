"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  BellOff,
  BookOpen,
  Bookmark,
  Download,
  ChevronRight,
  LogOut,
  Mail,
  MapPin,
  Briefcase,
  Wifi,
  Trash2,
  Sun,
  Moon,
  Smartphone,
  Type,
  ExternalLink,
  Info,
  HelpCircle,
  Pencil,
  Check,
  X,
  Vibrate,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void
}

const userProfile = {
  name: "Sarah Johnson",
  email: "sarah.johnson@redcross.org",
  chapter: "Greater Metro Chapter",
  region: "Pacific Region",
  positions: ["Service Associate", "Shelter Manager", "Feeding Lead"],
  serviceAreas: ["Mass Care", "Feeding"],
  joinedAt: "Mar 2021",
}

// ---------------------------------------------------------------------------
// Switch — mobile-friendly toggle (44pt tap target, large thumb, Pacific Blue
// when on). Use for boolean settings.
// ---------------------------------------------------------------------------
function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center w-[52px] h-[32px] rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive/40",
        checked ? "bg-interactive" : "bg-muted-foreground/25",
        disabled && "opacity-50"
      )}
    >
      <span
        className={cn(
          "absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  )
}

// Row primitive used everywhere in the settings list. Always 56px tall.
function Row({
  icon: Icon,
  label,
  description,
  trailing,
  onClick,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description?: string
  trailing?: React.ReactNode
  onClick?: () => void
  destructive?: boolean
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 min-h-[56px] py-2.5 text-left transition-colors",
        onClick && "active:bg-muted/60 hover:bg-muted/30 cursor-pointer"
      )}
    >
      <span
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          destructive ? "bg-primary/10" : "bg-muted"
        )}
      >
        <Icon className={cn("w-4.5 h-4.5", destructive ? "text-primary" : "text-foreground")} />
      </span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[15px] font-medium", destructive ? "text-primary" : "text-foreground")}>
          {label}
        </p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
      </div>
      {trailing}
    </Comp>
  )
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-3">
      {title && (
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 ml-1">
          {title}
        </h2>
      )}
      <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type ThemeChoice = "light" | "dark" | "system"
type TextScale = "compact" | "default" | "large"

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  // Persisted settings — localStorage so toggles survive across sessions.
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifNew, setNotifNew] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(true)
  const [notifDeployments, setNotifDeployments] = useState(true)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default")
  const [autoDownload, setAutoDownload] = useState(true)
  const [haptics, setHaptics] = useState(true)
  const [theme, setTheme] = useState<ThemeChoice>("system")
  const [textScale, setTextScale] = useState<TextScale>("default")
  const [storageUsed, setStorageUsed] = useState<string | null>(null)
  const [installEvent, setInstallEvent] = useState<Event | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)

  // Hydrate from localStorage + check notification permission
  useEffect(() => {
    try {
      const raw = localStorage.getItem("arc_profile_settings")
      if (raw) {
        const s = JSON.parse(raw)
        if (typeof s.notifEnabled === "boolean") setNotifEnabled(s.notifEnabled)
        if (typeof s.notifNew === "boolean") setNotifNew(s.notifNew)
        if (typeof s.notifUpdates === "boolean") setNotifUpdates(s.notifUpdates)
        if (typeof s.notifDeployments === "boolean") setNotifDeployments(s.notifDeployments)
        if (typeof s.autoDownload === "boolean") setAutoDownload(s.autoDownload)
        if (typeof s.haptics === "boolean") setHaptics(s.haptics)
        if (s.theme) setTheme(s.theme)
        if (s.textScale) setTextScale(s.textScale)
      }
    } catch {}

    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission)
    }

    // Storage estimate
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage != null) {
          const mb = est.usage / (1024 * 1024)
          setStorageUsed(mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`)
        }
      })
    }

    // PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  // Persist settings whenever any toggle changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "arc_profile_settings",
        JSON.stringify({
          notifEnabled,
          notifNew,
          notifUpdates,
          notifDeployments,
          autoDownload,
          haptics,
          theme,
          textScale,
        })
      )
    } catch {}
  }, [notifEnabled, notifNew, notifUpdates, notifDeployments, autoDownload, haptics, theme, textScale])

  // Theme application
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      // system
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", isDark)
    }
  }, [theme])

  // Text scale → CSS variable
  useEffect(() => {
    if (typeof document === "undefined") return
    const map: Record<TextScale, string> = { compact: "0.94", default: "1", large: "1.10" }
    document.documentElement.style.setProperty("--text-scale", map[textScale])
  }, [textScale])

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") return
    if (Notification.permission === "granted") {
      setNotifEnabled(true)
      return
    }
    const result = await Notification.requestPermission()
    setNotifPermission(result)
    if (result === "granted") {
      setNotifEnabled(true)
      // Tap haptic if available
      if (haptics && navigator.vibrate) navigator.vibrate(10)
      try {
        new Notification("Notifications enabled", {
          body: "You'll get updates for the doctrine that matters to your roles.",
        })
      } catch {}
    } else {
      setNotifEnabled(false)
    }
  }

  const handleNotifToggle = (next: boolean) => {
    if (next) {
      // Request permission on the way ON
      requestNotificationPermission()
    } else {
      setNotifEnabled(false)
    }
  }

  const handleClearCache = async () => {
    if (!confirm("Clear all cached doctrine, AI summaries, and search history?")) return
    try {
      localStorage.removeItem("arc_recent_searches")
      // Clear any tts_audio_* entries
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("tts_audio_")) localStorage.removeItem(k)
      })
      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      // Re-run the storage estimate
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate()
        if (est.usage != null) {
          const mb = est.usage / (1024 * 1024)
          setStorageUsed(mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`)
        }
      }
    } catch {}
  }

  const handleInstall = async () => {
    if (!installEvent) return
    const e = installEvent as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
    await e.prompt()
    await e.userChoice
    setInstallEvent(null)
  }

  return (
    <div className="flex flex-col min-h-full bg-muted/30 pb-4">
      {/* Hero */}
      <header className="px-5 pt-14 pb-6 bg-background border-b border-border">
        <div className="flex items-start gap-4 mb-5">
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-card shadow-sm shrink-0 group"
            aria-label="Edit profile photo"
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=facearea&facepad=2.2&auto=format&q=80"
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 h-7 bg-foreground/55 backdrop-blur-sm flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-background" />
            </span>
          </button>
          <div className="flex-1 min-w-0 pt-0.5">
            <h1 className="text-xl font-semibold text-foreground truncate">{userProfile.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{userProfile.email}</p>
            <p className="text-xs text-muted-foreground truncate mt-1 inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden /> {userProfile.chapter}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Volunteer since {userProfile.joinedAt}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5 flex items-center gap-1">
              <Briefcase className="w-3 h-3" aria-hidden /> Positions
            </p>
            <p className="text-[13px] font-medium text-foreground">{userProfile.positions.length} active</p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5 flex items-center gap-1">
              <Bookmark className="w-3 h-3" aria-hidden /> Bookmarks
            </p>
            <p className="text-[13px] font-medium text-foreground">12 saved</p>
          </div>
        </div>
      </header>

      {/* PWA install prompt — only shows when the browser fired the event */}
      {installEvent && (
        <section className="px-5 pt-4">
          <button
            onClick={handleInstall}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-interactive-soft/40 border border-interactive/20 active:scale-[0.99] transition"
          >
            <span className="w-10 h-10 rounded-xl bg-interactive flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-interactive-foreground" />
            </span>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-foreground">Install on this device</p>
              <p className="text-xs text-muted-foreground">Open from your home screen, work offline.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </section>
      )}

      {/* Roles & areas */}
      <Group title="Roles & service areas">
        <Row
          icon={Briefcase}
          label="Positions"
          description={userProfile.positions.join(", ")}
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
        />
        <Row
          icon={MapPin}
          label="Service areas"
          description={userProfile.serviceAreas.join(", ")}
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
        />
      </Group>

      {/* Notifications */}
      <Group title="Notifications">
        <Row
          icon={notifEnabled ? Bell : BellOff}
          label="Push notifications"
          description={
            notifPermission === "denied"
              ? "Permission blocked — enable in browser settings"
              : notifEnabled
                ? "Updates for your roles + deployments"
                : "Off"
          }
          trailing={
            <Switch
              checked={notifEnabled && notifPermission === "granted"}
              onChange={handleNotifToggle}
              label="Push notifications"
              disabled={notifPermission === "denied"}
            />
          }
        />
        {notifEnabled && notifPermission === "granted" && (
          <>
            <Row
              icon={BookOpen}
              label="New doctrine"
              description="When a Task Sheet you'd care about is added"
              trailing={
                <Switch checked={notifNew} onChange={setNotifNew} label="New doctrine notifications" />
              }
            />
            <Row
              icon={Pencil}
              label="Updates to your roles"
              description="Revisions to docs tagged for your positions"
              trailing={
                <Switch checked={notifUpdates} onChange={setNotifUpdates} label="Role update notifications" />
              }
            />
            <Row
              icon={MapPin}
              label="Field deployments"
              description="Activations affecting your region"
              trailing={
                <Switch
                  checked={notifDeployments}
                  onChange={setNotifDeployments}
                  label="Deployment notifications"
                />
              }
            />
          </>
        )}
      </Group>

      {/* Display */}
      <Group title="Display">
        <Row
          icon={theme === "dark" ? Moon : theme === "light" ? Sun : Smartphone}
          label="Theme"
          trailing={
            <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
              {(["light", "system", "dark"] as ThemeChoice[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTheme(opt)}
                  aria-pressed={theme === opt}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition",
                    theme === opt ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          }
        />
        <Row
          icon={Type}
          label="Text size"
          trailing={
            <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
              {(["compact", "default", "large"] as TextScale[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTextScale(opt)}
                  aria-pressed={textScale === opt}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-semibold transition",
                    textScale === opt ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {opt === "compact" ? "S" : opt === "default" ? "M" : "L"}
                </button>
              ))}
            </div>
          }
        />
        <Row
          icon={Vibrate}
          label="Haptics"
          description="Subtle vibration on actions"
          trailing={<Switch checked={haptics} onChange={setHaptics} label="Haptics" />}
        />
      </Group>

      {/* Offline & data */}
      <Group title="Offline & data">
        <Row
          icon={Wifi}
          label="Auto-download on Wi-Fi"
          description="Save the docs you've bookmarked for offline access"
          trailing={<Switch checked={autoDownload} onChange={setAutoDownload} label="Auto-download" />}
        />
        <Row
          icon={Download}
          label="Storage used"
          description={storageUsed ?? "Calculating…"}
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => onNavigate("downloads")}
        />
        <Row
          icon={Trash2}
          label="Clear cache"
          description="Removes saved doctrine, search history, and TTS audio"
          onClick={handleClearCache}
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
        />
      </Group>

      {/* Reading */}
      <Group title="Reading">
        <Row
          icon={Bookmark}
          label="Bookmarks"
          description="12 saved articles"
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
        />
        <Row
          icon={BookOpen}
          label="Reading history"
          description="What you've opened recently"
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
        />
      </Group>

      {/* Account */}
      <Group title="Account">
        <Row
          icon={Mail}
          label="Email"
          description={userProfile.email}
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
        />
        <Row
          icon={Pencil}
          label="Edit profile"
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => setEditingProfile(true)}
        />
      </Group>

      {/* About */}
      <Group title="About">
        <Row
          icon={HelpCircle}
          label="Help & feedback"
          trailing={<ExternalLink className="w-4 h-4 text-muted-foreground" />}
          onClick={() => window.open("mailto:doctrine-feedback@redcross.org", "_blank")}
        />
        <Row
          icon={Info}
          label="About Red Cross Doctrine"
          description="Version 1.0 · Build 2026.04"
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
        />
      </Group>

      {/* Sign out */}
      <section className="px-5 pt-4 pb-2">
        <button
          onClick={() => onNavigate("login")}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-border text-foreground text-sm font-medium hover:bg-muted active:scale-[0.99] transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </section>

      <p className="text-center text-[11px] text-muted-foreground mt-3 mb-2">
        Red Cross Doctrine · v1.0 · {userProfile.region}
      </p>

      {/* Edit profile modal */}
      {editingProfile && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setEditingProfile(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-card rounded-t-3xl border-t border-border shadow-2xl max-h-[85%] overflow-y-auto"
          >
            <div className="sticky top-0 bg-card pt-2 pb-3 border-b border-border">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/30 mb-3" aria-hidden />
              <div className="flex items-center justify-between px-5">
                <h2 className="text-base font-semibold text-foreground">Edit profile</h2>
                <button
                  onClick={() => setEditingProfile(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted active:scale-95 transition"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Profile details sync from your American Red Cross account. Changes here update locally for the
                demo.
              </p>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Display name</span>
                <input
                  defaultValue={userProfile.name}
                  className="mt-1 w-full h-11 px-4 rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-interactive/40"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <input
                  defaultValue={userProfile.email}
                  type="email"
                  className="mt-1 w-full h-11 px-4 rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-interactive/40"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Chapter</span>
                <input
                  defaultValue={userProfile.chapter}
                  className="mt-1 w-full h-11 px-4 rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-interactive/40"
                />
              </label>
              <button
                onClick={() => setEditingProfile(false)}
                className="w-full h-12 rounded-2xl bg-foreground text-background text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
              >
                <Check className="w-4 h-4" /> Save changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
