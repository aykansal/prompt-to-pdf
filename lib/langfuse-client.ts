/**
 * Shared Langfuse client for creating parent traces so chat messages
 * group under one trace in Langfuse (one chat = one trace).
 *
 * Used in the chat API route to create/update the parent trace before
 * each streamText call; the langfuse-vercel exporter then attaches
 * each message's generation to that trace when langfuseTraceId is set.
 */

import { Langfuse } from "langfuse";
import { isProductionEnvironment } from "@/lib/constants";

let langfuseClient: Langfuse | null = null;

function getLangfuseClient(): Langfuse | null {
  if (!isProductionEnvironment && process.env.ENABLE_LANGFUSE_IN_DEV !== "true") {
    return null;
  }
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  if (!secretKey || !publicKey) {
    return null;
  }
  if (!langfuseClient) {
    langfuseClient = new Langfuse({
      secretKey,
      publicKey,
      baseUrl: process.env.LANGFUSE_BASEURL ?? "https://cloud.langfuse.com",
      persistence: "memory",
    });
  }
  return langfuseClient;
}

/**
 * Create or update a parent trace in Langfuse so all messages in a chat
 * appear under one trace. Call this at the start of each chat request
 * before streamText; set langfuseTraceId to the same chatId and
 * langfuseUpdateParent: false in experimental_telemetry so the exporter
 * attaches generations to this trace without overwriting trace-level fields.
 */
export function createChatParentTrace(params: {
  traceId: string;
  name: string;
  userId: string;
  sessionId: string;
  input?: string;
  output?: string;
  metadata?: Record<string, unknown>;
}): void {
  const langfuse = getLangfuseClient();
  if (!langfuse) {
    return;
  }
  try {
    langfuse.trace({
      id: params.traceId,
      name: params.name,
      userId: params.userId,
      sessionId: params.sessionId,
      input: params.input,
      output: params.output,
      metadata: params.metadata,
    });
  } catch {
    // Non-critical: parent trace is optional for grouping
  }
}

/**
 * Create parent trace and flush immediately so the trace exists in Langfuse
 * before streamText runs. Ensures old-chat messages get a proper entry (trace
 * with name, userId, sessionId) even when after() runs late or not at all.
 */
export async function createChatParentTraceAndFlush(params: {
  traceId: string;
  name: string;
  userId: string;
  sessionId: string;
  input?: string;
  output?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  createChatParentTrace(params);
  await flushLangfuse();
}

/**
 * Update an existing parent trace with output or additional metadata
 */
export function updateChatParentTrace(params: {
  traceId: string;
  name: string;
  userId: string;
  sessionId: string;
  input?: string;
  output?: string;
  metadata?: Record<string, unknown>;
}): void {
  createChatParentTrace(params);
}

/**
 * Flush the Langfuse client so pending events (e.g. parent trace) are sent.
 * Call from after() in the chat route so traces are sent before the serverless function terminates.
 */
export async function flushLangfuse(): Promise<void> {
  const langfuse = getLangfuseClient();
  if (!langfuse) {
    return;
  }
  try {
    await langfuse.flushAsync();
  } catch {
    // Non-critical
  }
}
