import { NextRequest } from "next/server"
import { list } from "@vercel/blob"

// Get blob token (supports both default BLOB_READ_WRITE_TOKEN and custom arc_READ_WRITE_TOKEN)
const getBlobToken = () => {
  return (
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.arc_READ_WRITE_TOKEN ||
    process.env.ARC_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN
  )
}

export async function GET(request: NextRequest) {
  try {
    const token = getBlobToken()
    const prefix = "iph-service-blob/ARC/audio/"
    
    console.log(`[check-blob] Listing blobs with prefix: ${prefix}`)
    console.log(`[check-blob] Token available: ${!!token}`)
    
    // List all blobs in the ARC/audio folder
    const { blobs } = await list({
      prefix,
      ...(token && { token }), // Pass token if available, otherwise let SDK auto-detect
    })
    
    console.log(`[check-blob] Found ${blobs.length} blobs`)

    return new Response(JSON.stringify({
      count: blobs.length,
      files: blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
    }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Blob list error:", error)
    return new Response(JSON.stringify({
      error: "Failed to list blobs",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
