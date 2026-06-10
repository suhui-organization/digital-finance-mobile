"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

const NO_NAV_PAGES = ["/login"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = NO_NAV_PAGES.includes(pathname);

  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}