"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/use-conversation";
import { User, Bot, FileText } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

export function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex gap-3 p-4", isUser ? "flex-row" : "flex-row-reverse")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
          isUser ? "bg-primary" : "bg-muted",
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        <div className="text-sm leading-relaxed">{isUser&&message.content}</div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground mt-1">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
