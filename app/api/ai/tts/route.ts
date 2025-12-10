import { NextRequest } from "next/server"
import { put, head } from "@vercel/blob"

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
  try {
    const { url } = await put(blobName, audioBuffer, {
      access: 'public',
      contentType: 'audio/mpeg',
    })
    console.log("Audio saved to blob:", url)
    return url
  } catch (blobError) {
    console.error("Blob storage error:", blobError)
    throw new Error(`Failed to save audio to blob storage: ${blobError instanceof Error ? blobError.message : "Unknown error"}`)
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
        const existingBlob = await head(blobName)
        // Blob exists, return the URL
        return new Response(JSON.stringify({ 
          audioUrl: existingBlob.url,
          cached: true
        }), {
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        // Blob doesn't exist, will generate below
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
    console.error("TTS error details:", errorMessage)
    return new Response(JSON.stringify({ 
      error: "Failed to generate AI speech",
      details: errorMessage
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
