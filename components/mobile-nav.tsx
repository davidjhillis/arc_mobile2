"use client"

import { useState, useRef } from "react"
import { Home, Download, Sparkles, User, Compass, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Screen } from "./app-shell"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

interface MobileNavProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
  onVoiceTranscript?: (transcript: string) => void
}

const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "feed", label: "Feed", icon: Compass },
  { id: "ask", label: "Ask", icon: Sparkles },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "profile", label: "Profile", icon: User },
]

export function MobileNav({ activeScreen, onNavigate, onVoiceTranscript }: MobileNavProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    reset,
  } = useSpeechRecognition({
    onResult: (fullTranscript, isFinal) => {
      if (isFinal && fullTranscript.trim() && onVoiceTranscript) {
        onVoiceTranscript(fullTranscript.trim())
        reset()
      }
    },
  })

  const handleAskClick = () => {
    if (!isPressed) {
      // Normal click - navigate to ask screen
      onNavigate("ask")
    }
  }

  const handleAskMouseDown = () => {
    if (!isSupported) return
    
    setIsPressed(true)
    pressTimerRef.current = setTimeout(() => {
      setIsVoiceActive(true)
      startListening()
    }, 300) // Slightly longer delay for press-and-hold
  }

  const handleAskMouseUp = () => {
    setIsPressed(false)
    
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }

    if (isVoiceActive) {
      stopListening()
      setIsVoiceActive(false)
      // Navigate to ask screen after voice input
      if (transcript.trim() || interimTranscript.trim()) {
        onNavigate("ask")
      }
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-around py-2 pb-7">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            activeScreen === item.id ||
            (activeScreen === "doctrine" && item.id === "home") ||
            (activeScreen === "group-documents" && item.id === "home") ||
            (activeScreen === "doctrine-detail" && item.id === "home")
          const isAsk = item.id === "ask"

          return (
            <button
              key={item.id}
              onClick={isAsk ? handleAskClick : () => onNavigate(item.id)}
              onMouseDown={isAsk ? handleAskMouseDown : undefined}
              onMouseUp={isAsk ? handleAskMouseUp : undefined}
              onMouseLeave={isAsk ? handleAskMouseUp : undefined}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl",
                "active:scale-90 transition-all duration-200",
                isAsk && (isVoiceActive || isListening) && "scale-110",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center relative",
                  isAsk && isActive && "w-8 h-8 rounded-full bg-primary",
                  isAsk && !isActive && "w-8 h-8 rounded-full bg-muted",
                  isAsk && (isVoiceActive || isListening) && "bg-primary scale-110",
                )}
              >
                {isAsk && (isVoiceActive || isListening) ? (
                  <Mic className={cn(
                    "w-4 h-4 animate-pulse",
                    "text-primary-foreground"
                  )} />
                ) : (
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-primary" : "text-muted-foreground",
                      isAsk && isActive && "text-primary-foreground w-4 h-4",
                      isAsk && !isActive && "w-4 h-4",
                    )}
                  />
                )}
                {/* Voice indicator rings */}
                {isAsk && isListening && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute inset-0 rounded-full border-2 border-primary-foreground/30",
                          "animate-ping"
                        )}
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: "1s",
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
              {!isAsk && (
                <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              )}
              {isAsk && (isVoiceActive || isListening) && (
                <span className="text-[10px] font-medium text-primary animate-pulse">
                  Listening...
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
