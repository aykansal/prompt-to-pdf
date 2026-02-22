"use client";

import { useState, useCallback, useEffect } from "react";
import type { Spec } from "@json-render/core";

export interface Message {
  role: "user" | "assistant";
  content: string;
  spec?: Spec;
}

interface PDFVersion {
  id: string;
  version: number;
  spec: Spec;
  timestamp: number;
  messageId: string;
  filename: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pdfVersions: PDFVersion[];
  createdAt: number;
  updatedAt: number;
}

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentPdfVersionId: string | null;
}

const STORAGE_KEY = "prompt-to-pdf-conversations";

export function useConversation() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, setState] = useState<ConversationState>({
    conversations: [],
    currentConversationId: null,
    currentPdfVersionId: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          conversations: parsed.conversations,
          currentConversationId: parsed.currentConversationId,
          currentPdfVersionId: parsed.currentPdfVersionId,
        });
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  }, [state, isLoaded]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createConversation = useCallback((title: string) => {
    const newConversation: Conversation = {
      id: generateId(),
      title,
      messages: [],
      pdfVersions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      conversations: [...prev.conversations, newConversation],
      currentConversationId: newConversation.id,
      currentPdfVersionId: null,
    }));

    return newConversation;
  }, []);

  const addMessage = useCallback((conversationId: string, role: Message["role"], content: string, spec?: Spec) => {
    const message: Message = {
      role,
      content,
      spec,
    };

    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: Date.now(),
            }
          : conv
      ),
    }));
  }, []);

  const addPdfVersion = useCallback((conversationId: string, spec: Spec, messageId: string) => {
    const version: PDFVersion = {
      id: generateId(),
      version: 1, // Will be calculated based on existing versions
      spec,
      timestamp: Date.now(),
      messageId,
      filename: `document_v1.pdf`,
    };

    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => {
        if (conv.id !== conversationId) return conv;
        
        const existingVersions = conv.pdfVersions;
        const newVersion = {
          ...version,
          version: existingVersions.length + 1,
          filename: `${conv.title.replace(/[^a-zA-Z0-9]/g, "_")}_v${existingVersions.length + 1}.pdf`,
        };
        
        return {
          ...conv,
          pdfVersions: [...existingVersions, newVersion],
          updatedAt: Date.now(),
        };
      }),
      currentPdfVersionId: version.id,
    }));
  }, []);

  const setCurrentConversation = useCallback((conversationId: string | null) => {
    setState(prev => ({
      ...prev,
      currentConversationId: conversationId,
      currentPdfVersionId: null,
    }));
  }, []);

  const setCurrentPdfVersion = useCallback((versionId: string | null) => {
    setState(prev => ({
      ...prev,
      currentPdfVersionId: versionId,
    }));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(conv => conv.id !== conversationId),
      currentConversationId: prev.currentConversationId === conversationId ? null : prev.currentConversationId,
      currentPdfVersionId: null,
    }));
  }, []);

  const currentConversation = state.currentConversationId
    ? state.conversations.find(c => c.id === state.currentConversationId) || null
    : null;

  const currentPdfVersion = state.currentPdfVersionId && currentConversation
    ? currentConversation.pdfVersions.find(v => v.id === state.currentPdfVersionId) || null
    : currentConversation
    ? currentConversation.pdfVersions[currentConversation.pdfVersions.length - 1] || null
    : null;

  return {
    ...state,
    currentConversation,
    currentPdfVersion,
    createConversation,
    addMessage,
    addPdfVersion,
    setCurrentConversation,
    setCurrentPdfVersion,
    deleteConversation,
  };
}
