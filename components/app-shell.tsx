"use client"

import { useState, useRef } from "react"
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
  // Track where the user came from when they opened an article so the
  // detail screen's back button returns to that origin (home, feed, ask,
  // doctrine list, etc.) rather than always defaulting to the assignment list.
  const [detailReturnTo, setDetailReturnTo] = useState<Screen>("home")
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
    // Capture the source screen ONCE when navigating into the article
    // detail. Detail→detail jumps (related-doc clicks) preserve the original
    // origin so back still returns to where the user actually came from.
    if (screen === "doctrine-detail" && activeScreen !== "doctrine-detail") {
      setDetailReturnTo(activeScreen)
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
        return (
          <DoctrineDetailScreen
            doctrineId={selectedDoctrineId}
            onNavigate={handleNavigate}
            returnTo={detailReturnTo}
          />
        )
      case "services":
        return <ServicesScreen onNavigate={handleNavigate} />
      case "ask":
        return <AskScreen ref={askScreenRef} onNavigate={handleNavigate} />
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

  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto bg-background">
      <main className="flex-1 overflow-y-auto pb-20">{renderScreen()}</main>
      {isAuthenticated && activeScreen !== "login" && (
        <MobileNav activeScreen={activeScreen} onNavigate={(screen) => handleNavigate(screen)} />
      )}
    </div>
  )
}
