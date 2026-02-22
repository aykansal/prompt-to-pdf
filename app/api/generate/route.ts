import { streamText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { pdfCatalog } from '@/lib/catalog'
import { buildUserPrompt, Spec } from '@json-render/core'

export async function POST(req: Request) {
  const { prompt, startingSpec, chatId, userId, sessionId } = (await req.json()) as {
    prompt: string;
    startingSpec?: Spec | null;
    chatId?: string;
    userId?: string;
    sessionId?: string;
  };

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const SYSTEM_PROMPT = pdfCatalog.prompt();
  const userPrompt = buildUserPrompt({
    prompt,
    currentSpec: startingSpec,
  });

  const result = streamText({
    model: groq('moonshotai/kimi-k2-instruct-0905'),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.7,
    experimental_telemetry: {
      isEnabled: true,
      functionId: `message-${Date.now()}`,
      metadata: {
        // Group all messages in this chat under one Langfuse trace
        langfuseTraceId: chatId || `chat-${Date.now()}`,
        langfuseUpdateParent: false, // Do not overwrite parent trace with each message
        // User and session tracking
        userId: userId || 'user-001',
        sessionId: sessionId || 'session-001',
        // Additional metadata
        model: "moonshotai/kimi-k2-instruct-0905",
        hasStartingSpec: !!startingSpec,
      },
    },
  })

  return result.toTextStreamResponse()
}