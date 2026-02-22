"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  FileText,
  ChevronRight,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  spec?: any;
}

interface PDFVersion {
  id: string;
  version: number;
  spec: any;
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

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
}: ConversationHistoryProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-3 h-9 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          conversations
        </span>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onNewConversation}
          title="New conversation"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <button
            onClick={() => onSelectConversation(null)}
            className={cn(
              "w-full text-left px-3 py-2 rounded text-sm transition-colors",
              !currentConversationId
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <span className="font-medium">New Chat</span>
            <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">
              Start from scratch or an example
            </p>
          </button>

          {sortedConversations.map((conversation) => (
            <div key={conversation.id} className="space-y-1">
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded text-sm transition-colors group",
                  currentConversationId === conversation.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {conversation.title}
                      </span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        v{conversation.pdfVersions.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug truncate">
                      {conversation.messages[conversation.messages.length - 1]?.content ||
                        "No messages"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] text-muted-foreground/50">
                        {formatDistanceToNow(conversation.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 opacity-50" />
                </div>
              </button>

              <div className="flex items-center gap-1 px-3">
                <span className="text-[10px] text-muted-foreground/50">
                  {conversation.messages.length} messages
                </span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="text-[10px] text-muted-foreground/50">
                  {conversation.pdfVersions.length} PDF{conversation.pdfVersions.length !== 1 ? "s" : ""}
                </span>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setDeleteConfirmId(conversation.id)}
                  title="Delete conversation"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {deleteConfirmId === conversation.id && (
                <div className="px-3 pb-2">
                  <div className="bg-destructive/10 rounded p-2">
                    <p className="text-xs text-destructive mb-2">
                      Delete this conversation?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 text-xs"
                        onClick={() => {
                          onDeleteConversation(conversation.id);
                          setDeleteConfirmId(null);
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
