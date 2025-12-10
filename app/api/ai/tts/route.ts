import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"

const AUDIO_DIR = path.join(process.cwd(), "public", "audio")

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
}

/**
 * Generate audio file and save to disk, return file path
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

  // Save to disk
  const audioBuffer = await response.arrayBuffer()
  const audioPath = path.join(AUDIO_DIR, `${doctrineId}.mp3`)
  fs.writeFileSync(audioPath, Buffer.from(audioBuffer))
  
  return `/audio/${doctrineId}.mp3`
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

    // If doctrineId provided, check if file already exists
    if (doctrineId) {
      const audioPath = path.join(AUDIO_DIR, `${doctrineId}.mp3`)
      if (fs.existsSync(audioPath)) {
        // File exists, return the URL
        return new Response(JSON.stringify({ 
          audioUrl: `/audio/${doctrineId}.mp3`,
          cached: true
        }), {
          headers: { "Content-Type": "application/json" },
        })
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
    return new Response(JSON.stringify({ 
      error: "Failed to generate AI speech",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
