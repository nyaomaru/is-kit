"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, type SidebarSection } from "@/components/sidebar";
import {
  DOCS_TOGGLE_SIDEBAR_EVENT,
  type ToggleSidebarEvent,
} from "@/lib/events";
import { cn } from "@/lib/utils";

export type SidebarLayoutProps = {
  /** Controls whether the sidebar starts open when the layout mounts. */
  defaultSidebarOpen?: boolean;
  /** Navigation sections rendered inside the sidebar component. */
  sections: SidebarSection[];
  /** Main content rendered alongside the sidebar. */
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
  const [showDivider, setShowDivider] = useState(computedDefaultOpen);

  useEffect(() => {
    setOpen(computedDefaultOpen);
  }, [computedDefaultOpen]);

  useEffect(() => {
    const handler = (_toggleSidebarEvent: ToggleSidebarEvent) =>
      setOpen((toggleValue) => !toggleValue);
    window.addEventListener(DOCS_TOGGLE_SIDEBAR_EVENT, handler);
    return () => window.removeEventListener(DOCS_TOGGLE_SIDEBAR_EVENT, handler);
  }, []);

  useEffect(() => {
    setShowDivider(open);
  }, [open]);

  return (
    <div className="flex w-full overflow-hidden">
      <Sidebar sections={sections} open={open} className="bg-background" />
      <div
        className={cn(
          "relative flex-1 min-w-0 overflow-x-hidden md:pl-6 md:before:pointer-events-none md:before:absolute md:before:inset-y-0 md:before:left-0 md:before:w-px md:before:bg-border md:before:opacity-0 md:before:transition-opacity md:before:duration-300 md:before:content-['']",
          showDivider && "md:before:opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  );
}
