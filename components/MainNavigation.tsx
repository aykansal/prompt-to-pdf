"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  to: string;
  icon: string;
  label: string;
  current: string;
}

function NavLink({ to, icon, label, current }: NavLinkProps) {
  const isActive = current === to;
  return (
    <Link
      href={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-primary/60 hover:text-primary hover:bg-primary/5"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}

export function MainNavigation() {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur border border-stone-200 rounded-full shadow-float px-2 py-1.5 flex gap-1">
      <NavLink to="/library" icon="library_books" label="Library" current={pathname} />
      <NavLink to="/templates" icon="note_add" label="New" current={pathname} />
      <NavLink to="/workspace" icon="edit_note" label="Editor" current={pathname} />
      <NavLink to="/export" icon="ios_share" label="Export" current={pathname} />
    </div>
  );
}
