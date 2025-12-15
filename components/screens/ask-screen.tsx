"use client"

import type React from "react"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { ArrowUp, Loader2, Sparkles, BookOpen, AudioLines, Square, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { massCareContent } from "@/lib/mass-care-content"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  fullContent?: string // Full content if truncated for TTS
  sources?: Array<{ id: string; title: string }>
  hasMore?: boolean // Whether there's more content to hear
}

const suggestions = [
  "How do I access situational awareness reports?",
  "What are the key phases of Mass Care operations?",
  "How do I set up a shelter?",
  "What is the client intake process?",
  "What are the feeding safety protocols?",
  "How do I handle reunification services?",
]

interface AskScreenProps {
  initialMessage?: string
  onNavigate?: (screen: string, doctrineId?: string) => void
}

export interface AskScreenRef {
  sendMessage: (text: string) => void
}

export const AskScreen = forwardRef<AskScreenRef, AskScreenProps>(
  ({ initialMessage, onNavigate }, ref) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState(initialMessage || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true) // TTS toggle - default enabled
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Voice recognition for Ask screen
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isVoiceSupported,
    error: voiceError,
    startListening,
    stopListening,
    reset: resetVoice,
  } = useSpeechRecognition({
    onResult: (fullTranscript, isFinal) => {
      console.log("[AskScreen] Voice result:", { fullTranscript, isFinal })
      if (isFinal && fullTranscript.trim()) {
        setInput(fullTranscript.trim())
        setIsVoiceActive(false)
        stopListening()
        // Auto-send after a brief delay
        setTimeout(() => {
          handleSend(fullTranscript.trim())
        }, 300)
      }
    },
    onError: (error) => {
      console.error("[AskScreen] Voice error:", error)
      setIsVoiceActive(false)
      // Show user-friendly error
      if (error.message.includes("not-allowed") || error.message.includes("permission")) {
        alert("Microphone permission denied. Please enable microphone access in your browser settings.")
      } else if (error.message.includes("no-speech")) {
        // This is normal if user doesn't speak, don't show error
        console.log("No speech detected")
      } else {
        console.error("Voice recognition error:", error.message)
      }
    },
  })

    // Expose sendMessage method via ref
    useImperativeHandle(ref, () => ({
      sendMessage: (text: string) => {
        handleSend(text)
      },
    }))

  // Show greeting message on first load
  useEffect(() => {
    if (messages.length === 0 && !initialMessage) {
      const greetingText = "Hello! I'm your Red Cross Doctrine assistant. How may I help you today?"
      const greetingMessage: Message = {
        id: "greeting",
        role: "assistant",
        content: greetingText,
        sources: undefined,
      }
      setMessages([greetingMessage])
      // Auto-play greeting TTS
      setTimeout(() => {
        playAudioResponse(greetingText)
      }, 500)
    }
  }, [])

  // Auto-send initial message if provided (e.g., from voice)
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && messages.length <= 1) {
      handleSend(initialMessage)
    }
  }, [initialMessage])

  // Auto-resize textarea when input or transcript changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      const scrollHeight = inputRef.current.scrollHeight
      inputRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [input, transcript, interimTranscript])

  // Check if input is a greeting (not a question) - only for first user message
  const isGreeting = (text: string, isFirstUserMessage: boolean): boolean => {
    // Only treat as greeting if it's the first user message
    if (!isFirstUserMessage) return false
    
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/i,
      /^(thanks|thank you|thx)$/i,
      /^(bye|goodbye|see you)$/i,
      /^(how are you|how's it going|what's up)$/i,
    ]
    // Only match if it's JUST a greeting, not a greeting + question
    const trimmed = text.trim()
    return greetingPatterns.some(pattern => pattern.test(trimmed)) && trimmed.length < 30
  }

  // Extract suggested actions from AI response
  const extractActions = (content: string): string[] => {
    const actions: string[] = []
    // Look for bullet points or numbered lists that could be actions
    const lines = content.split('\n')
    for (const line of lines) {
      // Match bullet points (•, -, *) followed by questions or action phrases
      const bulletMatch = line.match(/^[\s]*[•\-\*]\s*(.+)$/)
      if (bulletMatch) {
        const action = bulletMatch[1].trim()
        // Only include if it looks like a question or action
        if (action.length > 10 && action.length < 100) {
          actions.push(action)
        }
      }
    }
    return actions.slice(0, 4) // Limit to 4 actions
  }

  // Handle action button click
  const handleActionClick = (action: string, useVoice: boolean = false) => {
    if (useVoice && isVoiceSupported) {
      // Set input and trigger voice
      setInput(action)
      setIsVoiceActive(true)
      startListening()
    } else {
      // Send as text message
      handleSend(action)
    }
  }

  // Split text into ~75 word chunks at sentence boundaries (approximately 5 seconds of speech)
  const splitTextForTTS = (text: string): { short: string; remaining: string } => {
    // Split by sentences first
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const words = text.split(/\s+/)
    const targetWordCount = 75 // ~5 seconds
    
    // If text is short enough, return it all
    if (words.length <= targetWordCount) {
      return { short: text, remaining: "" }
    }
    
    // Build short version sentence by sentence until we hit ~75 words
    let shortSentences: string[] = []
    let wordCount = 0
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.split(/\s+/).length
      if (wordCount + sentenceWords <= targetWordCount) {
        shortSentences.push(sentence)
        wordCount += sentenceWords
      } else {
        break
      }
    }
    
    const shortText = shortSentences.join(" ").trim()
    const remaining = sentences.slice(shortSentences.length).join(" ").trim()
    
    return { short: shortText, remaining }
  }

  // Play TTS for AI response - full content, no splitting
  const playAudioResponse = async (text: string, messageId?: string) => {
    // Don't play if TTS is disabled
    if (!ttsEnabled) {
      console.log("[AskScreen] TTS disabled, skipping playback")
      return
    }
    
    if (!text || !text.trim()) {
      console.warn("[AskScreen] Empty text, skipping TTS")
      return
    }
    
    try {
      console.log("[AskScreen] Starting TTS for message:", messageId, "text length:", text.length)
      
      // Stop any currently playing audio first
      if (audioRef.current) {
        console.log("[AskScreen] Stopping previous audio")
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      
      // Clear state - this will trigger useEffect cleanup
      setIsPlayingAudio(false)
      setAudioUrl(null)
      
      // Small delay to ensure audio element is reset and state cleared
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Play full content - no splitting to ensure complete playback
      console.log("[AskScreen] Fetching TTS from API")
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice: "shimmer",
          doctrineId: `chat_${Date.now()}_${messageId || "temp"}`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.audioUrl) {
          console.log("[AskScreen] TTS API success, setting audio URL:", data.audioUrl)
          // Set audio URL - this will trigger the useEffect to play it
          setAudioUrl(data.audioUrl)
        } else {
          console.warn("[AskScreen] TTS API returned no audioUrl")
        }
      } else {
        const errorText = await response.text()
        console.error("[AskScreen] TTS API error:", response.status, errorText)
      }
    } catch (error) {
      console.error("[AskScreen] TTS error:", error)
      // Don't show error to user, just skip TTS
    }
  }

  // Handle audio playback - simplified and more reliable
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!audioUrl || !ttsEnabled) {
      if (!ttsEnabled) {
        // Stop audio if TTS is disabled
        audio.pause()
        audio.currentTime = 0
        setIsPlayingAudio(false)
      }
      return
    }

    console.log("[AskScreen] useEffect triggered for audioUrl:", audioUrl)
    
    // Simple approach: set src and let browser handle loading/playing
    const handleCanPlay = () => {
      console.log("[AskScreen] Audio can play, attempting playback")
      audio.play().then(() => {
        console.log("[AskScreen] Audio playback started successfully")
        setIsPlayingAudio(true)
      }).catch((error) => {
        console.error("[AskScreen] Play failed:", error)
        setIsPlayingAudio(false)
      })
    }

    const handleError = () => {
      const error = audio.error
      console.error("[AskScreen] Audio error:", {
        code: error?.code,
        message: error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState
      })
      setIsPlayingAudio(false)
    }

    // Remove old listeners
    audio.removeEventListener('canplay', handleCanPlay)
    audio.removeEventListener('error', handleError)
    audio.removeEventListener('ended', () => {
      setIsPlayingAudio(false)
      setAudioUrl(null)
    })
    
    // Add new listeners
    audio.addEventListener('canplay', handleCanPlay, { once: true })
    audio.addEventListener('error', handleError, { once: true })
    audio.addEventListener('ended', () => {
      console.log("[AskScreen] Audio ended")
      setIsPlayingAudio(false)
      setAudioUrl(null)
    }, { once: true })
    
    // Reset and load
    audio.pause()
    audio.currentTime = 0
    audio.load()
    
  }, [audioUrl, ttsEnabled])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Find relevant articles based on question - returns both context string and metadata
  const findRelevantArticles = (question: string): { context: string; sources: Array<{ id: string; title: string }> } => {
    const questionLower = question.toLowerCase()
    const articleScores: Array<{ article: typeof massCareContent[string]; score: number }> = []
    
    // Search through all articles for relevant content
    Object.entries(massCareContent).forEach(([id, article]) => {
      const titleLower = article.title.toLowerCase()
      const summaryLower = article.summary.toLowerCase()
      const categoryLower = article.category.toLowerCase()
      const contentLower = article.content.toLowerCase()
      
      let score = 0
      
      // Check if question keywords match article content
      const keywords = questionLower.split(/\s+/).filter(word => word.length > 3)
      
      keywords.forEach((keyword) => {
        if (titleLower.includes(keyword)) score += 5 // Title matches are most important
        if (summaryLower.includes(keyword)) score += 3 // Summary matches are important
        if (categoryLower.includes(keyword)) score += 2 // Category matches
        if (contentLower.includes(keyword)) score += 1 // Content matches
      })
      
      // Boost score if question phrase appears in title or summary
      if (titleLower.includes(questionLower.substring(0, 30))) score += 10
      if (summaryLower.includes(questionLower.substring(0, 30))) score += 5
      
      if (score > 0) {
        articleScores.push({ article: { ...article, id }, score })
      }
    })
    
    // Sort by score and take top 3 most relevant
    articleScores.sort((a, b) => b.score - a.score)
    const topArticles = articleScores.slice(0, 3)
    
    // Format articles for context
    const context = topArticles.map(({ article }) => {
      return `---\nArticle: ${article.title}\nCategory: ${article.category}\nSummary: ${article.summary}\n\nContent:\n${article.content.substring(0, 4000)}\n---`
    }).join("\n\n")
    
    // Extract source metadata
    const sources = topArticles.map(({ article }) => ({
      id: article.id || "",
      title: article.title
    }))
    
    return { context, sources }
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    }

    // Check if this is the first user message
    const isFirstUserMessage = messages.filter(m => m.role === "user").length === 0
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Check if it's a greeting - only for first user message, respond conversationally without searching doctrine
    if (isGreeting(messageText, isFirstUserMessage)) {
      const greetingResponse = "Hello! I'm here to help you with Red Cross doctrine and procedures. How may I help you today?"
      
      const greetingReply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: greetingResponse,
        sources: undefined,
      }
      
      setMessages((prev) => [...prev, greetingReply])
      setIsLoading(false)
      
      // Play TTS for greeting
      await playAudioResponse(greetingResponse, greetingReply.id)
      return
    }

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    let responseSources: Array<{ id: string; title: string }> = []
    
    // Create placeholder message immediately so it shows in chat
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      sources: undefined,
    }
    setMessages((prev) => [...prev, assistantMessage])
    
    try {
      // Find relevant articles for context (only for actual questions)
      let { context: relevantContext, sources } = findRelevantArticles(messageText)
      responseSources = sources
      
      // If question is about "who completes a 215" or similar, ensure daily-tactics-planning is included
      const questionLower = messageText.toLowerCase()
      // Detect questions about Form 215 or who completes/fills/does 215
      const is215Question = /(who|what|how).*(completes?|fills?|does?|responsible|do).*215|215.*(who|what|completes?|fills?|does?|responsible)|form\s*215|^215/i.test(questionLower)
      if (is215Question) {
        // For 215 questions, prioritize daily-tactics-planning - make it the primary source
        const dailyTacticsArticle = massCareContent["daily-tactics-planning"]
        if (dailyTacticsArticle) {
          const articleContext = `---\nArticle: ${dailyTacticsArticle.title}\nCategory: ${dailyTacticsArticle.category}\nSummary: ${dailyTacticsArticle.summary}\n\nContent:\n${dailyTacticsArticle.content.substring(0, 4000)}\n---`
          // Put daily-tactics-planning first in context and sources
          relevantContext = relevantContext ? `${articleContext}\n\n${relevantContext}` : articleContext
          // Remove any existing daily-tactics-planning and add it first
          responseSources = responseSources.filter(s => s.id !== "daily-tactics-planning")
          responseSources.unshift({
            id: "daily-tactics-planning",
            title: "Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders Task Sheet"
          })
        }
      }
      
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: messageText },
          ],
          context: relevantContext || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let accumulatedContent = ""
      let ttsStarted = false // Track if TTS has been initiated

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              // Final update before ending
              if (accumulatedContent.trim()) {
                // Ensure sources are set correctly (daily-tactics-planning should be first for 215 questions)
                const finalSources = responseSources.length > 0 ? [...responseSources] : undefined
                console.log("[AskScreen] Final sources for message:", finalSources)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: accumulatedContent,
                          fullContent: accumulatedContent,
                          sources: finalSources,
                        }
                      : msg
                  )
                )
              }
              setIsLoading(false)
              // Start TTS with full response after streaming completes
              if (accumulatedContent.trim()) {
                console.log("[AskScreen] Streaming complete, starting TTS for message:", assistantMessageId)
                // Small delay to ensure state is updated
                setTimeout(() => {
                  playAudioResponse(accumulatedContent, assistantMessageId)
                }, 100)
              }
              return
            }

            try {
              const json = JSON.parse(data)
              const content = json.content
              if (content && typeof content === 'string') {
                // Fix: Trim leading whitespace/punctuation if this is the first chunk and it starts incorrectly
                let contentToAdd = content
                if (accumulatedContent === "" && /^[\s,\.;:]/.test(content)) {
                  // If first chunk starts with punctuation, it might be missing the first word
                  // This is likely an AI generation issue, but we'll trim leading punctuation
                  contentToAdd = content.replace(/^[\s,\.;:]+/, '')
                  console.warn("[Stream] First chunk started with punctuation, trimmed:", content.substring(0, 20))
                }
                accumulatedContent += contentToAdd
                // Update the assistant message with accumulated content (ensure it's always visible)
                // Use a copy of responseSources to ensure it doesn't get mutated
                const currentSources = responseSources.length > 0 ? [...responseSources] : undefined
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          content: accumulatedContent, // Always show full content as it streams
                          fullContent: accumulatedContent,
                          sources: currentSources,
                        }
                      : msg
                  )
                )

                // Start TTS immediately when we have ~50 words or first complete sentence
                // But wait for streaming to complete to ensure full response is played
                if (!ttsStarted && accumulatedContent.trim()) {
                  const wordCount = accumulatedContent.split(/\s+/).length
                  const hasCompleteSentence = /[.!?]\s/.test(accumulatedContent)
                  
                  // Start TTS if we have at least 50 words OR a complete sentence with 20+ words
                  // But mark as started so we don't trigger multiple times during streaming
                  if (wordCount >= 50 || (hasCompleteSentence && wordCount >= 20)) {
                    ttsStarted = true
                    // Don't start TTS yet - wait for full response to ensure complete playback
                  }
                }
              }
            } catch (e) {
              // Ignore parse errors for comments or invalid JSON
              console.warn("Failed to parse SSE data:", e, data)
            }
          }
        }
      }

      setIsLoading(false)
      
      // Update message with full content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { 
                ...msg, 
                content: accumulatedContent, // Show full content in chat
                fullContent: accumulatedContent,
                sources: responseSources.length > 0 ? responseSources : undefined,
              }
            : msg
        )
      )
      
      // Start TTS with full response after streaming completes
      if (accumulatedContent.trim()) {
        console.log("[AskScreen] Streaming complete (fallback), starting TTS for message:", assistantMessageId)
        // Small delay to ensure state is updated
        setTimeout(() => {
          playAudioResponse(accumulatedContent, assistantMessageId)
        }, 100)
      }
    } catch (error) {
      console.error("Ask AI error:", error)
      setIsLoading(false)
      // Update the assistant message with error
      const errorMessage = "I'm sorry, I'm having trouble processing your question right now. Please try again later."
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: errorMessage,
              }
            : msg
        )
      )
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Empty state - Perplexity style centered
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-[calc(100dvh-5rem)]">
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-medium text-foreground mb-2">Ask anything</h1>
          <p className="text-sm text-muted-foreground text-center mb-10 max-w-[240px]">
            Get instant answers from Red Cross doctrine and procedures
          </p>

          {/* Suggestion chips */}
          <div className="w-full max-w-sm space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left",
                  "bg-card border border-border",
                  "active:scale-[0.98] transition-all duration-200",
                )}
              >
                <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input bar - Google AI style */}
        <div className="p-4 pb-6">
          {/* Main input container */}
          <div 
            className={cn(
              "relative rounded-3xl border bg-card transition-all duration-300 ease-out",
              "shadow-sm hover:shadow-md",
              (input.trim() || isListening) 
                ? "border-primary/30 shadow-primary/5" 
                : "border-border",
            )}
          >
            {/* Textarea container */}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  // Auto-expand textarea
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                }}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  // Expand to minimum focused height
                  if (e.target.scrollHeight < 56) {
                    e.target.style.height = '56px'
                  }
                }}
                onBlur={(e) => {
                  // Collapse if empty
                  if (!input.trim()) {
                    e.target.style.height = 'auto'
                  }
                }}
                placeholder={isListening ? "Listening..." : "Ask anything about Red Cross doctrine..."}
                rows={1}
                autoComplete="off"
                className={cn(
                  "flex-1 px-5 py-4 bg-transparent resize-none",
                  "text-base text-foreground placeholder:text-muted-foreground/70",
                  "focus:outline-none focus:placeholder:text-muted-foreground/50",
                  "min-h-[56px] max-h-[200px] leading-relaxed",
                  "transition-all duration-200",
                  isListening && "text-primary",
                )}
                disabled={isListening}
              />
              
              {/* Smart action button - voice/send toggle */}
              <div className="flex items-end pr-3 pb-3 self-end">
                {/* Single smart button: Voice when empty, Send when has text, Stop when listening */}
                <button
                  onClick={() => {
                    if (isListening) {
                      // Stop listening
                      stopListening()
                      setIsVoiceActive(false)
                    } else if (input.trim()) {
                      // Send message
                      handleSend()
                    } else if (isVoiceSupported) {
                      // Start voice input
                      setIsVoiceActive(true)
                      startListening()
                    }
                  }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "transition-all duration-300 ease-out",
                    isListening
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-110"
                      : input.trim()
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted/80 text-foreground hover:bg-muted",
                  )}
                  title={isListening ? "Stop" : input.trim() ? "Send" : "Voice input"}
                >
                  {isListening ? (
                    <Square className="w-5 h-5 fill-current" />
                  ) : input.trim() ? (
                    <ArrowUp className="w-5 h-5" />
                  ) : (
                    <AudioLines className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Voice transcript - floating below input */}
            {(isListening || transcript || interimTranscript) && (
              <div className="px-5 py-3 border-t border-border/50 text-sm text-primary animate-pulse">
                {transcript || interimTranscript || "Listening..."}
              </div>
            )}
            
            {/* TTS toggle - subtle pill at bottom */}
            <div className="flex justify-center py-2 border-t border-border/30">
              <button
                onClick={() => {
                  const newTtsEnabled = !ttsEnabled
                  setTtsEnabled(newTtsEnabled)
                  if (!newTtsEnabled && audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                    setAudioUrl(null)
                    setIsPlayingAudio(false)
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5",
                  "transition-all duration-200",
                  ttsEnabled
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{ttsEnabled ? "Voice responses on" : "Voice responses off"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Conversation view
  return (
    <div className="flex flex-col h-full min-h-[calc(100dvh-5rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 touch-scroll">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-primary text-primary-foreground">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Show full content */}
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {message.fullContent || message.content}
                      </p>
                      
                      {/* Source links */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-col gap-2 mt-4">
                          <span className="text-xs text-muted-foreground font-medium">Source content:</span>
                          <div className="flex flex-col gap-2">
                            {message.sources.map((source) => (
                              <button
                                key={source.id}
                                onClick={() => {
                                  console.log("[AskScreen] Source clicked:", source.id, source.title)
                                  if (onNavigate && source.id) {
                                    console.log("[AskScreen] Navigating to doctrine-detail with id:", source.id)
                                    // Fix: onNavigate signature is (screen, disasterType?, doctrineId?, group?)
                                    onNavigate("doctrine-detail", undefined, source.id)
                                  } else {
                                    console.warn("[AskScreen] Cannot navigate - onNavigate:", !!onNavigate, "source.id:", source.id)
                                  }
                                }}
                                className={cn(
                                  "px-3 py-2 rounded-lg text-left text-sm",
                                  "bg-primary/10 text-primary border border-primary/20",
                                  "hover:bg-primary/20 active:scale-[0.98] transition-all",
                                  "flex items-center gap-2 cursor-pointer"
                                )}
                                title={source.title}
                              >
                                <BookOpen className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{source.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              </div>
              <div className="flex items-center gap-2 py-2">
                <span className="text-sm text-muted-foreground">Searching doctrine...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Hidden audio element for TTS playback - always render to ensure it's available */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onPlay={() => {
          console.log("[AskScreen] Audio play event")
          setIsPlayingAudio(true)
        }}
        onEnded={() => {
          console.log("[AskScreen] Audio ended event")
          setIsPlayingAudio(false)
          // Don't clear audioUrl immediately - keep it for potential replay
          setTimeout(() => {
            setAudioUrl(null)
          }, 100)
        }}
        onError={(e) => {
          const audio = e.currentTarget as HTMLAudioElement
          const error = audio.error
          console.error("[AskScreen] Audio playback error:", {
            error,
            code: error?.code,
            message: error?.message,
            networkState: audio.networkState,
            readyState: audio.readyState,
            src: audio.src
          })
          setIsPlayingAudio(false)
          // Clear audioUrl on error to allow retry with new URL
          setAudioUrl(null)
        }}
        onLoadStart={() => console.log("[AskScreen] Audio load start")}
        onLoadedData={() => console.log("[AskScreen] Audio loaded data")}
        onCanPlay={() => console.log("[AskScreen] Audio can play")}
        preload="auto"
      />

      {/* Input bar - Google AI style */}
      <div className="p-4 pb-safe bg-background">
        {/* Main input container */}
        <div 
          className={cn(
            "relative rounded-3xl border bg-card transition-all duration-300 ease-out",
            "shadow-sm",
            (input.trim() || isListening) 
              ? "border-primary/30 shadow-md shadow-primary/5" 
              : "border-border hover:shadow-md",
          )}
        >
          {/* Textarea container */}
          <div className="flex items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                // Auto-expand textarea
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
              }}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                if (e.target.scrollHeight < 48) {
                  e.target.style.height = '48px'
                }
              }}
              onBlur={(e) => {
                if (!input.trim()) {
                  e.target.style.height = 'auto'
                }
              }}
              placeholder={isListening ? "Listening..." : "Ask a follow-up..."}
              rows={1}
              autoComplete="off"
              className={cn(
                "flex-1 px-5 py-3.5 bg-transparent resize-none",
                "text-base text-foreground placeholder:text-muted-foreground/70",
                "focus:outline-none",
                "min-h-[48px] max-h-[160px] leading-relaxed",
                "transition-all duration-200",
                isListening && "text-primary",
              )}
              disabled={isListening}
            />
            
            {/* Action buttons - bottom aligned */}
            <div className="flex items-end gap-2 pr-3 pb-3 self-end">
              {/* TTS toggle - subtle */}
              <button
                onClick={() => {
                  const newTtsEnabled = !ttsEnabled
                  setTtsEnabled(newTtsEnabled)
                  if (!newTtsEnabled && audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                    setAudioUrl(null)
                    setIsPlayingAudio(false)
                  }
                }}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center",
                  "transition-all duration-200",
                  ttsEnabled
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
                title={ttsEnabled ? "Voice responses on" : "Voice responses off"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              {/* Smart action button: Voice when empty, Send when has text, Stop when listening */}
              <button
                onClick={() => {
                  if (isListening) {
                    // Stop listening
                    stopListening()
                    setIsVoiceActive(false)
                  } else if (input.trim()) {
                    // Send message
                    handleSend()
                  } else if (isVoiceSupported) {
                    // Start voice input
                    setIsVoiceActive(true)
                    startListening()
                  }
                }}
                disabled={isLoading}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center",
                  "transition-all duration-300 ease-out",
                  isLoading
                    ? "bg-muted text-muted-foreground"
                    : isListening
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-110"
                      : input.trim()
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted/80 text-foreground hover:bg-muted",
                )}
                title={isListening ? "Stop" : input.trim() ? "Send" : "Voice input"}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isListening ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : input.trim() ? (
                  <ArrowUp className="w-5 h-5" />
                ) : (
                  <AudioLines className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Voice transcript - floating below input */}
          {(isListening || transcript || interimTranscript) && (
            <div className="px-5 py-2.5 border-t border-border/50 text-sm text-primary">
              <span className="animate-pulse">{transcript || interimTranscript || "Listening..."}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

AskScreen.displayName = "AskScreen"
