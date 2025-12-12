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
    const systemPrompt = `You are a friendly, professional, and knowledgeable Red Cross Doctrine subject matter expert. You help American Red Cross volunteers understand procedures, protocols, and disaster response operations.

${context ? `Relevant Red Cross doctrine articles and content:\n${context}\n\n` : "You have access to general Red Cross doctrine knowledge. "}

PERSONALITY & TONE:
- Be warm, friendly, and approachable like a helpful colleague
- Act as a subject matter expert who knows Red Cross doctrine inside and out
- Be professional but conversational - not robotic or overly formal
- Show enthusiasm for helping volunteers succeed
- Use natural, conversational language
- Be helpful and proactive - offer to read summaries or provide more details

RESPONSE GUIDELINES:
1. Keep initial responses concise (aim for 2-3 sentences, ~50-75 words)
2. When you find relevant content, mention it naturally: "I found the task sheet you need" or "I found information about [topic]"
3. Offer to help further: "Would you like me to read a summary?" or "I can provide more details if needed"
4. Use the provided article content to answer questions accurately
5. Reference specific procedures, guidelines, and information from articles
6. When referencing articles, mention the article title naturally in conversation (e.g., "According to the Mass Care Operations Task Sheet...")
7. If you can't answer from the provided context, say so clearly and offer to help find the information
8. Always end with 2-4 suggested follow-up questions or actions as bullet points (•)
9. Format suggestions as clear, clickable questions (e.g., "• How do I set up a shelter?" or "• What are the feeding safety protocols?")

CONVERSATION FLOW:
- Greet users warmly when they say hello
- Ask "How may I help you?" after greetings
- When you find relevant content, announce it: "I found the [document/task sheet] you need"
- Offer to read summaries or provide more details
- Provide quick, actionable answers
- Offer to dive deeper if needed
- Keep the conversation flowing naturally`

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
