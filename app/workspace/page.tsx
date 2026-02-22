"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConversation } from "@/hooks/use-conversation";
import { MainNavigation } from "@/components/MainNavigation";
import { createSpecStreamCompiler } from "@json-render/core";
import type { Spec } from "@json-render/core";

const PDF_REFRESH_INTERVAL_MS = 2000;

function isRenderableSpec(spec: Spec | null): spec is Spec {
  if (!spec?.root || !spec.elements) return false;
  const root = spec.elements[spec.root];
  if (!root) return false;
  if (root.type !== "Document" || !root.children?.length) return false;
  const firstChild = spec.elements[root.children[0]!];
  return firstChild?.type === "Page";
}

export default function WorkspacePage() {
  const router = useRouter();
  const conversation = useConversation();
  
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<Spec | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "citations">("chat");

  const pdfUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeSpec = conversation.currentPdfVersion?.spec || generatedSpec || null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const spec = conversation.currentPdfVersion?.spec;
    if (spec && isRenderableSpec(spec)) {
      fetchPdfBlob(spec).catch(() => {});
    } else {
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
      const startingSpec = conversation.currentPdfVersion?.spec || null;

      let conversationId = conversation.currentConversationId;
      if (!conversationId) {
        const title = prompt.trim().slice(0, 50) + (prompt.length > 50 ? "..." : "");
        const newConv = conversation.createConversation(title);
        conversationId = newConv.id;
      }

      conversation.addMessage(conversationId, "user", prompt.trim());

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), startingSpec, conversationId }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Generation failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      const compiler = createSpecStreamCompiler<Spec>(startingSpec ? { ...startingSpec } : {});

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

      conversation.addMessage(conversationId, "assistant", assistantText, finalSpec);
      conversation.addPdfVersion(conversationId, finalSpec, assistantText);

      await fetchPdfBlob(finalSpec);
      setPrompt("");
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Something went wrong");
      setGenerating(false);
    }
  }, [prompt, conversation, fetchPdfBlob]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setGenerating(false);
    if (isRenderableSpec(generatedSpec)) {
      fetchPdfBlob(generatedSpec).catch(() => {});
    }
  }, [generatedSpec, fetchPdfBlob]);

  return (
    <div className="bg-vellum text-primary h-screen flex flex-col overflow-hidden relative pb-20">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-[#e5e4e2] bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <Link href="/library" className="flex items-center justify-center size-8 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">Document Atelier</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 hidden md:flex">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-grey rounded-lg">
            <span className="text-sm font-medium text-gray-500 font-display">
              {conversation.currentConversation?.title || "New Document"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-warm-grey hover:bg-[#e8e6e1] text-primary rounded-lg transition-colors text-sm font-bold">
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span className="hidden sm:inline">Share</span>
          </button>
          <button onClick={() => router.push("/export")} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#1a1918] text-white rounded-lg transition-colors text-sm font-bold shadow-md">
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Document Canvas */}
        <main className="w-full lg:w-[65%] relative bg-dutch-white flex flex-col overflow-hidden group/canvas">
          {/* Toolbar Overlay */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur border border-stone-200 rounded-full shadow-float px-2 py-1.5 transition-opacity opacity-0 group-hover/canvas:opacity-100">
            <button aria-label="Zoom Out" className="p-2 hover:bg-stone-100 rounded-full text-stone-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <span className="text-sm font-medium w-12 text-center text-stone-700">100%</span>
            <button aria-label="Zoom In" className="p-2 hover:bg-stone-100 rounded-full text-stone-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
            <div className="w-px h-4 bg-stone-300 mx-1"></div>
            <button aria-label="Fit Width" className="p-2 hover:bg-stone-100 rounded-full text-stone-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">fit_screen</span>
            </button>
          </div>

          {/* PDF Preview */}
          <div className="flex-1 relative bg-neutral-600">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="h-full w-full border-none" title="PDF preview" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-400">
                <span className="material-symbols-outlined text-6xl">description</span>
                <p className="text-sm">Generate a document to preview</p>
              </div>
            )}
          </div>

          {/* Bottom Floating Action */}
          <div className="absolute bottom-8 right-8 z-10">
            <button className="h-14 w-14 bg-primary text-white rounded-full shadow-float flex items-center justify-center hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px]">edit_note</span>
            </button>
          </div>
        </main>

        {/* Right Panel: Atelier Sidebar */}
        <aside className="hidden lg:flex w-[35%] bg-warm-grey border-l border-[#e5e4e2] flex-col">
          {/* Sidebar Tabs */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-8 border-b border-[#dcdbda]">
              <button
                onClick={() => setActiveTab("chat")}
                className={`relative pb-3 font-bold text-sm tracking-wide transition-colors group ${
                  activeTab === "chat" ? "text-primary" : "text-stone-500 hover:text-primary"
                }`}
              >
                Chat
                {activeTab === "chat" && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></span>}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`relative pb-3 font-bold text-sm tracking-wide transition-colors group ${
                  activeTab === "history" ? "text-primary" : "text-stone-500 hover:text-primary"
                }`}
              >
                History
                {activeTab === "history" && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></span>}
              </button>
              <button
                onClick={() => setActiveTab("citations")}
                className={`relative pb-3 font-bold text-sm tracking-wide transition-colors group ${
                  activeTab === "citations" ? "text-primary" : "text-stone-500 hover:text-primary"
                }`}
              >
                Citations
                {activeTab === "citations" && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></span>}
              </button>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
            {conversation.currentConversation?.messages.map((message, idx) => (
              <div key={idx} className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  message.role === "assistant"
                    ? "bg-white border border-stone-200 text-accent"
                    : "bg-stone-300"
                }`}>
                  {message.role === "assistant" ? (
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  )}
                </div>
                <div className={`flex flex-col gap-2 max-w-[90%] ${message.role === "user" ? "items-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Archivist</div>
                  )}
                  <div className={`font-sans text-[15px] leading-relaxed text-stone-800 p-4 rounded-2xl shadow-sm border ${
                    message.role === "assistant"
                      ? "bg-white border-stone-100 rounded-tl-none"
                      : "bg-[#e3e1dd] rounded-tr-none border-transparent"
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {generating && (
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-sm text-accent">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Archivist</div>
                  <div className="font-sans text-[15px] leading-relaxed text-stone-800 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">Generating...</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</div>
            )}
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 right-0 w-full p-6 pt-2 bg-warm-grey border-t border-[#e5e4e2] z-20">
            <div className="relative bg-white rounded-xl shadow-sm border border-stone-200 transition-shadow hover:shadow-md focus-within:shadow-md focus-within:border-stone-300 group/input">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                className="w-full bg-transparent border-0 rounded-xl p-4 pr-12 text-primary placeholder-stone-400 focus:ring-0 resize-none font-sans text-[15px] min-h-[60px]"
                placeholder="Instruct the archivist..."
                rows={2}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <button className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>
                {generating ? (
                  <button onClick={handleStop} className="p-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">stop</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors shadow-sm flex items-center justify-center group-focus-within/input:bg-accent disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-4 text-xs text-stone-400 font-medium">
              <span className="cursor-pointer hover:text-stone-600 transition-colors">Draft clause</span>
              <span className="cursor-pointer hover:text-stone-600 transition-colors">Summarize</span>
              <span className="cursor-pointer hover:text-stone-600 transition-colors">Find precedent</span>
            </div>
          </div>
        </aside>
      </div>

      <MainNavigation />
    </div>
  );
}
