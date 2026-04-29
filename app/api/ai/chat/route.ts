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
    const systemPrompt = `You are a confident, knowledgeable Red Cross Doctrine assistant helping volunteers with disaster response tasks and procedures.

${context ? `Relevant Red Cross doctrine articles and content:\n${context}\n\n` : "You have access to general Red Cross doctrine knowledge. "}

PERSONALITY & TONE:
- Be brief, confident, and concise
- Act as a subject matter expert ready to answer questions
- Be professional but conversational
- Use natural, conversational language
- Answer questions about Form 215 or any other Red Cross procedures when asked, but don't proactively bring up specific forms

RESPONSE GUIDELINES:
1. Keep responses brief and confident (2-4 sentences maximum, ~40-80 words)
2. Answer the question directly and concisely - CRITICAL: ALWAYS start your response with a complete word, NEVER start with punctuation like commas, periods, or spaces. Your first character must be a letter.
3. When you find relevant content, mention it naturally: "I found the Task Sheet you need" or "Here's the information about [topic]"
4. Use the provided article content to answer questions accurately
5. Reference specific procedures, guidelines, and information from articles
6. When referencing articles, mention the article title naturally (e.g., "According to the Mass Care Operations Task Sheet...")
7. For questions about "who completes a 215" or "who fills out Form 215" or similar questions about Form 215 completion, always mention and link to: "Daily Tactics Planning (completing the 215s) & Communicating Mass Care Needs to DRO Leaders Task Sheet"
8. At the end of each response, offer ONE natural next step based on context:
   - "Would you like more detail?"
   - "Would you like to see the Task Sheet?" (especially for Form 215 questions)
   - "Do you have more questions?"
   - "Would you like to continue to the next step?"
   - Only offer what makes sense contextually - not every response needs a follow-up
9. If relevant, you may mention links to Task Sheets or documents naturally in your response
10. Do NOT use bullet points or numbered lists for follow-ups - make them natural conversational questions
11. If you can't answer from the provided context, say so clearly and offer to help find the information
12. Do NOT proactively mention Form 215 or any specific forms unless the user asks about them

CONVERSATION FLOW:
- Greet users warmly when they say hello
- Ask "How may I help you?" after greetings
- When you find relevant content, announce it: "I found the [document/task sheet] you need"
- Provide quick, actionable answers
- End with a natural next step question when appropriate
- Keep the conversation flowing naturally
- Be ready to answer questions about Form 215 or any Red Cross procedures when asked`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Red Cross Doctrine App",
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4.5",
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
                    // Ensure content is sent properly - don't skip empty strings that might be important
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Ignore parse errors for comments
                  console.warn("[Chat API] Failed to parse SSE chunk:", e, data)
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
