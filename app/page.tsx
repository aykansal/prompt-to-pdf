"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { examples } from "@/lib/examples";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/core";
import { cn } from "@/lib/utils";
import { useConversation } from "@/hooks/use-conversation";
import { ChatMessage } from "@/components/ChatMessage";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  FileText,
  Download,
  Loader2,
  ArrowRight,
  Square,
  MessageSquare,
  ChevronDown,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type Mode = "scratch" | "example";
type View = "json" | "pdf";

interface Selection {
  mode: Mode;
  exampleName?: string;
}

const PDF_REFRESH_INTERVAL_MS = 2000;

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

function isRenderableSpec(spec: Spec | null): spec is Spec {
  if (!spec?.root || !spec.elements) return false;
  const root = spec.elements[spec.root];
  if (!root) return false;
  if (root.type !== "Document" || !root.children?.length) return false;
  const firstChild = spec.elements[root.children[0]!];
  return firstChild?.type === "Page";
}

export default function Page() {
  const [selection, setSelection] = useState<Selection>({
    mode: "example",
    exampleName: examples[0]!.name,
  });
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<Spec | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>("pdf");
  const [examplesSheetOpen, setExamplesSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const conversation = useConversation();

  const pdfUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentExample =
    selection.mode === "example"
      ? examples.find((e) => e.name === selection.exampleName)
      : null;

  const activeSpec =
    conversation.currentPdfVersion?.spec ||
    generatedSpec ||
    currentExample?.spec ||
    null;

  const examplePdfUrl =
    selection.mode === "example" && !generatedSpec
      ? `/api/pdf?name=${selection.exampleName}`
      : null;

  const displayPdfUrl = pdfUrl;

  useEffect(() => {
    inputRef.current?.focus();
  }, [selection.mode, selection.exampleName]);

  // Fetch PDF from localStorage when conversation with PDF version is loaded
  useEffect(() => {
    const spec = conversation.currentPdfVersion?.spec;
    if (spec && isRenderableSpec(spec)) {
      fetchPdfBlob(spec).catch(() => {});
    } else {
      // Clear PDF when switching to a new chat without PDF versions
      setPdfUrl(null);
    }
  }, [conversation.currentPdfVersionId]);

  const fetchPdfBlob = useCallback(async (spec: Spec, signal?: AbortSignal) => {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec }),
      signal,
    });
    if (!res.ok) throw new Error("Failed to generate PDF");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const prev = pdfUrlRef.current;
    pdfUrlRef.current = url;
    setPdfUrl(url);

    if (prev) URL.revokeObjectURL(prev);
  }, []);

  // Progressive PDF refresh during generation
  const lastRefreshSpec = useRef<string>("");
  const generatedSpecRef = useRef<Spec | null>(null);
  generatedSpecRef.current = generatedSpec;

  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(() => {
      const spec = generatedSpecRef.current;
      if (!spec) return;

      const specKey = JSON.stringify(spec);
      if (specKey === lastRefreshSpec.current) return;
      if (!isRenderableSpec(spec)) return;

      lastRefreshSpec.current = specKey;
      setRefreshing(true);
      fetchPdfBlob(spec)
        .catch(() => {})
        .finally(() => setRefreshing(false));
    }, PDF_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [generating, fetchPdfBlob]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setGenerating(true);
    setError(null);
    lastRefreshSpec.current = "";

    try {
      const startingSpec =
        conversation.currentPdfVersion?.spec ||
        (selection.mode === "example" && currentExample
          ? currentExample.spec
          : null);

      // Create or get conversation
      let conversationId = conversation.currentConversationId;
      if (!conversationId) {
        const title =
          prompt.trim().slice(0, 50) + (prompt.length > 50 ? "..." : "");
        const newConv = conversation.createConversation(title);
        conversationId = newConv.id;
      }

      // Add user message
      conversation.addMessage(conversationId, "user", prompt.trim());

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          startingSpec,
          conversationId,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Generation failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      const compiler = createSpecStreamCompiler<Spec>(
        startingSpec ? { ...startingSpec } : {},
      );

      let assistantText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        const { result, newPatches } = compiler.push(chunk);
        if (newPatches.length > 0) setGeneratedSpec(result);
      }

      const finalSpec = compiler.getResult();
      setGeneratedSpec(finalSpec);
      setGenerating(false);

      // Add assistant message and PDF version
      conversation.addMessage(
        conversationId,
        "assistant",
        assistantText,
        finalSpec,
      );
      conversation.addPdfVersion(conversationId, finalSpec, assistantText);

      await fetchPdfBlob(finalSpec);
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Something went wrong");
      setGenerating(false);
    }
  }, [prompt, selection, currentExample, conversation, fetchPdfBlob]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setGenerating(false);

    if (isRenderableSpec(generatedSpec)) {
      fetchPdfBlob(generatedSpec).catch(() => {});
    }
  }, [generatedSpec, fetchPdfBlob]);

  const handleDownload = async () => {
    if (!activeSpec) return;
    if (generatedSpec) {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec: generatedSpec, download: true }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } else if (selection.mode === "example") {
      window.open(
        `/api/pdf?name=${selection.exampleName}&download=1`,
        "_blank",
      );
    }
  };

  const handleDownloadVersion = useCallback(async (version: any) => {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spec: version.spec,
        download: true,
        filename: version.filename,
      }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = version.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate],
  );

  const jsonCode = activeSpec
    ? JSON.stringify(activeSpec, null, 2)
    : "// select an example or generate a PDF";

  // ---------------------------------------------------------------------------
  // Chat Panel
  // ---------------------------------------------------------------------------
  const chatPanel = (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-3 h-9 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          conversation
        </span>
        <div className="flex-1" />
        <ThemeToggle />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setHistoryOpen(true)}
          className="h-6 px-2"
        >
          History
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => conversation.setCurrentConversation(null)}
          className="h-6 px-2"
        >
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {conversation.currentConversation ? (
          <div className="space-y-4">
            {conversation.currentConversation.messages.length > 0 &&
              conversation.currentConversation.messages
                .filter((m) => m.role === "user")
                .map(
                (message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isLatest={
                      index ===
                      conversation.currentConversation.messages.length - 1
                    }
                  />
                ),
              )}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Start a new conversation</p>
            <p className="text-xs text-muted-foreground">
              Select an example or describe the PDF you want to create
            </p>
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border p-3">
        {error && (
          <div className="mb-2 rounded bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
            {error}
          </div>
        )}
        <textarea
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            conversation.currentConversation
              ? "Continue the conversation..."
              : selection.mode === "scratch"
                ? "Describe the PDF you want..."
                : `Modify the ${currentExample?.label ?? "example"}...`
          }
          className="w-full bg-background text-sm resize-none outline-none placeholder:text-muted-foreground/50"
          rows={2}
          autoFocus
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-[11px] text-muted-foreground">
            {conversation.currentConversation?.title ||
              (selection.mode === "example" && currentExample
                ? currentExample.label
                : "scratch")}
          </span>
          {generating ? (
            <button
              onClick={handleStop}
              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              aria-label="Stop"
            >
              <Square className="h-3 w-3" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-30"
              aria-label="Generate"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // JSON Panel
  // ---------------------------------------------------------------------------
  const jsonPanel = (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-3 h-9 flex items-center gap-3">
        <span className="text-xs font-mono text-foreground">json</span>
        {generating && (
          <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
        )}
        <div className="flex-1" />
        {activeSpec && <CopyButton text={jsonCode} />}
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="p-3 text-xs leading-relaxed font-mono text-muted-foreground whitespace-pre">
          {jsonCode}
        </pre>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // PDF Panel with Version Selector
  // ---------------------------------------------------------------------------
  const pdfPanel = (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-3 h-9 flex items-center gap-3">
        <span className="text-xs font-mono text-foreground">pdf preview</span>
        {(generating || refreshing) && (
          <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
        )}
        <div className="flex-1" />

        {/* Version Selector */}
        {conversation.currentConversation &&
          conversation.currentConversation.pdfVersions.length > 0 && (
            <Select
              value={
                conversation.currentPdfVersionId ||
                conversation.currentConversation.pdfVersions[
                  conversation.currentConversation.pdfVersions.length - 1
                ]?.id
              }
              onValueChange={(value) =>
                conversation.setCurrentPdfVersion(value)
              }
            >
              <SelectTrigger className="w-40 h-6 text-xs">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {conversation.currentConversation.pdfVersions.map(
                  (version, index) => (
                    <SelectItem key={version.id} value={version.id}>
                      v{version.version} -{" "}
                      {new Date(version.timestamp).toLocaleDateString()}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}

        {activeSpec && (
          <button
            onClick={handleDownload}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            download
          </button>
        )}
      </div>
      <div className="flex-1 relative bg-neutral-600">
        {displayPdfUrl ? (
          <iframe
            key={displayPdfUrl}
            src={displayPdfUrl}
            className="h-full w-full border-none"
            title="PDF preview"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-400">
            <FileText className="h-10 w-10" />
            <p className="text-sm">
              {conversation.currentConversation
                ? "Generate a PDF to continue the conversation"
                : "Select an example or start a new conversation"}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="h-dvh flex flex-col">
      {/* Content Area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={40} minSize={25}>
            {chatPanel}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={60} minSize={40}>
            {/* <div className="border-b border-border px-3 h-9 flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant={currentView === "json" ? "default" : "ghost"}
                onClick={() => setCurrentView("json")}
                className="h-6 px-2"
              >
                JSON
              </Button>
              <Button
                size="sm"
                variant={currentView === "pdf" ? "default" : "ghost"}
                onClick={() => setCurrentView("pdf")}
                className="h-6 px-2"
              >
                PDF
              </Button>
              <div className="flex-1" />
            </div> */}
            {/* {currentView === "json" && jsonPanel} */}
            {currentView === "pdf" && pdfPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Examples Sheet */}
      <Sheet open={examplesSheetOpen} onOpenChange={setExamplesSheetOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">Examples</SheetTitle>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              <p className="px-2 pt-2 pb-1 text-[11px] font-mono text-muted-foreground">
                start
              </p>
              <button
                onClick={() => {
                  setSelection({ mode: "scratch" });
                  setExamplesSheetOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                  selection.mode === "scratch"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                From scratch
              </button>
              <p className="px-2 pt-3 pb-1 text-[11px] font-mono text-muted-foreground">
                examples
              </p>
              {examples.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => {
                    setSelection({ mode: "example", exampleName: ex.name });
                    setExamplesSheetOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                    selection.mode === "example" &&
                      selection.exampleName === ex.name
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <span className="font-medium">{ex.label}</span>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">
                    {ex.description}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">History</SheetTitle>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              <p className="px-2 pt-2 pb-1 text-[11px] font-mono text-muted-foreground">
                conversations
              </p>
              {conversation.conversations.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                  No conversations yet
                </p>
              ) : (
                conversation.conversations
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        conversation.setCurrentConversation(conv.id);
                        // Load latest PDF version
                        const latestVersion = conv.pdfVersions[conv.pdfVersions.length - 1];
                        if (latestVersion) {
                          fetchPdfBlob(latestVersion.spec).catch(() => {});
                        }
                        setHistoryOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                        conversation.currentConversationId === conv.id
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <span className="font-medium">{conv.title}</span>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {conv.pdfVersions.length} PDF{conv.pdfVersions.length !== 1 ? "s" : ""} •{" "}
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
