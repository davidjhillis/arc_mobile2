"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from "react"
import {
  Search,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronRight,
  FileText,
  ListChecks,
  BookOpen,
  UserCircle2,
  Loader2,
  ArrowUp,
  Mic,
  MicOff,
} from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { cn } from "@/lib/utils"
import { massCareContent, type DoctrineContent } from "@/lib/mass-care-content"

// ---------------------------------------------------------------------------
// Search index + boolean parser
// ---------------------------------------------------------------------------

type IndexedDoc = DoctrineContent & {
  haystack: string // lowercased title + summary + content for matching
}

const buildIndex = (): IndexedDoc[] =>
  Object.values(massCareContent).map((doc) => ({
    ...doc,
    haystack: `${doc.title} ${doc.summary} ${doc.content}`.toLowerCase(),
  }))

// Stopwords filtered from natural-language queries
const STOPWORDS = new Set([
  "a","an","the","and","or","of","to","in","on","at","for","by","with","is","are","was","were",
  "do","does","did","be","been","being","have","has","had","i","my","me","you","your","we","our",
  "this","that","these","those","it","its","as","from","but","not","if","so","than","then","into",
  "what","which","who","whom","when","where","why","how","can","could","should","would","will","may",
])

// Tiny boolean expression parser.
// Supports: quoted "exact phrase", AND, OR, NOT, parentheses, and field:value
// (field one of: title, category, type). Bare terms are AND-joined.
type BoolNode =
  | { kind: "term"; value: string; field?: "title" | "category" | "type" }
  | { kind: "phrase"; value: string }
  | { kind: "and"; left: BoolNode; right: BoolNode }
  | { kind: "or"; left: BoolNode; right: BoolNode }
  | { kind: "not"; child: BoolNode }

const tokenize = (q: string): string[] => {
  const tokens: string[] = []
  // Match (in order): field:"phrase", "phrase", paren, boolean, bare term
  const re = /\s*(?:(\w+:"(?:[^"\\]|\\.)*")|("(?:[^"\\]|\\.)*")|(\()|(\))|(AND|OR|NOT)\b|([^\s()]+))/gy
  let m: RegExpExecArray | null
  while ((m = re.exec(q))) {
    const t = m[1] || m[2] || m[3] || m[4] || m[5] || m[6]
    if (t) tokens.push(t)
    if (re.lastIndex === m.index) break
  }
  return tokens
}

const parseQuery = (q: string): BoolNode | null => {
  const tokens = tokenize(q.trim())
  if (!tokens.length) return null
  let i = 0

  const peek = () => tokens[i]
  const consume = () => tokens[i++]

  // expression := term (OR term)*
  const parseExpr = (): BoolNode => {
    let left = parseAnd()
    while (peek() === "OR") {
      consume()
      const right = parseAnd()
      left = { kind: "or", left, right }
    }
    return left
  }

  // and := unary (AND? unary)*  — implicit AND between bare terms
  const parseAnd = (): BoolNode => {
    let left = parseUnary()
    while (peek() && peek() !== "OR" && peek() !== ")") {
      if (peek() === "AND") consume()
      const right = parseUnary()
      left = { kind: "and", left, right }
    }
    return left
  }

  // Strip surrounding punctuation that natural-language queries often carry
  // ("215?" → "215", "shelter," → "shelter") while preserving internal chars.
  const cleanTerm = (s: string) => s.replace(/^[^\w]+|[^\w]+$/g, "").toLowerCase()

  const parseUnary = (): BoolNode => {
    if (peek() === "NOT") {
      consume()
      return { kind: "not", child: parseUnary() }
    }
    if (peek() === "(") {
      consume()
      const inner = parseExpr()
      if (peek() === ")") consume()
      return inner
    }
    const tok = consume()!
    if (tok.startsWith('"') && tok.endsWith('"')) {
      return { kind: "phrase", value: tok.slice(1, -1).toLowerCase() }
    }
    // field:value form (supports field:"quoted phrase" too)
    const colon = tok.indexOf(":")
    if (colon > 0) {
      const field = tok.slice(0, colon).toLowerCase()
      const rawValue = tok.slice(colon + 1)
      const value = rawValue.replace(/^"(.*)"$/, "$1").toLowerCase()
      if (field === "title" || field === "category" || field === "type") {
        return { kind: "term", value, field }
      }
    }
    return { kind: "term", value: cleanTerm(tok) }
  }

  try {
    return parseExpr()
  } catch {
    return null
  }
}

