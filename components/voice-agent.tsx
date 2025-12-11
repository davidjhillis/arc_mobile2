"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

interface VoiceAgentProps {
  onTranscript?: (transcript: string) => void
  onCommand?: (command: string, transcript: string) => void
  className?: string
}

export function VoiceAgent({ onTranscript, onCommand, className }: VoiceAgentProps) {
  const [isActive, setIsActive] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const pressStartTimeRef = useRef<number | null>(null)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
  } = useSpeechRecognition({
    onResult: (fullTranscript, isFinal) => {
      if (isFinal && fullTranscript.trim()) {
        // Process final transcript
        if (onTranscript) {
          onTranscript(fullTranscript.trim())
        }
        
        // Check for voice commands
        if (onCommand) {
          const command = parseVoiceCommand(fullTranscript.trim())
          if (command) {
            onCommand(command, fullTranscript.trim())
          }
        }
      }
    },
    onError: (err) => {
      console.error("Speech recognition error:", err)
    },
  })

  // Handle press and hold
  const handleMouseDown = () => {
    if (!isSupported) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
      return
    }

    setIsPressed(true)
    pressStartTimeRef.current = Date.now()
    
    // Start listening after a brief delay (like Siri)
    pressTimerRef.current = setTimeout(() => {
      setIsActive(true)
      startListening()
    }, 100)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }

    if (isActive) {
      stopListening()
      setIsActive(false)
    }
  }

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseDown()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMouseUp()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current)
      }
      stopListening()
    }
  }, [stopListening])

  // Parse voice commands
  const parseVoiceCommand = (text: string): string | null => {
    const lower = text.toLowerCase()
    
    // Commands for finding articles
    if (lower.includes("find") || lower.includes("show") || lower.includes("open")) {
      return "find"
    }
    
    // Commands for reading articles
    if (lower.includes("read") || lower.includes("play")) {
      return "read"
    }
    
    // Commands for summarizing
    if (lower.includes("summarize") || lower.includes("summary")) {
      return "summarize"
    }
    
    return null
  }

  // Debug logging
  useEffect(() => {
    console.log("[VoiceAgent] Component mounted, isSupported:", isSupported)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    console.log("[VoiceAgent] Browser support check:", {
      hasSpeechRecognition: !!SpeechRecognition,
      hasWebkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
      userAgent: navigator.userAgent
    })
  }, [isSupported])

  const displayText = transcript || interimTranscript || (isListening ? "Listening..." : "")

  return (
    <>
      {/* Floating microphone button */}
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={!isSupported}
        className={cn(
          "fixed bottom-24 right-5 z-50",
          "w-16 h-16 rounded-full",
          "flex items-center justify-center",
          "shadow-lg transition-all duration-200",
          isActive || isListening
            ? "bg-primary scale-110 shadow-xl"
            : "bg-primary/90 hover:bg-primary",
          isPressed && "scale-95",
          !isSupported && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label="Voice agent"
        title={!isSupported ? "Voice recognition not supported in this browser. Please use Chrome or Edge." : "Press and hold to speak"}
      >
        {isListening ? (
          <MicOff className="w-7 h-7 text-primary-foreground animate-pulse" />
        ) : (
          <Mic className="w-7 h-7 text-primary-foreground" />
        )}
      </button>

      {/* Voice feedback overlay */}
      {(isActive || isListening || displayText) && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm",
            "flex flex-col items-center justify-center",
            "transition-opacity duration-300"
          )}
          onClick={() => {
            setIsActive(false)
            stopListening()
            reset()
          }}
        >
          <div
            className={cn(
              "bg-card rounded-3xl p-8 max-w-md w-full mx-4",
              "border border-border shadow-2xl"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setIsActive(false)
                stopListening()
                reset()
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Listening indicator */}
            {isListening && (
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-20 h-20 mb-4">
                  {/* Animated waveform circles */}
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "absolute inset-0 rounded-full border-2 border-primary",
                        "animate-ping"
                      )}
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "1.5s",
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">Listening...</p>
              </div>
            )}

            {/* Transcript display */}
            {displayText && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {isListening ? "You said" : "Transcript"}
                </p>
                <p className="text-base text-foreground leading-relaxed">
                  {displayText || "Say something..."}
                </p>
                {interimTranscript && (
                  <p className="text-sm text-muted-foreground italic">
                    {interimTranscript}
                  </p>
                )}
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error.message}</p>
              </div>
            )}

            {/* Instructions */}
            {!isListening && !displayText && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Press and hold the microphone button to speak
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
