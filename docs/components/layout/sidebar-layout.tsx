"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, type SidebarSection } from "@/components/sidebar";
import {
  DOCS_TOGGLE_SIDEBAR_EVENT,
  type ToggleSidebarEvent,
} from "@/lib/events";

export type SidebarLayoutProps = {
  defaultSidebarOpen?: boolean;
  sections: SidebarSection[];
  children: React.ReactNode;
};

export function SidebarLayout({
  defaultSidebarOpen,
  sections,
  children,
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const computedDefaultOpen =
    defaultSidebarOpen ?? pathname?.startsWith("/api-reference") === true;
  const [open, setOpen] = useState(computedDefaultOpen);

  useEffect(() => {
    setOpen(computedDefaultOpen);
  }, [computedDefaultOpen]);

  useEffect(() => {
    const handler = (_toggleSidebarEvent: ToggleSidebarEvent) =>
      setOpen((toggleValue) => !toggleValue);
    window.addEventListener(DOCS_TOGGLE_SIDEBAR_EVENT, handler);
    return () => window.removeEventListener(DOCS_TOGGLE_SIDEBAR_EVENT, handler);
  }, []);

  return (
    <div className="flex">
      <Sidebar sections={sections} open={open} className="bg-background" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
