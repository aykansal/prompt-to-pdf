import type { Spec } from "@json-render/core";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  spec?: Spec;
}

export interface PDFVersion {
  id: string;
  version: number;
  spec: Spec;
  timestamp: number;
  messageId: string;
  filename: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pdfVersions: PDFVersion[];
  createdAt: number;
  updatedAt: number;
}

export interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentPdfVersionId: string | null;
}

export const STORAGE_KEY = "prompt-to-pdf-conversations";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createConversation(title: string): Conversation {
  const id = generateId();
  return {
    id,
    title,
    messages: [],
    pdfVersions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addMessage(
  conversation: Conversation,
  role: Message["role"],
  content: string,
  spec?: Spec
): Conversation {
  const message: Message = {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    spec,
  };

  return {
    ...conversation,
    messages: [...conversation.messages, message],
    updatedAt: Date.now(),
  };
}

export function addPdfVersion(
  conversation: Conversation,
  spec: Spec,
  messageId: string
): Conversation {
  const version: PDFVersion = {
    id: generateId(),
    version: conversation.pdfVersions.length + 1,
    spec,
    timestamp: Date.now(),
    messageId,
    filename: `${conversation.title.replace(/[^a-zA-Z0-9]/g, "_")}_v${conversation.pdfVersions.length + 1}.pdf`,
  };

  return {
    ...conversation,
    pdfVersions: [...conversation.pdfVersions, version],
    updatedAt: Date.now(),
  };
}

export function getLatestPdfVersion(conversation: Conversation): PDFVersion | null {
  return conversation.pdfVersions.length > 0
    ? conversation.pdfVersions[conversation.pdfVersions.length - 1]
    : null;
}

export function getPdfVersion(conversation: Conversation, versionId: string): PDFVersion | null {
  return conversation.pdfVersions.find(v => v.id === versionId) || null;
}