const evalNode = (node: BoolNode, doc: IndexedDoc): boolean => {
  switch (node.kind) {
    case "term":
      if (!node.value) return true // empty term (e.g. lone punctuation) is a no-op
      if (node.field === "title") return doc.title.toLowerCase().includes(node.value)
      if (node.field === "category") return doc.category.toLowerCase().includes(node.value)
      if (node.field === "type") return doc.type.toLowerCase() === node.value
      return doc.haystack.includes(node.value)
    case "phrase":
      return doc.haystack.includes(node.value)
    case "and":
      return evalNode(node.left, doc) && evalNode(node.right, doc)
    case "or":
      return evalNode(node.left, doc) || evalNode(node.right, doc)
    case "not":
      return !evalNode(node.child, doc)
  }
}

// Score for ranking — title hits count strongest, then summary, then body.
// We also reward partial-stem matches so "completes" can hit "completing".
const scoreDoc = (doc: IndexedDoc, terms: string[]): number => {
  let s = 0
  const title = doc.title.toLowerCase()
  const summary = doc.summary.toLowerCase()
  for (const t of terms) {
    if (!t || t.length < 2) continue
    // Exact substring (highest signal)
    if (title.includes(t)) s += 10
    if (summary.includes(t)) s += 5
    const matches = doc.haystack.split(t).length - 1
    s += matches
    // Stem-ish fallback: try the 4-char prefix (catches complete/completes/completing)
    if (matches === 0 && t.length >= 5) {
      const stem = t.slice(0, t.length - 2)
      const stemMatches = doc.haystack.split(stem).length - 1
      s += stemMatches * 0.5
      if (title.includes(stem)) s += 3
    }
  }
  return s
}

// Detect whether the raw query uses explicit boolean syntax. If not, we run a
// looser natural-language match instead of strict AND-everything semantics.
const isBooleanQuery = (q: string): boolean =>
  /\b(AND|OR|NOT)\b/.test(q) || /["()]/.test(q) || /\b(title|category|type):/i.test(q)

// For natural queries: extract content terms (drop stopwords + clean punctuation)
const naturalTerms = (q: string): string[] =>
  q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/^[^\w]+|[^\w]+$/g, ""))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))

// Build a contextual snippet around the first match, with the term emphasized.
const buildSnippet = (doc: IndexedDoc, terms: string[]): { text: string; matchIndex: number } => {
  const text = doc.content.replace(/\n+/g, " ").replace(/##+\s*/g, "").replace(/\s+/g, " ")
  const lower = text.toLowerCase()
  let idx = -1
  for (const t of terms) {
    if (!t) continue
    const i = lower.indexOf(t)
    if (i >= 0 && (idx === -1 || i < idx)) idx = i
  }
  if (idx === -1) return { text: doc.summary, matchIndex: -1 }
  const start = Math.max(0, idx - 60)
  const end = Math.min(text.length, idx + 140)
  const prefix = start > 0 ? "…" : ""
  const suffix = end < text.length ? "…" : ""
  return { text: prefix + text.slice(start, end) + suffix, matchIndex: idx - start + prefix.length }
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

const TYPE_LABEL: Record<DoctrineContent["type"], string> = {
  overview: "Overview",
  standard: "Standard",
  "task-sheet": "Task Sheet",
  role: "Role",
}

const TYPE_ICON: Record<DoctrineContent["type"], typeof FileText> = {
  overview: BookOpen,
  standard: FileText,
  "task-sheet": ListChecks,
  role: UserCircle2,
}

// Curated demo queries — each one is known to surface relevant doctrine.
const SUGGESTED_QUERIES = [
  "Who completes a Form 215?",
  "Daily tactics planning",
  "Closing mass care activities",
  "situational awareness AND reports",
  '"Mass Care" NOT closing',
  "type:task-sheet leadership",
]

type Filter = "all" | DoctrineContent["type"]

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "task-sheet", label: "Task Sheets" },
  { id: "standard", label: "Standards" },
  { id: "overview", label: "Overviews" },
  { id: "role", label: "Roles" },
]

// ---------------------------------------------------------------------------
// Tiny markdown renderer for the AI answer card.
// Handles paragraphs, bold (**), italic (*), inline code (`), bullet lists, and
// line breaks. Intentionally minimal — the AI output stays terse.
// ---------------------------------------------------------------------------

