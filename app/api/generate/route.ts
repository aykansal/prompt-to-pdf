import { streamText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { pdfCatalog } from '@/lib/catalog'
import { buildUserPrompt, Spec } from '@json-render/core'

// Store conversations in memory (in production, use a database)
const conversations = new Map<string, Array<{role: 'user' | 'assistant', content: string, spec?: Spec}>>();

export async function POST(req: Request) {
  const { prompt, startingSpec, conversationId } = (await req.json()) as {
    prompt: string;
    startingSpec?: Spec | null;
    conversationId?: string;
  };

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  // Get or create conversation
  let messages = conversations.get(conversationId || '') || [];
  
  // Add user message
  messages.push({ role: 'user', content: prompt });
  
  const SYSTEM_PROMPT = pdfCatalog.prompt();
  const userPrompt = buildUserPrompt({
    prompt,
    currentSpec: startingSpec,
  });

  const result = streamText({
    model: groq('moonshotai/kimi-k2-instruct-0905'),
    system: SYSTEM_PROMPT,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: 0.7,
    experimental_telemetry: {
      isEnabled: true,
      functionId: `message-${Date.now()}`,
      metadata: {
        langfuseTraceId: conversationId || `chat-${Date.now()}`,
        langfuseUpdateParent: false,
        userId: 'user-001',
        sessionId: conversationId || 'session-001',
        model: "moonshotai/kimi-k2-instruct-0905",
        hasStartingSpec: !!startingSpec,
      },
    },
    onFinish: async ({ text }) => {
      // Add assistant message to conversation
      messages.push({ role: 'assistant', content: text });
      
      // Store updated conversation
      if (conversationId) {
        conversations.set(conversationId, messages);
      }
    },
  });

  return result.toTextStreamResponse();
}

// GET endpoint to retrieve conversation history
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  
  if (!conversationId) {
    return Response.json({ error: "conversationId is required" }, { status: 400 });
  }
  
  const messages = conversations.get(conversationId) || [];
  return Response.json({ messages });
}