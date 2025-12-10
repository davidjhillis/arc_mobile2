import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Red Cross Doctrine App",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant that creates brief, concise summaries of Red Cross doctrine documents. Keep summaries SHORT (2-3 sentences max). Always format key points as bullet points using '- ' prefix. Be concise and highlight only the most important information.",
          },
          {
            role: "user",
            content: `Create a BRIEF summary (2-3 sentences maximum) of this Red Cross doctrine document, followed by 3-5 key bullet points. Keep it concise and focused on essential information only:\n\n${content.substring(0, 8000)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("OpenRouter API error:", error)
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Return streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n").filter((line) => line.trim())

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  controller.close()
                  return
                }

                try {
                  const json = JSON.parse(data)
                  const content = json.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Ignore parse errors for comments
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("AI summarize error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate summary" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
