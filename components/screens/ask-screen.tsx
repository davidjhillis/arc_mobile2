"use client"

import type React from "react"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { ArrowUp, Loader2, Sparkles, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { massCareContent } from "@/lib/mass-care-content"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: string[]
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
}

export interface AskScreenRef {
  sendMessage: (text: string) => void
}

export const AskScreen = forwardRef<AskScreenRef, AskScreenProps>(
  ({ initialMessage }, ref) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState(initialMessage || "")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Expose sendMessage method via ref
    useImperativeHandle(ref, () => ({
      sendMessage: (text: string) => {
        handleSend(text)
      },
    }))

    // Auto-send initial message if provided (e.g., from voice)
    useEffect(() => {
      if (initialMessage && initialMessage.trim() && messages.length === 0) {
        handleSend(initialMessage)
      }
    }, [initialMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Find relevant articles based on question
  const findRelevantArticles = (question: string): string => {
    const questionLower = question.toLowerCase()
    const articleScores: Array<{ article: typeof massCareContent[string]; score: number }> = []
    
    // Search through all articles for relevant content
    Object.values(massCareContent).forEach((article) => {
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
        articleScores.push({ article, score })
      }
    })
    
    // Sort by score and take top 3 most relevant
    articleScores.sort((a, b) => b.score - a.score)
    const topArticles = articleScores.slice(0, 3)
    
    // Format articles for context
    return topArticles.map(({ article }) => {
      return `---\nArticle: ${article.title}\nCategory: ${article.category}\nSummary: ${article.summary}\n\nContent:\n${article.content.substring(0, 4000)}\n---`
    }).join("\n\n")
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

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      sources: ["Red Cross Doctrine"],
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Find relevant articles for context
      const relevantContext = findRelevantArticles(messageText)
      
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
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              autoComplete="off"
              className={cn(
                "flex-1 px-2 py-2 bg-transparent resize-none",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none",
                "max-h-24",
              )}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                "transition-all duration-200",
                input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
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
                      {message.sources && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.sources.map((source) => (
                            <span
                              key={source}
                              className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground"
                            >
                              {source}
                            </span>
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
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up..."
            rows={1}
            autoComplete="off"
            className={cn(
              "flex-1 px-2 py-2 bg-transparent resize-none",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none",
              "max-h-24",
            )}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              "transition-all duration-200",
              input.trim() && !isLoading ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
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
