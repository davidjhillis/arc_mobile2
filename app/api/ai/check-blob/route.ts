import { NextRequest } from "next/server"
import { list } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    // List all blobs in the ARC/audio folder
    const { blobs } = await list({
      prefix: "iph-service-blob/ARC/audio/",
    })

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
