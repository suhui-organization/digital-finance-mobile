"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/reports", label: "已填报", icon: "📋" },
  { href: "/profile", label: "我的", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-14 max-w-[420px] mx-auto">
        {tabs.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                active ? "text-[#1e3a5f]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[11px] leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}