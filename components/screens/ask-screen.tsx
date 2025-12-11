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
  sources?: Array<{ id: string; title: string }>
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
    startListening,
    stopListening,
    reset: resetVoice,
  } = useSpeechRecognition({
    onResult: (fullTranscript, isFinal) => {
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
      const greetingMessage: Message = {
        id: "greeting",
        role: "assistant",
        content: "Hello! I'm your Red Cross Doctrine assistant. I can help you:\n\n• Find information about Mass Care operations\n• Answer questions about procedures and protocols\n• Locate specific doctrine articles\n• Explain disaster response guidelines\n\nWhat would you like to know?",
        sources: undefined,
      }
      setMessages([greetingMessage])
    }
  }, [])

  // Auto-send initial message if provided (e.g., from voice)
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && messages.length <= 1) {
      handleSend(initialMessage)
    }
  }, [initialMessage])

  // Check if input is a greeting (not a question)
  const isGreeting = (text: string): boolean => {
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i,
      /^(thanks|thank you|thx)/i,
      /^(bye|goodbye|see you)/i,
      /^(how are you|how's it going|what's up)/i,
    ]
    return greetingPatterns.some(pattern => pattern.test(text.trim()))
  }

  // Play TTS for AI response
  const playAudioResponse = async (text: string) => {
    try {
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.substring(0, 1000), // Limit to first 1000 chars for TTS
          voice: "nova",
          doctrineId: `chat_${Date.now()}`,
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

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Check if it's a greeting - respond conversationally without searching doctrine
    if (isGreeting(messageText)) {
      const greetingResponses = [
        "Hello! How can I help you with Red Cross doctrine today?",
        "Hi there! What would you like to know about disaster response operations?",
        "Hey! I'm here to help you find information about Red Cross procedures. What can I help with?",
      ]
      const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
      
      const greetingReply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        sources: undefined,
      }
      
      setMessages((prev) => [...prev, greetingReply])
      setIsLoading(false)
      
      // Play TTS for greeting
      await playAudioResponse(randomResponse)
      return
    }

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    let responseSources: Array<{ id: string; title: string }> = []
    
    try {
      // Find relevant articles for context (only for actual questions)
      const { context: relevantContext, sources } = findRelevantArticles(messageText)
      responseSources = sources
      
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

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              setIsLoading(false)
              return
            }

            try {
              const json = JSON.parse(data)
              const content = json.content
              if (content) {
                accumulatedContent += content
                // Update the assistant message with accumulated content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }
            } catch (e) {
              // Ignore parse errors for comments or invalid JSON
              console.warn("Failed to parse SSE data:", e, data)
            }
          }
        }
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Ask AI error:", error)
      setIsLoading(false)
      // Update the assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "I'm sorry, I'm having trouble processing your question right now. Please try again later.",
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
            {isVoiceSupported && (
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening()
                    setIsVoiceActive(false)
                  } else {
                    setIsVoiceActive(true)
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
              placeholder={isListening ? "Listening..." : "Ask a question..."}
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
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-[10px] text-muted-foreground">Sources:</span>
                          {message.sources.map((source) => (
                            <button
                              key={source.id}
                              onClick={() => {
                                if (onNavigate && source.id) {
                                  onNavigate("doctrine-detail", source.id)
                                }
                              }}
                              className="text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-left max-w-[200px] truncate"
                              title={source.title}
                            >
                              {source.title}
                            </button>
                          ))}
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

      {/* Input bar - fixed at bottom */}
      <div className="p-4 pb-6 border-t border-border bg-background">
        <div className="flex items-end gap-2 p-2 rounded-2xl bg-card border border-border">
          {/* Voice input button */}
          {isVoiceSupported && (
            <button
              onClick={() => {
                if (isListening) {
                  stopListening()
                  setIsVoiceActive(false)
                  resetVoice()
                } else {
                  setIsVoiceActive(true)
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
