/**
 * Pre-generate audio files for all doctrine content
 * 
 * This script generates AI TTS audio files for all doctrine content
 * and saves them to public/audio/ for fast playback.
 * 
 * Run with: npx tsx scripts/generate-audio-files.ts
 */

import fs from "fs"
import path from "path"
import { massCareContent } from "../lib/mass-care-content"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment variables")
  console.error("Please add it to your .env.local file")
  process.exit(1)
}

const AUDIO_DIR = path.join(process.cwd(), "public", "audio")

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
  console.log("📁 Created audio directory:", AUDIO_DIR)
}

// Clean text for TTS (remove markdown formatting)
function cleanTextForTTS(text: string): string {
  return text
    .replace(/##+\s+/g, "") // Remove headers
    .replace(/\*\*/g, "") // Remove bold
    .replace(/\*/g, "") // Remove italics
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Convert links to text
    .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
    .substring(0, 4096) // OpenAI limit is 4096 characters
}

async function generateAudioFile(doctrineId: string, text: string): Promise<boolean> {
  const audioPath = path.join(AUDIO_DIR, `${doctrineId}.mp3`)
  
  // Skip if file already exists
  if (fs.existsSync(audioPath)) {
    console.log(`⏭️  Skipping ${doctrineId} (already exists)`)
    return true
  }

  try {
    const cleanText = cleanTextForTTS(text)
    
    console.log(`🎵 Generating audio for: ${doctrineId}...`)
    
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: cleanText,
        voice: "nova", // Professional AI female voice
        response_format: "mp3",
        speed: 1.0,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to generate audio for ${doctrineId}:`, errorText)
      return false
    }

    // Save audio file
    const audioBuffer = await response.arrayBuffer()
    fs.writeFileSync(audioPath, Buffer.from(audioBuffer))
    
    const fileSizeKB = (audioBuffer.byteLength / 1024).toFixed(2)
    console.log(`✅ Generated ${doctrineId}.mp3 (${fileSizeKB} KB)`)
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return true
  } catch (error) {
    console.error(`❌ Error generating audio for ${doctrineId}:`, error)
    return false
  }
}

async function main() {
  console.log("🚀 Starting audio file generation...\n")
  
  const doctrineIds = Object.keys(massCareContent)
  let successCount = 0
  let skipCount = 0
  let failCount = 0

  for (const doctrineId of doctrineIds) {
    const doctrine = massCareContent[doctrineId]
    
    if (!doctrine.content) {
      console.log(`⚠️  Skipping ${doctrineId} (no content)`)
      continue
    }

    const exists = fs.existsSync(path.join(AUDIO_DIR, `${doctrineId}.mp3`))
    if (exists) {
      skipCount++
    }

    const success = await generateAudioFile(doctrineId, doctrine.content)
    if (success) {
      if (exists) {
        skipCount++
      } else {
        successCount++
      }
    } else {
      failCount++
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log("📊 Generation Summary:")
  console.log(`✅ Generated: ${successCount}`)
  console.log(`⏭️  Skipped (already exists): ${skipCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📁 Audio files saved to: ${AUDIO_DIR}`)
  console.log("=".repeat(50))
}

main().catch(console.error)
