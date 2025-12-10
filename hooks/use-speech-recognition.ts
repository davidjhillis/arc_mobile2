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

  // Check if browser supports Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
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

      setState((prev) => ({
        ...prev,
        transcript: finalTranscript.trim(),
        interimTranscript: interimTranscript.trim(),
      }))

      if (onResult) {
        onResult(fullTranscript.trim(), finalTranscript.length > 0)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = new Error(`Speech recognition error: ${event.error}`)
      setState((prev) => ({
        ...prev,
        isListening: false,
        error,
      }))
      if (onError) {
        onError(error)
      }
    }

    recognition.onend = () => {
      setState((prev) => ({
        ...prev,
        isListening: false,
      }))
    }

    recognitionRef.current = recognition
    setState((prev) => ({ ...prev, isSupported: true }))

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, lang, onResult, onError])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const error = new Error("Speech recognition not initialized")
      setState((prev) => ({ ...prev, error }))
      if (onError) {
        onError(error)
      }
      return
    }

    try {
      recognitionRef.current.start()
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
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop()
    }
  }, [state.isListening])

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
