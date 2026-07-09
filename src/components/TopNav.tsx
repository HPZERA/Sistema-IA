"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Prompt Studio" },
  { href: "/enquadramento-anonimo", label: "🕶️ Enquadramento Anônimo" },
] as const;

// Top-level tab bar, mounted once in the root layout so it's always visible above every page —
// this is the only place users switch between the main Prompt Studio and the fully independent
// Enquadramento Anônimo page (src/components/AnonymousFramingStudio.tsx). Never nest the
// Enquadramento Anônimo module back inside the Prompt Studio page itself.
export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10 bg-neutral-950/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl gap-1 px-4 lg:px-8">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`-mb-px rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-white/10 bg-neutral-900 text-neutral-50"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
