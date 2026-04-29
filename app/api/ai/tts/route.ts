import { NextRequest } from "next/server"
import { put, head, list } from "@vercel/blob"

// Get blob token (supports both default BLOB_READ_WRITE_TOKEN and custom arc_READ_WRITE_TOKEN)
// Vercel Blob SDK can auto-detect tokens when integrated via dashboard, but we'll try to get it explicitly
const getBlobToken = () => {
  // Check all possible token names
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.arc_READ_WRITE_TOKEN ||
    process.env.ARC_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN
  )
}

/**
 * Generate audio file and save to Vercel Blob, return blob URL
 */
async function generateAndSaveAudio(doctrineId: string, text: string, voice: string = "shimmer"): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured")
  }

  // Clean text for TTS
  const cleanText = text
    .replace(/##+\s+/g, "") // Remove headers
    .replace(/\*\*/g, "") // Remove bold
    .replace(/\*/g, "") // Remove italics
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Convert links to text
    .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
    // Note: OpenAI TTS limit is 4096 characters, but we'll handle longer text by splitting if needed
    .substring(0, 4096) // OpenAI limit is 4096 characters per request

  // Generate audio via OpenAI API
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
      body: JSON.stringify({
        model: "tts-1", // Use faster model for speed (tts-1 instead of tts-1-hd)
        input: cleanText,
        voice: voice,
        response_format: "mp3",
        speed: 1.0, // Normal speed (1.0×)
      }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI TTS API error: ${errorText}`)
  }

  // Get audio buffer
  const audioBuffer = await response.arrayBuffer()
  
  // Save to Vercel Blob in organized folder structure
  const blobName = `iph-service-blob/ARC/audio/${doctrineId}.mp3`
  const blobToken = getBlobToken()
  
  try {
    // Vercel Blob SDK can auto-detect token when integrated via dashboard
    // Only pass token explicitly if we have it, otherwise let SDK auto-detect
    const putOptions: any = {
      access: 'public',
      contentType: 'audio/mpeg',
    }
    
    if (blobToken) {
      putOptions.token = blobToken
      console.log("Using explicit blob token")
    } else {
      console.log("Relying on Vercel Blob SDK auto-detection")
    }
    
    const { url } = await put(blobName, audioBuffer, putOptions)
    console.log("Audio saved to blob:", {
      url,
      blobName,
      size: audioBuffer.byteLength
    })
    return url
  } catch (blobError) {
    console.error("Blob storage error:", blobError)
    const errorMsg = blobError instanceof Error ? blobError.message : "Unknown error"
    throw new Error(`Failed to save audio to blob storage: ${errorMsg}. ${blobToken ? 'Token provided.' : 'No token found - ensure Blob is integrated in Vercel dashboard.'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "shimmer", doctrineId } = await request.json()

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // If doctrineId provided, check if blob already exists (fast path with timeout)
    if (doctrineId) {
      const blobName = `iph-service-blob/ARC/audio/${doctrineId}.mp3`
      const blobToken = getBlobToken()
      
      // Use head() with timeout to prevent hanging
      try {
        const headOptions: any = blobToken ? { token: blobToken } : {}
        const startTime = Date.now()
        
        // Add timeout wrapper - if head() takes more than 2 seconds, skip cache check
        const headPromise = head(blobName, headOptions)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Cache check timeout")), 2000)
        )
        
        const existingBlob = await Promise.race([headPromise, timeoutPromise]) as Awaited<ReturnType<typeof head>>
        const elapsed = Date.now() - startTime
        
        // Blob exists, return immediately
        console.log(`[TTS Cache HIT] Found cached audio in ${elapsed}ms:`, existingBlob.url)
        return new Response(JSON.stringify({ 
          audioUrl: existingBlob.url,
          cached: true
        }), {
          headers: { 
            "Content-Type": "application/json",
            "X-Cache-Status": "HIT",
            "X-Cache-Time": elapsed.toString()
          },
        })
      } catch (headError) {
        // head() throws if blob doesn't exist OR if timeout occurred
        const errorMsg = headError instanceof Error ? headError.message : String(headError)
        const isTimeout = errorMsg.includes("timeout") || errorMsg.includes("Timeout")
        
        if (isTimeout) {
          console.warn(`[TTS Cache] head() check timed out after 2s, skipping cache check for: ${doctrineId}`)
          // On timeout, skip cache and generate directly (better UX than waiting)
        } else if (!errorMsg.includes("404") && !errorMsg.includes("not found")) {
          console.warn("[TTS Cache] head() check failed (non-404):", errorMsg)
        } else {
          console.log(`[TTS Cache MISS] Blob not found, will generate: ${doctrineId}`)
        }
        // Continue to generation below
      }
    }

    // Generate new audio file (cache miss)
    const audioId = doctrineId || `temp_${Date.now()}`
    const generateStartTime = Date.now()
    const audioUrl = await generateAndSaveAudio(audioId, text, voice)
    const generateElapsed = Date.now() - generateStartTime
    
    console.log(`[TTS Generated] Created new audio in ${generateElapsed}ms:`, audioUrl)

    return new Response(JSON.stringify({ 
      audioUrl,
      cached: false
    }), {
      headers: { 
        "Content-Type": "application/json",
        "X-Cache-Status": "MISS",
        "X-Generate-Time": generateElapsed.toString()
      },
    })
  } catch (error) {
    console.error("TTS error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("TTS error details:", errorMessage)
    console.error("TTS error stack:", errorStack)
    
    // Log environment variable status (without exposing values)
    console.log("Environment check:", {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasBlobToken: !!getBlobToken(),
      blobTokenSource: process.env.BLOB_READ_WRITE_TOKEN ? "BLOB_READ_WRITE_TOKEN" : process.env.arc_READ_WRITE_TOKEN ? "arc_READ_WRITE_TOKEN" : "none"
    })
    
    return new Response(JSON.stringify({ 
      error: "Failed to generate AI speech",
      details: errorMessage,
      // Include more context for debugging (safe to expose)
      debug: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasBlobToken: !!getBlobToken(),
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

