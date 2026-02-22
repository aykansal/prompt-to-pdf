"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainNavigation } from "@/components/MainNavigation";

type TemplateType = "executive" | "legal" | "screenplay" | "blank";

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("executive");

  const handleCreate = () => {
    router.push("/workspace");
  };

  return (
    <div className="bg-vellum text-primary min-h-screen flex flex-col overflow-hidden font-sans pb-24">
      <nav className="w-full px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 text-primary">
          <span className="material-symbols-outlined text-3xl font-light">history_edu</span>
          <h1 className="font-display font-medium text-xl tracking-tight">Document Atelier</h1>
        </div>
        <Link href="/library" className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
          <span className="material-symbols-outlined">close</span>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center relative w-full h-full p-4 sm:p-8">
        <div className="w-full max-w-7xl mb-10 md:mb-16 flex flex-col items-start md:items-center text-left md:text-center space-y-3 z-10">
          <div className="flex items-center gap-2 text-primary/60 uppercase tracking-widest text-xs font-bold">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            New Draft
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-primary leading-tight">
            Select your stationery.
          </h2>
          <p className="font-sans text-primary/60 text-lg md:text-xl font-light max-w-xl">
            Choose a structure for your new draft. Each template is crafted for a specific thinking mode.
          </p>
        </div>

        <div className="w-full max-w-7xl overflow-x-auto no-scrollbar pb-12 px-4 md:px-0 flex justify-start md:justify-center gap-6 md:gap-8 snap-x snap-mandatory">
          {/* Executive Brief Template */}
          <label className="group relative flex-shrink-0 cursor-pointer snap-center rounded-xl">
            <input
              checked={selectedTemplate === "executive"}
              onChange={() => setSelectedTemplate("executive")}
              className="peer sr-only"
              name="stationery"
              type="radio"
              value="executive"
            />
            <div className="w-[280px] md:w-[320px] h-[400px] md:h-[460px] bg-paper rounded-xl shadow-paper group-hover:shadow-paper-hover transition-all duration-500 ease-out transform group-hover:-translate-y-2 border border-transparent peer-checked:border-primary/20 peer-checked:ring-1 peer-checked:ring-primary/20 overflow-hidden flex flex-col relative">
              <div className="flex-1 p-8 flex flex-col gap-4 bg-white relative">
                <div className="w-3/4 h-6 bg-primary/90 mb-2"></div>
                <div className="w-1/2 h-4 bg-primary/40 mb-6"></div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-gray-200"></div>
                  <div className="w-full h-2 bg-gray-200"></div>
                  <div className="w-5/6 h-2 bg-gray-200"></div>
                </div>
              </div>
              <div className="h-24 bg-gray-50 border-t border-gray-100 p-5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-display text-lg font-medium text-primary">Executive Brief</h3>
                  <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                </div>
                <p className="font-sans text-xs text-primary/60 leading-relaxed">High-impact summaries. Bold hierarchy.</p>
              </div>
            </div>
          </label>

          {/* Legal Memo Template */}
          <label className="group relative flex-shrink-0 cursor-pointer snap-center rounded-xl">
            <input
              checked={selectedTemplate === "legal"}
              onChange={() => setSelectedTemplate("legal")}
              className="peer sr-only"
              name="stationery"
              type="radio"
              value="legal"
            />
            <div className="w-[280px] md:w-[320px] h-[400px] md:h-[460px] bg-paper rounded-xl shadow-paper group-hover:shadow-paper-hover transition-all duration-500 ease-out transform group-hover:-translate-y-2 border border-transparent peer-checked:border-primary/20 peer-checked:ring-1 peer-checked:ring-primary/20 overflow-hidden flex flex-col">
              <div className="flex-1 p-8 bg-white relative font-display">
                <div className="absolute left-6 top-8 bottom-8 w-6 flex flex-col gap-[14px] text-[8px] text-gray-300 font-mono text-right pr-2 border-r border-gray-100 pt-1">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
                <div className="pl-8 pt-1">
                  <div className="w-full text-[10px] leading-[14px] text-gray-800 text-justify font-serif opacity-70">
                    <p className="mb-3">MEMORANDUM OF LAW</p>
                    <div className="space-y-[6px]">
                      <div className="h-1.5 bg-current w-full rounded-sm opacity-60"></div>
                      <div className="h-1.5 bg-current w-full rounded-sm opacity-60"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-24 bg-gray-50 border-t border-gray-100 p-5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-display text-lg font-medium text-primary">Legal Memo</h3>
                  <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                </div>
                <p className="font-sans text-xs text-primary/60 leading-relaxed">Numbered lines, dense serif body.</p>
              </div>
            </div>
          </label>

          {/* Screenplay Template */}
          <label className="group relative flex-shrink-0 cursor-pointer snap-center rounded-xl">
            <input
              checked={selectedTemplate === "screenplay"}
              onChange={() => setSelectedTemplate("screenplay")}
              className="peer sr-only"
              name="stationery"
              type="radio"
              value="screenplay"
            />
            <div className="w-[280px] md:w-[320px] h-[400px] md:h-[460px] bg-paper rounded-xl shadow-paper group-hover:shadow-paper-hover transition-all duration-500 ease-out transform group-hover:-translate-y-2 border border-transparent peer-checked:border-primary/20 peer-checked:ring-1 peer-checked:ring-primary/20 overflow-hidden flex flex-col">
              <div className="flex-1 p-8 bg-white relative font-mono text-[10px]">
                <div className="space-y-4 opacity-70">
                  <div className="uppercase text-gray-800">INT. OFFICE - DAY</div>
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-gray-800 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div className="h-24 bg-gray-50 border-t border-gray-100 p-5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-display text-lg font-medium text-primary">Screenplay</h3>
                  <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                </div>
                <p className="font-sans text-xs text-primary/60 leading-relaxed">Industry standard format. Courier font.</p>
              </div>
            </div>
          </label>

          {/* Blank Template */}
          <label className="group relative flex-shrink-0 cursor-pointer snap-center rounded-xl">
            <input
              checked={selectedTemplate === "blank"}
              onChange={() => setSelectedTemplate("blank")}
              className="peer sr-only"
              name="stationery"
              type="radio"
              value="blank"
            />
            <div className="w-[280px] md:w-[320px] h-[400px] md:h-[460px] bg-paper rounded-xl shadow-paper group-hover:shadow-paper-hover transition-all duration-500 ease-out transform group-hover:-translate-y-2 border border-transparent peer-checked:border-primary/20 peer-checked:ring-1 peer-checked:ring-primary/20 overflow-hidden flex flex-col">
              <div className="flex-1 bg-[#faf9f6] relative overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary/10">note_add</span>
              </div>
              <div className="h-24 bg-gray-50 border-t border-gray-100 p-5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-display text-lg font-medium text-primary">Blank Slate</h3>
                  <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check_circle</span>
                </div>
                <p className="font-sans text-xs text-primary/60 leading-relaxed">Unstructured canvas.</p>
              </div>
            </div>
          </label>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-vellum/90 backdrop-blur-sm border-t border-primary/5 py-6 px-8 flex justify-between items-center z-20 md:static md:bg-transparent md:border-none md:justify-center md:gap-4 md:mt-8">
          <button
            onClick={() => router.push("/library")}
            className="md:hidden text-primary font-medium text-sm px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Cancel
          </button>
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => router.push("/library")}
              className="text-primary font-bold text-base px-8 py-3 rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-2"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="bg-primary text-white font-bold text-base px-10 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              <span>Create Document</span>
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="md:hidden bg-primary text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg"
          >
            Create
          </button>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-0 bg-grain"></div>
      <MainNavigation />
    </div>
  );
}
