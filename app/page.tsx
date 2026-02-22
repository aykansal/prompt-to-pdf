"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-vellum dark:bg-background-dark text-primary dark:text-slate-100 selection:bg-primary/10 transition-colors duration-300 overflow-x-hidden">
      {/* Grain Overlay */}
      <div className="bg-grain" />

      {/* Navigation */}
      <nav className="relative z-40 w-full px-6 py-8 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <span className="material-symbols-outlined text-primary dark:text-slate-100 text-3xl">
            edit_note
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Document Atelier
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          <a className="text-sm font-medium hover:opacity-60 transition-opacity" href="#features">
            Features
          </a>
          <a className="text-sm font-medium hover:opacity-60 transition-opacity" href="#philosophy">
            Philosophy
          </a>
          <Link
            href="/library"
            className="bg-primary dark:bg-slate-100 text-vellum dark:text-background-dark px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm"
          >
            Start Drafting
          </Link>
        </div>
        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <span className="material-symbols-outlined text-primary">menu</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] text-primary dark:text-slate-100">
            Transform Conversation into <br className="hidden md:block" />{" "}
            Impeccable Artifacts.
          </h1>
          <p className="text-lg md:text-xl font-light text-ink-light dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The AI-powered document atelier for the modern archivist.{" "}
            <br className="hidden sm:block" />
            Crafting digital clarity with the warmth of physical paper.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/library"
              className="w-full sm:w-auto bg-primary dark:bg-slate-100 text-vellum dark:text-background-dark px-10 py-4 rounded-xl text-base font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
            >
              Start Drafting
            </Link>
            <Link
              href="/templates"
              className="w-full sm:w-auto bg-transparent border border-primary/20 dark:border-slate-100/20 text-primary dark:text-slate-100 px-10 py-4 rounded-xl text-base font-semibold hover:bg-primary/5 transition-all"
            >
              View Templates
            </Link>
          </div>
        </div>

        {/* Hero Workspace Preview */}
        <div className="mt-24 w-full max-w-6xl mx-auto px-4 md:px-0">
          <div className="relative group bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-primary/5 dark:border-white/5">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-primary/5 dark:border-white/5">
              <div className="size-2.5 rounded-full bg-red-400/20 border border-red-400/40"></div>
              <div className="size-2.5 rounded-full bg-amber-400/20 border border-amber-400/40"></div>
              <div className="size-2.5 rounded-full bg-emerald-400/20 border border-emerald-400/40"></div>
              <div className="ml-4 text-[10px] text-accent font-medium uppercase tracking-widest">
                Document Atelier — Untitled Artifact
              </div>
            </div>
            <div className="aspect-16/10 w-full bg-white dark:bg-background-dark flex">
              {/* Left: Editor Canvas */}
              <div className="flex-1 p-12 md:p-20 border-r border-primary/5 dark:border-white/5">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="h-8 w-2/3 bg-primary/5 dark:bg-white/5 rounded"></div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-primary/5 dark:bg-white/5 rounded"></div>
                    <div className="h-3 w-full bg-primary/5 dark:bg-white/5 rounded"></div>
                    <div className="h-3 w-4/5 bg-primary/5 dark:bg-white/5 rounded"></div>
                  </div>
                  <div className="h-32 w-full bg-primary/5 dark:bg-white/5 rounded-lg border border-dashed border-primary/10"></div>
                </div>
              </div>
              {/* Right: AI Sidebar */}
              <div className="hidden md:block w-72 lg:w-80 bg-neutral-50 dark:bg-neutral-900/50 p-6 space-y-6">
                <div className="flex items-center gap-2 mb-8">
                  <span className="material-symbols-outlined text-primary/60 text-sm">
                    auto_awesome
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                    Atelier Assistant
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-primary dark:bg-slate-100 rounded-lg shadow-sm">
                    <div className="h-2 w-full bg-vellum dark:bg-background-dark opacity-40 rounded mb-2"></div>
                    <div className="h-2 w-2/3 bg-vellum dark:bg-background-dark opacity-40 rounded"></div>
                  </div>
                  <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-primary/5">
                    <div className="h-2 w-full bg-primary/10 rounded mb-2"></div>
                    <div className="h-2 w-1/2 bg-primary/10 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute inset-0 pointer-events-none border border-primary/5 rounded-xl"></div>
          </div>
        </div>
      </main>

      {/* Trusted By */}
      <section className="py-12 border-y border-primary/5 dark:border-white/5">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-8">
            Trusted by industry-leading institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <span className="font-display text-xl md:text-2xl font-bold">Venice Legal</span>
            <span className="font-display text-xl md:text-2xl font-bold">Aurelius Research</span>
            <span className="font-display text-xl md:text-2xl font-bold">Heritage Press</span>
            <span className="font-display text-xl md:text-2xl font-bold">Ivy Consulting</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16 md:gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col gap-6 group">
              <div className="size-12 rounded-xl bg-primary/5 dark:bg-white/5 flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-vellum">
                <span className="material-symbols-outlined text-2xl">grid_guides</span>
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-semibold">Tactile Precision</h3>
                <p className="text-ink-light dark:text-slate-400 leading-relaxed font-light">
                  Total control over layout and refined typography. Every document feels weighted,
                  purposeful, and intentional.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col gap-6 group">
              <div className="size-12 rounded-xl bg-primary/5 dark:bg-white/5 flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-vellum">
                <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-semibold">AI Collaboration</h3>
                <p className="text-ink-light dark:text-slate-400 leading-relaxed font-light">
                  An intelligent sidebar that understands context. It refines your thoughts into
                  structured, professional prose.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col gap-6 group">
              <div className="size-12 rounded-xl bg-primary/5 dark:bg-white/5 flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-vellum">
                <span className="material-symbols-outlined text-2xl">print</span>
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-semibold">Print-Ready Output</h3>
                <p className="text-ink-light dark:text-slate-400 leading-relaxed font-light">
                  High-fidelity exports for professional printing. From PDF to LaTeX, your work is
                  always ready for the physical world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Philosophy / Quote */}
      <section id="philosophy" className="py-24 md:py-40">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <span className="material-symbols-outlined text-4xl text-primary/20">format_quote</span>
          <blockquote className="font-display text-3xl md:text-5xl italic leading-tight text-primary/80 dark:text-slate-200">
            "We don't just build software. We build an atelier for the intellect — where the speed
            of thought meets the dignity of the printed page."
          </blockquote>
          <cite className="block text-sm uppercase tracking-widest font-bold text-accent not-italic">
            — The Minimalist Manifesto
          </cite>
        </div>
      </section>

      {/* Call to Action */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto bg-primary dark:bg-neutral-800 rounded-3xl p-12 md:p-24 text-center text-vellum relative overflow-hidden group">
          {/* Subtle background detail */}
          <div className="absolute -right-20 -bottom-20 size-80 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="font-display text-4xl md:text-6xl tracking-tight">
              Begin your first draft.
            </h2>
            <p className="text-lg opacity-70 max-w-xl mx-auto font-light">
              Experience the digital atelier that blends precision and soul. Join thousands of
              high-level archivists today.
            </p>
            <div className="pt-4">
              <Link
                href="/library"
                className="inline-block bg-vellum dark:bg-background-dark text-primary dark:text-slate-100 px-12 py-5 rounded-xl text-lg font-bold hover:scale-[1.05] transition-all shadow-xl"
              >
                Get Early Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/5 dark:border-white/5 py-16 px-6 md:px-12 bg-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">edit_note</span>
              <span className="font-display text-lg font-bold">Document Atelier</span>
            </div>
            <p className="text-xs text-accent uppercase tracking-widest font-medium">
              © 2024 Document Atelier Inc.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20">
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary/40">
                Studio
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <a className="hover:text-accent transition-colors" href="#">
                    Manifesto
                  </a>
                </li>
                <li>
                  <a className="hover:text-accent transition-colors" href="#">
                    Log
                  </a>
                </li>
                <li>
                  <a className="hover:text-accent transition-colors" href="#">
                    Career
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary/40">
                Product
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <Link className="hover:text-accent transition-colors" href="/workspace">
                    Workspace
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-accent transition-colors" href="/templates">
                    Templates
                  </Link>
                </li>
                <li>
                  <a className="hover:text-accent transition-colors" href="#">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary/40">
                Social
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <a className="hover:text-accent transition-colors" href="#">
                    Twitter
                  </a>
                </li>
                <li>
                  <a className="hover:text-accent transition-colors" href="#">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a className="hover:text-accent transition-colors" href="#">
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
