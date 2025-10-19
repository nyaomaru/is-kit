'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, type SidebarSection } from '@/components/navigation/sidebar';
import {
  DOCS_TOGGLE_SIDEBAR_EVENT,
  type ToggleSidebarEvent,
} from '@/lib/events';
import { cn } from '@/lib/utils';

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
    defaultSidebarOpen ?? pathname?.startsWith('/api-reference') === true;

  const isMobileViewport = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 767px)').matches;

  const [open, setOpen] = useState(() =>
    isMobileViewport() ? false : computedDefaultOpen
  );
  useEffect(() => {
    if (isMobileViewport()) {
      setOpen(false);
      return;
    }

    setOpen(computedDefaultOpen);
  }, [computedDefaultOpen]);

  useEffect(() => {
    if (!isMobileViewport()) return;
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (_toggleSidebarEvent: ToggleSidebarEvent) =>
      setOpen((toggleValue) => !toggleValue);
    window.addEventListener(DOCS_TOGGLE_SIDEBAR_EVENT, handler);
    return () => window.removeEventListener(DOCS_TOGGLE_SIDEBAR_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!isMobileViewport() || !open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className='relative flex w-full overflow-x-hidden'>
      <Sidebar sections={sections} open={open} className='bg-background' />
      {open ? (
        <div
          role='presentation'
          className='fixed inset-x-0 top-14 bottom-0 z-30 bg-background/70 backdrop-blur-sm md:hidden'
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div
        className={cn(
          "relative flex-1 min-w-0 overflow-x-hidden md:before:pointer-events-none md:before:absolute md:before:inset-y-0 md:before:left-0 md:before:w-px md:before:bg-border md:before:opacity-0 md:before:transition-opacity md:before:duration-300 md:before:content-['']",
          open && 'md:ml-40'
        )}
      >
        {children}
      </div>
    </div>
  );
}
