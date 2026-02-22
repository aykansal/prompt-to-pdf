"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@/hooks/use-conversation";
import { MainNavigation } from "@/components/MainNavigation";

type FormatType = "pdf" | "docx" | "md";
type TypesettingType = "newsreader" | "helvetica" | "courier";

export default function ExportPage() {
  const router = useRouter();
  const conversation = useConversation();
  const [format, setFormat] = useState<FormatType>("pdf");
  const [typesetting, setTypesetting] = useState<TypesettingType>("newsreader");
  const [marginValue, setMarginValue] = useState(50);

  const getMarginLabel = () => {
    if (marginValue < 30) return "Tight (0.5\")";
    if (marginValue < 70) return "Standard (1.0\")";
    return "Wide (1.5\")";
  };

  const handleMintDocument = async () => {
    if (!conversation.currentPdfVersion?.spec) {
      alert("No document to export!");
      return;
    }

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spec: conversation.currentPdfVersion.spec,
          download: true,
          filename: `document-${Date.now()}.${format}`,
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      alert("Document exported successfully!");
      router.push("/library");
    } catch (error) {
      alert("Failed to export document");
    }
  };

  return (
    <div className="bg-vellum dark:bg-background-dark text-primary min-h-screen font-display antialiased flex flex-col relative pb-24">
      {/* Background Workspace Simulation (Blurred) */}
      <div className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 grayscale-[20%] bg-grain"></div>

      {/* Backdrop Blur Overlay */}
      <div className="fixed inset-0 z-10 bg-white/30 dark:bg-black/30 backdrop-blur-[4px] flex items-center justify-center p-4">
        {/* Modal Container */}
        <div className="relative w-full max-w-[800px] bg-paper shadow-2xl rounded-lg overflow-hidden flex flex-col md:flex-row border border-[#e8e6e1]">
          {/* Close Button */}
          <button
            onClick={() => router.push("/workspace")}
            className="absolute top-4 right-4 text-primary/40 hover:text-primary transition-colors z-20"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Left Column: Preview */}
          <div className="w-full md:w-[40%] bg-paper-dim p-8 flex items-center justify-center border-r border-[#e8e6e1]/50">
            <div className="relative w-full max-w-[200px] aspect-[1/1.4] bg-white shadow-lg rotate-1 transform transition-transform hover:rotate-0 duration-500 ease-out rounded-sm overflow-hidden group cursor-pointer">
              {/* Document Preview Image */}
              <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 p-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-800 w-3/4"></div>
                  <div className="h-2 bg-gray-400 w-1/2"></div>
                  <div className="h-1 bg-gray-300 w-full mt-4"></div>
                  <div className="h-1 bg-gray-300 w-full"></div>
                  <div className="h-1 bg-gray-300 w-5/6"></div>
                </div>
              </div>
              {/* Hover Effect: View Icon */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 bg-white/80 p-2 rounded-full shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  visibility
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Form */}
          <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col">
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-display italic font-medium text-primary tracking-tight">
                Finalize Artifact
              </h2>
              <p className="text-primary/60 text-sm font-sans mt-1">
                Configure your document for export.
              </p>
            </div>

            {/* Form Controls */}
            <div className="space-y-6 grow">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-primary mb-3 font-sans uppercase tracking-wider text-[11px] text-primary/50">
                  Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="relative cursor-pointer group">
                    <input
                      checked={format === "pdf"}
                      onChange={() => setFormat("pdf")}
                      className="peer sr-only"
                      name="format"
                      type="radio"
                      value="pdf"
                    />
                    <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#dcdbda] bg-white text-primary transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/40 h-20">
                      <span className="material-symbols-outlined text-2xl mb-1 text-primary/70 peer-checked:text-primary">
                        picture_as_pdf
                      </span>
                      <span className="text-xs font-medium">PDF</span>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </label>

                  <label className="relative cursor-pointer group">
                    <input
                      checked={format === "docx"}
                      onChange={() => setFormat("docx")}
                      className="peer sr-only"
                      name="format"
                      type="radio"
                      value="docx"
                    />
                    <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#dcdbda] bg-white text-primary transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/40 h-20">
                      <span className="material-symbols-outlined text-2xl mb-1 text-primary/70 peer-checked:text-primary">
                        description
                      </span>
                      <span className="text-xs font-medium">DOCX</span>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </label>

                  <label className="relative cursor-pointer group">
                    <input
                      checked={format === "md"}
                      onChange={() => setFormat("md")}
                      className="peer sr-only"
                      name="format"
                      type="radio"
                      value="md"
                    />
                    <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#dcdbda] bg-white text-primary transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/40 h-20">
                      <span className="material-symbols-outlined text-2xl mb-1 text-primary/70 peer-checked:text-primary">
                        markdown
                      </span>
                      <span className="text-xs font-medium">MD</span>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Typesetting Dropdown */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2 font-sans uppercase tracking-wider text-[11px] text-primary/50">
                  Typesetting
                </label>
                <div className="relative">
                  <select
                    value={typesetting}
                    onChange={(e) => setTypesetting(e.target.value as TypesettingType)}
                    className="block w-full rounded-lg border-[#dcdbda] bg-white py-3 pl-4 pr-10 text-primary focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer text-base font-display"
                  >
                    <option value="newsreader">Modern Serif (Newsreader)</option>
                    <option value="helvetica">Classic Sans (Helvetica)</option>
                    <option value="courier">Typewriter (Courier)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary/60">
                    <span className="material-symbols-outlined text-xl">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Margin Slider */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-primary font-sans uppercase tracking-wider text-[11px] text-primary/50">
                    Margins
                  </label>
                  <span className="text-xs text-primary font-display italic">{getMarginLabel()}</span>
                </div>
                <div className="relative h-6 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={marginValue}
                    onChange={(e) => setMarginValue(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0 range-primary"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-primary/40 font-sans mt-1 px-1">
                  <span>Tight</span>
                  <span>Wide</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 flex items-center justify-end gap-6 pt-4 border-t border-[#dcdbda]/30">
              <button
                onClick={() => router.push("/workspace")}
                className="text-sm font-medium text-primary/60 hover:text-primary transition-colors font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleMintDocument}
                className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg text-sm font-medium shadow-md shadow-primary/10 transition-all transform active:scale-[0.98] flex items-center gap-2 font-sans tracking-wide"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Mint Document
              </button>
            </div>
          </div>
        </div>
      </div>

      <MainNavigation />
    </div>
  );
}
