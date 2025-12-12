"use client"

import type React from "react"
import { useState } from "react"
import { ArrowRight, Loader2, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSSOLoading, setIsSSOLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsLoading(false)
    onLogin()
  }

  const handleSSOLogin = async () => {
    setIsSSOLoading(true)
    // In a real implementation, this would redirect to Ping Federated SSO
    // For now, simulate the SSO flow
    await new Promise((r) => setTimeout(r, 1000))
    setIsSSOLoading(false)
    onLogin()
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Minimal logo mark */}
        <div className="mb-8">
          <img 
            src="/American_Red_Cross_logo.svg" 
            alt="American Red Cross" 
            className="h-12"
          />
        </div>

        {/* Clean headline */}
        <h1 className="text-2xl font-medium text-foreground mb-2 tracking-tight">Disaster Cycle Doctrine</h1>
        <p className="text-muted-foreground text-sm mb-10">Sign in to access volunteer resources</p>

        {/* SSO Login Button */}
        <div className="w-full max-w-xs mb-6">
          <button
            onClick={handleSSOLogin}
            disabled={isSSOLoading || isLoading}
            className={cn(
              "w-full h-12 rounded-xl font-medium text-sm",
              "bg-primary text-primary-foreground",
              "flex items-center justify-center gap-2",
              "active:scale-[0.98] transition-all duration-200",
              "disabled:opacity-50",
              "shadow-sm",
            )}
          >
            {isSSOLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign in with SSO
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="w-full max-w-xs flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Minimal form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={cn(
              "w-full h-12 px-4 rounded-xl",
              "bg-card/50 border border-border/50",
              "text-foreground text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:border-primary/50 focus:bg-card",
              "transition-all duration-200",
            )}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={cn(
              "w-full h-12 px-4 rounded-xl",
              "bg-card/50 border border-border/50",
              "text-foreground text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:border-primary/50 focus:bg-card",
              "transition-all duration-200",
            )}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full h-12 rounded-xl font-medium text-sm",
              "bg-primary text-primary-foreground",
              "flex items-center justify-center gap-2",
              "active:scale-[0.98] transition-all duration-200",
              "disabled:opacity-50",
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <button className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Forgot password?
        </button>

        <p className="mt-8 text-xs text-muted-foreground">Powered by Ping Federated SSO</p>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">© American Red Cross</p>
      </div>
    </div>
  )
}
