import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Red Cross Doctrine",
  description: "Disaster response doctrine for American Red Cross volunteers",
  generator: "v0.app",
  // iOS Web Clip / PWA settings
  applicationName: "Red Cross Doctrine",
  appleWebApp: {
    capable: true,
    title: "RC Doctrine",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    // Apple touch icon for home screen
    apple: "/apple-icon.png",
  },
  // PWA manifest
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fafafa",
  // iOS specific viewport settings
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased touch-scroll tap-highlight`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