const renderInline = (text: string, keyBase: string): React.ReactNode[] => {
  const out: React.ReactNode[] = []
  // Match bold, italic, code in a single pass; preserves order.
  const re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = re.exec(text))) {
    if (match.index > lastIndex) {
      out.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith("**")) {
      out.push(
        <strong key={`${keyBase}-b-${i++}`} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith("`")) {
      out.push(
        <code key={`${keyBase}-c-${i++}`} className="font-mono text-[0.92em] bg-card/70 px-1 py-0.5 rounded">
          {token.slice(1, -1)}
        </code>
      )
    } else {
      out.push(
        <em key={`${keyBase}-i-${i++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      )
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex))
  return out
}

const Markdown = ({ text }: { text: string }) => {
  // Split into blocks separated by blank lines (paragraph breaks).
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/)
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n")
        // List block — every line starts with "- " or "* "
        if (lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={bi} className="list-disc pl-5 space-y-1 my-2">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          )
        }
        // Paragraph — keep single \n as line break inside
        return (
          <p key={bi} className={bi > 0 ? "mt-3" : ""}>
            {lines.map((l, li) => (
              <span key={li}>
                {renderInline(l, `${bi}-${li}`)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </>
  )
}

interface AskScreenProps {
  initialMessage?: string
  onNavigate?: (screen: string, doctrineId?: string) => void
}

export interface AskScreenRef {
  sendMessage: (text: string) => void
}

export const AskScreen = forwardRef<AskScreenRef, AskScreenProps>(({ initialMessage, onNavigate }, ref) => {
  const [query, setQuery] = useState(initialMessage ?? "")
  const [committedQuery, setCommittedQuery] = useState(initialMessage ?? "")
  const [filter, setFilter] = useState<Filter>("all")
  const [aiAnswer, setAiAnswer] = useState<string>("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiExpanded, setAiExpanded] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)

  // TTS for the AI answer
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsLoading, setTtsLoading] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const aiAbortRef = useRef<AbortController | null>(null)

  // Voice dictation — types into the search field, doesn't auto-submit.
  const {
    isListening,
    interimTranscript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    reset: resetSpeech,
  } = useSpeechRecognition({
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        setQuery((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()))
        resetSpeech()
        stopListening()
        // Refocus so the user can edit or submit
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    },
  })

  // Memoized index — built once
  const index = useMemo(() => buildIndex(), [])

  // Hydrate recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("arc_recent_searches")
      if (raw) setRecentSearches(JSON.parse(raw))
    } catch {}
  }, [])

  // Imperative API kept so app-shell still compiles
  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      setQuery(text)
      runSearch(text)
    },
  }))

  // If we land here with an initialMessage, run the search
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      runSearch(initialMessage)
    } else {
      // Focus the search input on mount when empty
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------- Search execution ----------------

  const persistRecent = (q: string) => {
    const next = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 3)
    setRecentSearches(next)
    try {
      localStorage.setItem("arc_recent_searches", JSON.stringify(next))
    } catch {}
  }

  const clearRecent = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem("arc_recent_searches")
    } catch {}
  }

  const runSearch = (raw: string) => {
    const q = raw.trim()
    if (!q) {
      setCommittedQuery("")
      setAiAnswer("")
      setAiError(null)
      return
    }
    setCommittedQuery(q)
    persistRecent(q)
    fetchAiAnswer(q)
  }

  const fetchAiAnswer = async (q: string) => {
    // Cancel in-flight request
    aiAbortRef.current?.abort()
    const controller = new AbortController()
    aiAbortRef.current = controller

    setAiAnswer("")
    setAiError(null)
    setAiLoading(true)
    setAiExpanded(false)
    stopSpeaking()

    // Build a context block from top-3 candidate docs so the AI grounds its answer.
    // Natural queries use OR-with-scoring so the AI gets relevant docs even when
    // not every word literally appears in the source.
    const terms = naturalTerms(q)
    const candidates = isBooleanQuery(q)
      ? (() => {
          const node = parseQuery(q)
          return node ? index.filter((d) => evalNode(node, d)) : index
        })()
      : index
    const ranked = candidates
      .map((d) => ({ d, s: scoreDoc(d, terms) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map(({ d }) => `---\nArticle: ${d.title}\nCategory: ${d.category}\nSummary: ${d.summary}\n\n${d.content.substring(0, 2500)}\n---`)
      .join("\n\n")

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          context: ranked || undefined,
        }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream")
      const decoder = new TextDecoder()
      let acc = ""
      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // Process complete SSE messages — separated by blank line (\n\n) per spec
        let idx
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const evt = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)
          for (const line of evt.split("\n")) {
            const t = line.trim()
            if (!t.startsWith("data:")) continue
            const data = t.slice(5).trim()
            if (!data || data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              // Our /api/ai/chat re-encodes chunks as { content: "..." }
              const delta =
                typeof parsed?.content === "string"
                  ? parsed.content
                  : parsed?.choices?.[0]?.delta?.content
              if (typeof delta === "string") {
                acc += delta
                setAiAnswer(acc)
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setAiError("Couldn't generate an answer right now. Search results are still available below.")
      }
    } finally {
      setAiLoading(false)
    }
  }

  // ---------------- TTS ----------------

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
  }

  const speakAnswer = async () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }
    if (!aiAnswer.trim()) return
    try {
      setTtsLoading(true)
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiAnswer,
          voice: "shimmer",
          doctrineId: `chat_${Date.now()}`,
        }),
      })
      if (!res.ok) throw new Error("TTS failed")
      const data = await res.json()
      if (!data.audioUrl) throw new Error("No audio URL")
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = data.audioUrl
      audioRef.current.onended = () => setIsSpeaking(false)
      audioRef.current.onerror = () => setIsSpeaking(false)
      await audioRef.current.play()
      setIsSpeaking(true)
    } catch {
      setIsSpeaking(false)
    } finally {
      setTtsLoading(false)
    }
  }

  // ---------------- Results computation ----------------

  const results = useMemo(() => {
    if (!committedQuery.trim()) return []
    const terms = naturalTerms(committedQuery)
    let matched: IndexedDoc[]
    if (isBooleanQuery(committedQuery)) {
      const node = parseQuery(committedQuery)
      matched = node ? index.filter((d) => evalNode(node, d)) : []
    } else {
      // Natural language: every doc is a candidate; ranking will filter zeros.
      matched = index
    }
    const filtered = filter === "all" ? matched : matched.filter((d) => d.type === filter)
    return filtered
      .map((d) => ({ doc: d, score: scoreDoc(d, terms), snippet: buildSnippet(d, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
  }, [committedQuery, filter, index])

  // ---------------- Render helpers ----------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    inputRef.current?.blur()
    runSearch(query)
  }

  const handleClear = () => {
    setQuery("")
    setCommittedQuery("")
    setAiAnswer("")
    setAiError(null)
    aiAbortRef.current?.abort()
    stopSpeaking()
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.focus()
    }
  }

  // Click handler for suggested / recent searches — clears any prior state
  // (input text, AI answer, listening, textarea height) and runs the new query.
  const pickQuery = (q: string) => {
    aiAbortRef.current?.abort()
    stopSpeaking()
    if (isListening) stopListening()
    setQuery(q)
    if (inputRef.current) inputRef.current.style.height = "auto"
    runSearch(q)
  }

  const renderHighlighted = (text: string, terms: string[]) => {
    if (!terms.length) return text
    const escaped = terms
      .filter((t) => t.length > 1)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    if (!escaped.length) return text
    const re = new RegExp(`(${escaped.join("|")})`, "ig")
    const parts = text.split(re)
    return parts.map((p, i) =>
      re.test(p) ? (
        <mark key={i} className="bg-warning/30 text-foreground rounded px-0.5">
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      )
    )
  }

  const queryTerms = useMemo(() => naturalTerms(committedQuery), [committedQuery])

  // ---------------- Render ----------------

  const isQuestion = /\?$|^(who|what|when|where|why|how|can|should|do|does|is|are)\b/i.test(committedQuery)
  const showAiCard = committedQuery.trim().length > 0 && (aiLoading || aiAnswer || aiError)
  const aiCollapsedHeight = aiExpanded ? "max-h-[2000px]" : "max-h-44"

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Sticky search header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <form onSubmit={handleSubmit} className="px-5 pt-14 pb-4">
          <label className="sr-only" htmlFor="doctrine-search">
            Search doctrine
          </label>
          <div
            className={cn(
              "relative bg-muted transition-all duration-200 ease-out",
              "border border-transparent",
              // Gemini-like: collapsed pill when empty, expanded card when active
              query.length > 0 || isFocused
                ? "rounded-3xl bg-card border-interactive/40 shadow-md px-2 pt-2 pb-2"
                : "rounded-full px-1.5 py-1"
            )}
          >
            <div className="flex items-start gap-2 px-2 pt-1.5">
              <Search
                className={cn(
                  "w-5 h-5 text-muted-foreground shrink-0 transition-transform mt-1.5",
                  query.length > 0 && "translate-y-0.5"
                )}
                aria-hidden
              />
              <textarea
                ref={inputRef}
                id="doctrine-search"
                rows={1}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  // auto-grow
                  const el = e.currentTarget
                  el.style.height = "auto"
                  el.style.height = `${Math.min(el.scrollHeight, 240)}px`
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    inputRef.current?.blur()
                    runSearch(query)
                  }
                }}
                placeholder={isListening ? "Listening…" : "Search doctrine or ask a question…"}
                className={cn(
                  "flex-1 bg-transparent resize-none focus:outline-none",
                  "text-foreground placeholder:text-muted-foreground",
                  query.length > 0 || isFocused
                    ? "min-h-[5rem] text-[17px] leading-[1.5] py-1"
                    : "min-h-[2rem] text-base leading-6 py-0.5"
                )}
              />
              {/* Right-side action: submit or mic */}
              {query.trim() ? (
                <button
                  type="submit"
                  aria-label="Search"
                  className="shrink-0 w-9 h-9 rounded-full bg-interactive flex items-center justify-center text-interactive-foreground active:scale-95 transition"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              ) : speechSupported ? (
                <button
                  type="button"
                  onClick={() => (isListening ? stopListening() : startListening())}
                  aria-label={isListening ? "Stop voice input" : "Voice input"}
                  aria-pressed={isListening}
                  className={cn(
                    "shrink-0 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition",
                    isListening
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-card hover:text-foreground"
                  )}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              ) : null}
            </div>
            {/* Live interim transcript while listening */}
            {isListening && interimTranscript && (
              <div className="px-5 pb-2 text-sm text-muted-foreground italic truncate">
                {interimTranscript}
              </div>
            )}
          </div>

          {/* Clear bar — large, always-visible reset pill outside the input.
              Avoids accidental taps on a tiny inline X when finger lands near
              the right edge of the input bubble. */}
          {(query.length > 0 || committedQuery) && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search and start over"
                className={cn(
                  "inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-full",
                  "bg-muted text-foreground text-sm font-medium",
                  "active:scale-95 hover:bg-muted/70 transition"
                )}
              >
                <X className="w-4 h-4" aria-hidden />
                Clear search
              </button>
            </div>
          )}

          {/* Filter chips */}
          <div className="mt-4 -mx-5 px-5 flex gap-2 overflow-x-auto touch-scroll" role="tablist" aria-label="Result type">
            {FILTERS.map((f) => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "shrink-0 h-9 px-3.5 rounded-full text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </form>
      </header>

      {/* Body */}
      <div className="flex-1 px-5 py-5">
        {/* Empty state */}
        {!committedQuery && (
          <div className="space-y-6">
            {recentSearches.length > 0 && (
              <section aria-labelledby="recent-heading">
                <div className="flex items-center justify-between mb-2">
                  <h2 id="recent-heading" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Recent
                  </h2>
                  <button
                    onClick={clearRecent}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground active:scale-95 transition"
                  >
                    Clear
                  </button>
                </div>
                <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
                  {recentSearches.map((q) => (
                    <button
                      key={q}
                      onClick={() => pickQuery(q)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 active:bg-muted"
                    >
                      <Search className="w-4 h-4 text-muted-foreground" aria-hidden />
                      <span className="flex-1 text-sm text-foreground">{q}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden />
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section aria-labelledby="suggested-heading">
              <h2 id="suggested-heading" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Try searching
              </h2>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => pickQuery(q)}
                    className="px-3 py-2 rounded-full bg-card border border-border text-sm text-foreground hover:border-interactive/40 hover:bg-interactive-soft/30 active:scale-[0.98] transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </section>
            <p className="text-xs text-muted-foreground pt-2">
              Tip: combine terms with <code className="font-mono text-foreground">AND</code>,{" "}
              <code className="font-mono text-foreground">OR</code>, <code className="font-mono text-foreground">NOT</code>, or
              wrap an exact phrase in quotes.
            </p>
          </div>
        )}

        {/* AI answer card */}
        {showAiCard && (
          <section aria-labelledby="ai-answer-heading" className="mb-6">
            <div className="rounded-2xl bg-interactive-soft/40 border border-interactive/15 overflow-hidden">
              <header className="flex items-center gap-2.5 px-5 pt-4 pb-3">
                <div className="w-8 h-8 rounded-xl bg-interactive flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-interactive-foreground" aria-hidden />
                </div>
                <h2 id="ai-answer-heading" className="text-sm font-semibold text-foreground">
                  AI Answer
                </h2>
                {aiLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin ml-1" aria-hidden />}
                <div className="flex-1" />
                {aiAnswer && !aiLoading && (
                  <button
                    onClick={speakAnswer}
                    aria-label={isSpeaking ? "Stop reading" : "Read answer aloud"}
                    aria-pressed={isSpeaking}
                    className={cn(
                      "h-9 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-medium",
                      isSpeaking
                        ? "bg-interactive text-interactive-foreground"
                        : "bg-card border border-border text-foreground hover:border-interactive/40"
                    )}
                  >
                    {ttsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    {isSpeaking ? "Stop" : "Listen"}
                  </button>
                )}
              </header>
              <div
                className={cn(
                  "px-5 pb-4 text-[15px] leading-[1.65] text-foreground transition-[max-height] duration-300 overflow-hidden relative",
                  aiCollapsedHeight
                )}
              >
                {aiError && <p className="text-muted-foreground italic">{aiError}</p>}
                {!aiError && aiAnswer && (
                  <div
                    className={cn(
                      "prose-arc",
                      aiLoading && "ai-streaming"
                    )}
                  >
                    <Markdown text={aiAnswer} />
                  </div>
                )}
                {!aiError && !aiAnswer && aiLoading && (
                  <div className="ai-shimmer space-y-2 py-1">
                    <div className="h-3.5 rounded bg-foreground/10 w-[88%]" />
                    <div className="h-3.5 rounded bg-foreground/10 w-[72%]" />
                    <div className="h-3.5 rounded bg-foreground/10 w-[80%]" />
                  </div>
                )}
                {!aiExpanded && aiAnswer && !aiLoading && aiAnswer.length > 240 && (
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-interactive-soft/40 to-transparent pointer-events-none" />
                )}
              </div>
              {aiAnswer && !aiLoading && aiAnswer.length > 240 && (
                <button
                  onClick={() => setAiExpanded((x) => !x)}
                  className="w-full px-5 py-3 text-xs font-semibold text-interactive-deep hover:bg-interactive-soft/50 border-t border-interactive/10"
                  aria-expanded={aiExpanded}
                >
                  {aiExpanded ? "Show less" : "Read full answer"}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Results list */}
        {committedQuery && (
          <section aria-labelledby="results-heading">
            <div className="flex items-baseline justify-between mb-2">
              <h2 id="results-heading" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {results.length === 0
                  ? "No documents"
                  : `${results.length} ${results.length === 1 ? "document" : "documents"}`}
              </h2>
              {!isQuestion && results.length > 0 && (
                <span className="text-xs text-muted-foreground">Sorted by relevance</span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-foreground font-medium mb-1">No matches</p>
                <p className="text-sm text-muted-foreground">
                  Try simpler terms, remove a filter, or use <code className="font-mono">OR</code> to broaden the search.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {results.map(({ doc, snippet }) => {
                  const Icon = TYPE_ICON[doc.type]
                  return (
                    <li key={doc.id}>
                      <button
                        onClick={() => onNavigate?.("doctrine-detail", doc.id)}
                        className={cn(
                          "w-full text-left rounded-2xl bg-card border border-border p-4",
                          "active:scale-[0.99] active:bg-muted/40 transition",
                          "focus-visible:border-interactive"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Icon className="w-4.5 h-4.5 text-foreground" aria-hidden />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {TYPE_LABEL[doc.type]}
                              </span>
                              <span className="text-muted-foreground/50">·</span>
                              <span className="text-[10px] text-muted-foreground truncate">{doc.category}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">
                              {renderHighlighted(doc.title, queryTerms)}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {renderHighlighted(snippet.text, queryTerms)}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                              <span>{doc.readTime}</span>
                              <span>·</span>
                              <span>v{doc.version}</span>
                              <span>·</span>
                              <span>Updated {doc.lastUpdated}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" aria-hidden />
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
})

AskScreen.displayName = "AskScreen"
