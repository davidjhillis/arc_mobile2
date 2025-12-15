"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: Error) => void
  continuous?: boolean
  lang?: string
}

interface SpeechRecognitionState {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: Error | null
  isSupported: boolean
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    onResult,
    onError,
    continuous = false,
    lang = "en-US",
  } = options

  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: "",
    interimTranscript: "",
    error: null,
    isSupported: false,
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  // Keep refs updated
  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])

  // Check if browser supports Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn("[SpeechRecognition] Not supported in this browser")
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: new Error("Speech recognition is not supported in this browser"),
      }))
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      console.log("[SpeechRecognition] Started listening")
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
      }))
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = finalTranscript + interimTranscript
      console.log("[SpeechRecognition] Result:", { finalTranscript, interimTranscript, fullTranscript })

      setState((prev) => ({
        ...prev,
        transcript: finalTranscript.trim(),
        interimTranscript: interimTranscript.trim(),
      }))

      if (onResultRef.current) {
        onResultRef.current(fullTranscript.trim(), finalTranscript.length > 0)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[SpeechRecognition] Error:", event.error)
      const error = new Error(`Speech recognition error: ${event.error}`)
      setState((prev) => ({
        ...prev,
        isListening: false,
        error,
      }))
      if (onErrorRef.current) {
        onErrorRef.current(error)
      }
    }

    recognition.onend = () => {
      console.log("[SpeechRecognition] Ended")
      setState((prev) => ({
        ...prev,
        isListening: false,
      }))
    }

    recognitionRef.current = recognition
    setState((prev) => ({ ...prev, isSupported: true }))

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [continuous, lang])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const error = new Error("Speech recognition not initialized")
      setState((prev) => ({ ...prev, error }))
      if (onError) {
        onError(error)
      }
      return
    }

    // Reset state before starting
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
      error: null,
    }))

    try {
      // Try to stop any existing session first
      try {
        recognitionRef.current.abort()
      } catch (e) {
        // Ignore abort errors
      }
      
      // Small delay to ensure clean start
      setTimeout(() => {
        try {
          recognitionRef.current?.start()
          console.log("[SpeechRecognition] Starting...")
        } catch (error) {
          console.error("[SpeechRecognition] Start error:", error)
          const err = error instanceof Error ? error : new Error(String(error))
          setState((prev) => ({ ...prev, error: err, isListening: false }))
          if (onError) {
            onError(err)
          }
        }
      }, 100)
    } catch (error) {
      // Already started or other error
      const err = error instanceof Error ? error : new Error(String(error))
      setState((prev) => ({ ...prev, error: err }))
      if (onError) {
        onError(err)
      }
    }
  }, [onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        console.log("[SpeechRecognition] Stopping...")
      } catch (e) {
        // Ignore stop errors
        console.warn("[SpeechRecognition] Stop error:", e)
      }
      setState((prev) => ({ ...prev, isListening: false }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isListening: false,
      transcript: "",
      interimTranscript: "",
      error: null,
      isSupported: state.isSupported,
    })
  }, [state.isSupported])

  return {
    ...state,
    startListening,
    stopListening,
    reset,
  }
}
