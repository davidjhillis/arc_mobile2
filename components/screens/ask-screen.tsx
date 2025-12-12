"use client"

import type React from "react"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { ArrowUp, Loader2, Sparkles, BookOpen, Mic, MicOff } from "lucide-react"
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
    try {
      // Stop any currently playing audio first
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setAudioUrl(null)
      setIsPlayingAudio(false)
      
      // Play full content - no splitting to ensure complete playback
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
          setAudioUrl(data.audioUrl)
          setIsPlayingAudio(true)
        }
      }
    } catch (error) {
      console.error("TTS error:", error)
      // Don't show error to user, just skip TTS
    }
  }

  // Handle audio playback
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [audioUrl])

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
      const is215Question = /who.*215|who.*completes.*215|who.*fills.*215|who.*does.*215|215.*who|form.*215|who.*form.*215/i.test(questionLower)
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
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: accumulatedContent,
                          fullContent: accumulatedContent,
                          sources: responseSources.length > 0 ? responseSources : undefined,
                        }
                      : msg
                  )
                )
              }
              setIsLoading(false)
              // Start TTS with full response after streaming completes
              if (accumulatedContent.trim()) {
                playAudioResponse(accumulatedContent, assistantMessageId)
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
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          content: accumulatedContent, // Always show full content as it streams
                          fullContent: accumulatedContent,
                          sources: responseSources.length > 0 ? responseSources : undefined,
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
      
      // If TTS hasn't started yet, start it now
      if (accumulatedContent.trim() && !ttsStarted) {
        playAudioResponse(accumulatedContent, assistantMessageId)
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

        {/* Input bar */}
        <div className="p-4 pb-6">
          <div className="flex items-end gap-2 p-2 rounded-2xl bg-card border border-border">
            {/* Voice input button */}
            {isVoiceSupported ? (
              <button
                onClick={() => {
                  console.log("[AskScreen] Mic button clicked, isListening:", isListening)
                  if (isListening) {
                    stopListening()
                    setIsVoiceActive(false)
                    resetVoice()
                  } else {
                    setIsVoiceActive(true)
                    console.log("[AskScreen] Starting voice recognition...")
                    startListening()
                  }
                }}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  "transition-all duration-200",
                  isListening
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50" title="Voice input not supported">
                <Mic className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 flex flex-col min-w-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Ask a question..."}
                rows={1}
                autoComplete="off"
                className={cn(
                  "w-full px-2 py-2 bg-transparent resize-none overflow-hidden",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none",
                  "min-h-[2.5rem] max-h-[200px]",
                  isListening && "opacity-50",
                )}
                disabled={isListening}
              />
              {/* Voice transcript display - never truncated, shown below textarea */}
              {(isListening || transcript || interimTranscript) && (
                <div className="w-full px-2 py-1 text-xs text-muted-foreground italic break-words whitespace-pre-wrap">
                  {transcript || interimTranscript || "Listening..."}
                </div>
              )}
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isListening}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                "transition-all duration-200",
                input.trim() && !isListening ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
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
                                    onNavigate("doctrine-detail", source.id)
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
        onPlay={() => setIsPlayingAudio(true)}
        onEnded={() => {
          setIsPlayingAudio(false)
          setAudioUrl(null)
        }}
        onError={(e) => {
          console.error("[AskScreen] Audio playback error:", e)
          setIsPlayingAudio(false)
          setAudioUrl(null)
        }}
        preload="auto"
      />

      {/* Input bar - fixed at bottom */}
      <div className="p-4 pb-6 border-t border-border bg-background">
        <div className="flex items-end gap-2 p-2 rounded-2xl bg-card border border-border">
          {/* Voice input button */}
          {isVoiceSupported ? (
            <button
              onClick={() => {
                console.log("[AskScreen] Mic button clicked (conversation), isListening:", isListening)
                if (isListening) {
                  stopListening()
                  setIsVoiceActive(false)
                  resetVoice()
                } else {
                  setIsVoiceActive(true)
                  console.log("[AskScreen] Starting voice recognition (conversation)...")
                  startListening()
                }
              }}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                "transition-all duration-200",
                isListening
                  ? "bg-primary text-primary-foreground animate-pulse"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50" title="Voice input not supported">
              <Mic className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {/* Voice transcript display */}
          {(isListening || transcript || interimTranscript) && (
            <div className="flex-1 px-2 py-2 text-xs text-muted-foreground italic">
              {transcript || interimTranscript || "Listening..."}
            </div>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask a follow-up..."}
            rows={1}
            autoComplete="off"
            className={cn(
              "flex-1 px-2 py-2 bg-transparent resize-none",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none",
              "max-h-24",
              isListening && "opacity-50",
            )}
            disabled={isListening}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isListening}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              "transition-all duration-200",
              input.trim() && !isLoading && !isListening ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
})

AskScreen.displayName = "AskScreen"
