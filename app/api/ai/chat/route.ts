import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Build system prompt with context
    const systemPrompt = `You are a helpful AI assistant for American Red Cross volunteers. You help answer questions about Red Cross doctrine, procedures, and disaster response operations.

${context ? `Relevant Red Cross doctrine articles and content:\n${context}\n\n` : "You have access to general Red Cross doctrine knowledge. "}

IMPORTANT INSTRUCTIONS:
1. Use the provided article content above to answer questions accurately
2. Reference specific procedures, guidelines, and information from the articles when answering
3. When referencing information from articles, mention the article title in your response
4. If the question cannot be answered from the provided context, say so clearly rather than making up information
5. Be concise and practical - volunteers need quick, actionable answers`

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
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
    console.error("AI chat error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
