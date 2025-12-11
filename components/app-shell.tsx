"use client"

import { useState, useRef, useEffect } from "react"
import { MobileNav } from "./mobile-nav"
import { HomeScreen } from "./screens/home-screen"
import { DisasterScreen } from "./screens/disaster-screen"
import { ServicesScreen } from "./screens/services-screen"
import { AskScreen, type AskScreenRef } from "./screens/ask-screen"
import { ProfileScreen } from "./screens/profile-screen"
import { LoginScreen } from "./screens/login-screen"
import { DoctrineScreen } from "./screens/doctrine-screen"
import { GroupDocumentsScreen } from "./screens/group-documents-screen"
import { DoctrineDetailScreen } from "./screens/doctrine-detail-screen"
import { FeedScreen } from "./screens/feed-screen"
import { DownloadsScreen } from "./screens/downloads-screen"
import { VoiceAgent } from "./voice-agent"

export type Screen =
  | "login"
  | "home"
  | "disasters"
  | "services"
  | "ask"
  | "profile"
  | "doctrine"
  | "group-documents"
  | "doctrine-detail"
  | "feed"
  | "downloads"

export function AppShell() {
  const [activeScreen, setActiveScreen] = useState<Screen>("login")
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null)
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null)
  const askScreenRef = useRef<AskScreenRef | null>(null)

  const handleNavigate = (screen: Screen, disasterType?: string, doctrineId?: string, group?: string) => {
    if (disasterType) {
      setSelectedDisaster(disasterType)
    }
    if (doctrineId) {
      setSelectedDoctrineId(doctrineId)
    }
    if (group) {
      setSelectedGroup(group)
    }
    setActiveScreen(screen)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    setActiveScreen("home")
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case "login":
        return <LoginScreen onLogin={handleLogin} />
      case "home":
        return <HomeScreen onNavigate={handleNavigate} />
      case "disasters":
        return <DisasterScreen onNavigate={handleNavigate} />
      case "doctrine":
        return <DoctrineScreen disasterType={selectedDisaster} onNavigate={handleNavigate} />
      case "group-documents":
        return (
          <GroupDocumentsScreen
            subActivity={selectedDisaster}
            group={selectedGroup}
            onNavigate={handleNavigate}
          />
        )
      case "doctrine-detail":
        return <DoctrineDetailScreen doctrineId={selectedDoctrineId} onNavigate={handleNavigate} />
      case "services":
        return <ServicesScreen onNavigate={handleNavigate} />
      case "ask":
        return <AskScreen ref={askScreenRef} initialMessage={voiceTranscript || undefined} />
      case "profile":
        return <ProfileScreen onNavigate={handleNavigate} />
      case "feed":
        return <FeedScreen onNavigate={handleNavigate} />
      case "downloads":
        return <DownloadsScreen onNavigate={handleNavigate} />
      default:
        return <HomeScreen onNavigate={handleNavigate} />
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    // Navigate to ask screen if not already there
    if (activeScreen !== "ask") {
      setVoiceTranscript(transcript)
      handleNavigate("ask")
    } else {
      // If already on ask screen, send message directly
      if (askScreenRef.current) {
        askScreenRef.current.sendMessage(transcript)
      } else {
        // Fallback: set transcript and let AskScreen handle it
        setVoiceTranscript(transcript)
      }
    }
  }
  
  // Clear voice transcript after it's been used
  useEffect(() => {
    if (voiceTranscript && activeScreen === "ask") {
      // Clear after a delay to allow AskScreen to process it
      const timer = setTimeout(() => {
        setVoiceTranscript(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [voiceTranscript, activeScreen])

  const handleVoiceCommand = (command: string, transcript: string) => {
    console.log("Voice command:", command, transcript)
    
    // Parse commands and navigate accordingly
    switch (command) {
      case "find":
        // Extract article name from transcript and search
        handleNavigate("ask")
        break
      case "read":
        // Extract article name and navigate to it
        handleNavigate("ask")
        break
      default:
        // Default: just send to chat
        handleNavigate("ask")
    }
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto bg-background">
      <main className="flex-1 overflow-y-auto pb-20">{renderScreen()}</main>
      {isAuthenticated && activeScreen !== "login" && (
        <MobileNav 
          activeScreen={activeScreen} 
          onNavigate={(screen) => handleNavigate(screen)}
          onVoiceTranscript={handleVoiceTranscript}
        />
      )}
    </div>
  )
}
