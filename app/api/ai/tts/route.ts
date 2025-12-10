import { NextRequest } from "next/server"
import { put, head } from "@vercel/blob"

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
async function generateAndSaveAudio(doctrineId: string, text: string, voice: string = "nova"): Promise<string> {
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
    .substring(0, 4096) // OpenAI limit is 4096 characters

  // Generate audio via OpenAI API
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      input: cleanText,
      voice: voice,
      response_format: "mp3",
      speed: 1.0,
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
    console.log("Audio saved to blob:", url)
    return url
  } catch (blobError) {
    console.error("Blob storage error:", blobError)
    const errorMsg = blobError instanceof Error ? blobError.message : "Unknown error"
    throw new Error(`Failed to save audio to blob storage: ${errorMsg}. ${blobToken ? 'Token provided.' : 'No token found - ensure Blob is integrated in Vercel dashboard.'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "nova", doctrineId } = await request.json()

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // If doctrineId provided, check if blob already exists
    if (doctrineId) {
      try {
        const blobName = `iph-service-blob/ARC/audio/${doctrineId}.mp3`
        const blobToken = getBlobToken()
        
        // Try to check if blob exists (with or without explicit token)
        const headOptions: any = blobToken ? { token: blobToken } : {}
        const existingBlob = await head(blobName, headOptions)
        
        // Blob exists, return the URL
        console.log("Found cached audio blob:", existingBlob.url)
        return new Response(JSON.stringify({ 
          audioUrl: existingBlob.url,
          cached: true
        }), {
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        // Blob doesn't exist (head throws if not found), will generate below
        console.log("Blob not found, will generate:", doctrineId, error instanceof Error ? error.message : "")
      }
    }

    // Generate new audio file
    const audioId = doctrineId || `temp_${Date.now()}`
    const audioUrl = await generateAndSaveAudio(audioId, text, voice)

    return new Response(JSON.stringify({ 
      audioUrl,
      cached: false
    }), {
      headers: { "Content-Type": "application/json" },
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

