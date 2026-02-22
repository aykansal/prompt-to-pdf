import type { Conversation, ConversationState } from "./conversation";
import { STORAGE_KEY } from "./conversation";

export function loadConversations(): ConversationState {
  if (typeof window === "undefined") {
    return {
      conversations: [],
      currentConversationId: null,
      currentPdfVersionId: null,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        conversations: [],
        currentConversationId: null,
        currentPdfVersionId: null,
      };
    }

    const parsed = JSON.parse(stored);
    return {
      conversations: parsed.conversations || [],
      currentConversationId: parsed.currentConversationId || null,
      currentPdfVersionId: parsed.currentPdfVersionId || null,
    };
  } catch (error) {
    console.error("Failed to load conversations from localStorage:", error);
    return {
      conversations: [],
      currentConversationId: null,
      currentPdfVersionId: null,
    };
  }
}

export function saveConversations(state: ConversationState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save conversations to localStorage:", error);
  }
}

export function addConversation(state: ConversationState, conversation: Conversation): ConversationState {
  const newState = {
    ...state,
    conversations: [...state.conversations, conversation],
    currentConversationId: conversation.id,
    currentPdfVersionId: null,
  };
  saveConversations(newState);
  return newState;
}

export function updateConversation(
  state: ConversationState,
  conversationId: string,
  updates: Partial<Conversation>
): ConversationState {
  const newState = {
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, ...updates } : conv
    ),
  };
  saveConversations(newState);
  return newState;
}

export function deleteConversation(state: ConversationState, conversationId: string): ConversationState {
  const newState = {
    ...state,
    conversations: state.conversations.filter(conv => conv.id !== conversationId),
    currentConversationId: state.currentConversationId === conversationId ? null : state.currentConversationId,
    currentPdfVersionId: null,
  };
  saveConversations(newState);
  return newState;
}

export function setCurrentConversation(
  state: ConversationState,
  conversationId: string | null
): ConversationState {
  const newState = {
    ...state,
    currentConversationId: conversationId,
    currentPdfVersionId: null,
  };
  saveConversations(newState);
  return newState;
}

export function setCurrentPdfVersion(
  state: ConversationState,
  versionId: string | null
): ConversationState {
  const newState = {
    ...state,
    currentPdfVersionId: versionId,
  };
  saveConversations(newState);
  return newState;
}
