# Vercel Environment Variables Setup

Add these environment variables in your Vercel project settings:

## Required Environment Variables

### 1. OPENROUTER_API_KEY
- **Purpose**: Powers AI chat and summarization features
- **Where to get it**: https://openrouter.ai/keys
- **Used in**: 
  - `/app/api/ai/chat/route.ts`
  - `/app/api/ai/summarize/route.ts`

### 2. OPENAI_API_KEY
- **Purpose**: Powers AI text-to-speech (TTS) functionality
- **Where to get it**: https://platform.openai.com/api-keys
- **Used in**: 
  - `/app/api/ai/tts/route.ts`
  - `/scripts/generate-audio-files.ts`

### 3. BLOB_READ_WRITE_TOKEN
- **Purpose**: Vercel Blob storage token for caching generated audio files
- **Where to get it**: From your Vercel Blob store settings
- **Value**: `vercel_blob_rw_3IFpXqk2GnLoll6M_4ECQx6eeXteQ7RFoD4jW9QzIiPIZ5Z` (your token)
- **Used in**: `/app/api/ai/tts/route.ts`
- **Note**: This token allows the app to store and retrieve audio files from Vercel Blob storage. It's automatically available in Vercel if Blob is enabled, but you can also set it manually.

## Optional Environment Variables

### 4. NEXT_PUBLIC_APP_URL
- **Purpose**: Used for HTTP-Referer header in API requests (optional)
- **Default**: `http://localhost:3000` (development)
- **Production**: Set to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: Your OpenRouter API key
   - **Environment**: Production, Preview, Development (select all)
   
   Repeat for `OPENAI_API_KEY`, `BLOB_READ_WRITE_TOKEN`, and optionally `NEXT_PUBLIC_APP_URL`

4. After adding variables, redeploy your application for changes to take effect

## Notes

- Never commit API keys to Git (they're already in `.gitignore`)
- Use different keys for production vs development if needed
- The `NEXT_PUBLIC_` prefix makes variables available to the browser (use sparingly)
