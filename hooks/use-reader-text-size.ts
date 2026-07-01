"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "arc.readerTextPx"
const MIN = 10
const MAX = 18
const DEFAULT = 16
const EVENT = "arc:reader-text-size"

function clamp(n: number) {
  if (!Number.isFinite(n)) return DEFAULT
  return Math.min(MAX, Math.max(MIN, Math.round(n)))
}

function read(): number {
  if (typeof window === "undefined") return DEFAULT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    return clamp(Number(raw))
  } catch {
    return DEFAULT
  }
}

/**
 * Reader text size — user-adjustable body-text px (10–18).
 * Persisted to localStorage and broadcast across mounted screens so the Aa
 * control on any page keeps every other page in sync.
 *
 * Consumers apply `--reader-scale: px / 16` to a scope element and use it in
 * `font-size: calc(<base>px * var(--reader-scale, 1))`.
 */
export function useReaderTextSize() {
  const [px, setPxState] = useState<number>(DEFAULT)

  useEffect(() => {
    setPxState(read())
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPxState(read())
    }
    const onLocal = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail
      if (typeof detail === "number") setPxState(clamp(detail))
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(EVENT, onLocal as EventListener)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(EVENT, onLocal as EventListener)
    }
  }, [])

  const setPx = useCallback((next: number) => {
    const v = clamp(next)
    setPxState(v)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(v))
      window.dispatchEvent(new CustomEvent<number>(EVENT, { detail: v }))
    } catch {}
  }, [])

  return { px, setPx, min: MIN, max: MAX, scale: px / 16 }
}
