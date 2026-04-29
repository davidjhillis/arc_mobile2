"use client"

import { useEffect, useRef, useState } from "react"
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
  Camera,
  Check,
  X,
  Vibrate,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "../app-shell"

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=facearea&facepad=2.2&auto=format&q=80"

const defaultProfile = {
  name: "Sarah Johnson",
  email: "sarah.johnson@redcross.org",
  chapter: "Greater Metro Chapter",
  region: "Pacific Region",
  positions: ["Service Associate", "Shelter Manager", "Feeding Lead"],
  serviceAreas: ["Mass Care", "Feeding"],
  joinedAt: "Mar 2021",
}

// ---------------------------------------------------------------------------
// Switch — mobile-friendly toggle (44pt tap target).
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

// Settings row primitive. Pass `onClick` only if the row actually leads
// somewhere — otherwise the chevron is omitted so we never advertise
// affordances that don't exist.
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
        {description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>}
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

const TEXT_SCALE_VALUES: Record<TextScale, string> = {
  compact: "0.92",
  default: "1",
  large: "1.15",
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  // --- Identity (editable) ---
  const [profile, setProfile] = useState(defaultProfile)
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR)
  const [editingProfile, setEditingProfile] = useState(false)
  const [draftName, setDraftName] = useState(defaultProfile.name)
  const [draftEmail, setDraftEmail] = useState(defaultProfile.email)
  const [draftChapter, setDraftChapter] = useState(defaultProfile.chapter)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Settings ---
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
  const [savedToast, setSavedToast] = useState(false)

  // Hydrate everything from localStorage on first mount
  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem("arc_profile")
      if (rawProfile) {
        const p = JSON.parse(rawProfile)
        setProfile((curr) => ({ ...curr, ...p }))
        if (p.name) setDraftName(p.name)
        if (p.email) setDraftEmail(p.email)
        if (p.chapter) setDraftChapter(p.chapter)
      }
      const rawAvatar = localStorage.getItem("arc_profile_avatar")
      if (rawAvatar) setAvatarUrl(rawAvatar)

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

    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage != null) {
          const mb = est.usage / (1024 * 1024)
          setStorageUsed(mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`)
        }
      })
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  // Persist settings whenever they change
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

  // Apply theme class
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      root.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [theme])

  // Apply text scale to root — all rem-based sizes cascade.
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.style.setProperty("--text-scale", TEXT_SCALE_VALUES[textScale])
  }, [textScale])

  // ---------- Avatar ----------
  const openAvatarPicker = () => fileInputRef.current?.click()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Choose one under 5 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      if (result) {
        setAvatarUrl(result)
        try {
          localStorage.setItem("arc_profile_avatar", result)
        } catch {
          // localStorage may reject huge data URLs — fall back to in-memory only
        }
        if (haptics && navigator.vibrate) navigator.vibrate(10)
      }
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be picked again later
    e.target.value = ""
  }

  const resetAvatar = () => {
    setAvatarUrl(DEFAULT_AVATAR)
    try {
      localStorage.removeItem("arc_profile_avatar")
    } catch {}
  }

  // ---------- Profile edit ----------
  const handleSaveProfile = () => {
    const next = {
      ...profile,
      name: draftName.trim() || profile.name,
      email: draftEmail.trim() || profile.email,
      chapter: draftChapter.trim() || profile.chapter,
    }
    setProfile(next)
    try {
      localStorage.setItem("arc_profile", JSON.stringify(next))
    } catch {}
    setEditingProfile(false)
    setSavedToast(true)
    if (haptics && navigator.vibrate) navigator.vibrate(10)
    setTimeout(() => setSavedToast(false), 1800)
  }

  // ---------- Notifications ----------
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
      requestNotificationPermission()
    } else {
      setNotifEnabled(false)
    }
  }

  // ---------- Cache ----------
  const handleClearCache = async () => {
    if (!confirm("Clear all cached doctrine, AI summaries, and search history?")) return
    try {
      localStorage.removeItem("arc_recent_searches")
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("tts_audio_")) localStorage.removeItem(k)
      })
      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate()
        if (est.usage != null) {
          const mb = est.usage / (1024 * 1024)
          setStorageUsed(mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`)
        }
      }
    } catch {}
  }

  // ---------- PWA install ----------
  const handleInstall = async () => {
    if (!installEvent) return
    const e = installEvent as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
    await e.prompt()
    await e.userChoice
    setInstallEvent(null)
  }

  return (
    <div className="flex flex-col min-h-full bg-muted/30 pb-4">
      {/* Hidden file input drives the avatar picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleAvatarChange}
      />

      {/* Hero */}
      <header className="px-5 pt-14 pb-6 bg-background border-b border-border">
        <div className="flex items-start gap-4 mb-5">
          {/* Tappable avatar — opens file picker, with overlaid camera affordance */}
          <button
            onClick={openAvatarPicker}
            className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-card shadow-sm shrink-0 group active:scale-95 transition"
            aria-label="Change profile photo"
          >
            <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 h-7 bg-foreground/55 backdrop-blur-sm flex items-center justify-center gap-1 text-background text-[10px] font-semibold">
              <Camera className="w-3 h-3" />
              Change
            </span>
          </button>
          <div className="flex-1 min-w-0 pt-0.5">
            <h1 className="text-xl font-semibold text-foreground truncate">{profile.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
            <p className="text-xs text-muted-foreground truncate mt-1 inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden /> {profile.chapter}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Volunteer since {profile.joinedAt}</p>
          </div>
        </div>

        {avatarUrl !== DEFAULT_AVATAR && (
          <button
            onClick={resetAvatar}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4"
          >
            <RotateCcw className="w-3 h-3" /> Reset photo
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5 flex items-center gap-1">
              <Briefcase className="w-3 h-3" aria-hidden /> Positions
            </p>
            <p className="text-[13px] font-medium text-foreground">{profile.positions.length} active</p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden /> Region
            </p>
            <p className="text-[13px] font-medium text-foreground truncate">{profile.region}</p>
          </div>
        </div>
      </header>

      {/* PWA install prompt */}
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

      {/* Roles & areas — display only for now (data comes from ARC) */}
      <Group title="Roles & service areas">
        <Row
          icon={Briefcase}
          label="Positions"
          description={profile.positions.join(" · ")}
        />
        <Row
          icon={MapPin}
          label="Service areas"
          description={profile.serviceAreas.join(" · ")}
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
              description="Task Sheets relevant to your roles"
              trailing={<Switch checked={notifNew} onChange={setNotifNew} label="New doctrine notifications" />}
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
            <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
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
          description={
            textScale === "compact" ? "Smaller (92%)" : textScale === "large" ? "Larger (115%)" : "System default"
          }
          trailing={
            <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
              {(["compact", "default", "large"] as TextScale[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTextScale(opt)}
                  aria-pressed={textScale === opt}
                  className={cn(
                    "h-7 w-9 rounded-full font-semibold transition",
                    textScale === opt ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                    opt === "compact" && "text-[11px]",
                    opt === "default" && "text-[13px]",
                    opt === "large" && "text-[15px]"
                  )}
                >
                  Aa
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
          description="Save bookmarked docs for offline access"
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
          destructive
        />
      </Group>

      {/* Account */}
      <Group title="Account">
        <Row icon={Mail} label="Email" description={profile.email} />
        <Row
          icon={Pencil}
          label="Edit profile"
          description="Update name, email, or chapter"
          trailing={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {
            setDraftName(profile.name)
            setDraftEmail(profile.email)
            setDraftChapter(profile.chapter)
            setEditingProfile(true)
          }}
        />
      </Group>

      {/* About */}
      <Group title="About">
        <Row
          icon={HelpCircle}
          label="Help & feedback"
          description="Email the doctrine team"
          trailing={<ExternalLink className="w-4 h-4 text-muted-foreground" />}
          onClick={() => window.open("mailto:doctrine-feedback@redcross.org", "_blank")}
        />
        <Row
          icon={Info}
          label="About this app"
          description="Version 1.0 · Build 2026.04"
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
        Red Cross Doctrine · v1.0
      </p>

      {/* Saved toast */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed z-50 top-20 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border shadow-md text-[13px] font-medium text-foreground"
        >
          <Check className="w-3.5 h-3.5 text-success" aria-hidden /> Profile saved
        </div>
      )}

      {/* Edit profile modal — saves to localStorage */}
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
            <div className="sticky top-0 z-10 bg-card pt-2 pb-3 border-b border-border">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-muted-foreground/30 mb-3" aria-hidden />
              <div className="flex items-center justify-between px-5">
                <h2 className="text-base font-semibold text-foreground">Edit profile</h2>
                <button
                  onClick={() => setEditingProfile(false)}
                  aria-label="Close"
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full hover:bg-muted active:scale-95 transition text-foreground text-xs font-semibold"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Avatar in the edit sheet */}
              <div className="flex items-center gap-4">
                <button
                  onClick={openAvatarPicker}
                  className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-card shadow-sm shrink-0 active:scale-95 transition"
                >
                  <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 h-7 bg-foreground/55 backdrop-blur-sm flex items-center justify-center gap-1 text-background text-[10px] font-semibold">
                    <Camera className="w-3 h-3" /> Change
                  </span>
                </button>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Profile photo</p>
                  <p className="text-xs text-muted-foreground/80 leading-snug mt-1">
                    Tap to choose a new image. Stored locally on this device.
                  </p>
                  {avatarUrl !== DEFAULT_AVATAR && (
                    <button
                      onClick={resetAvatar}
                      className="mt-2 text-xs font-medium text-interactive hover:text-interactive-deep"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Display name</span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-interactive/40"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <input
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  type="email"
                  inputMode="email"
                  className="mt-1 w-full h-11 px-4 rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-interactive/40"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Chapter</span>
                <input
                  value={draftChapter}
                  onChange={(e) => setDraftChapter(e.target.value)}
                  className="mt-1 w-full h-11 px-4 rounded-xl bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-interactive/40"
                />
              </label>

              <button
                onClick={handleSaveProfile}
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
