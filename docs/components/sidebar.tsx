'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SiteNav } from '@/components/site-nav';

type SidebarItem = {
  /** Destination path for the sidebar entry. */
  href: string;
  /** Text shown for the navigation link. */
  label: string;
};
type SidebarSection = {
  /** Heading displayed above the grouped links. */
  title: string;
  /** Links included within the section. */
  items: SidebarItem[];
};

export type SidebarProps = {
  /** Navigation groups rendered in the sidebar. */
  sections: SidebarSection[];
  /** Whether the sidebar content is visible. */
  open: boolean;
  /** Additional classes merged onto the aside element. */
  className?: string;
};

export function Sidebar({ sections, open, className }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        'sticky top-14 mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto shrink-0 transition-[width,opacity] duration-200 pr-3 bg-background',
        open ? 'w-60 opacity-100' : 'w-0 opacity-0 pointer-events-none',
        className
      )}
      aria-hidden={!open}
    >
      <nav
        className={cn('pt-4', open ? 'block' : 'hidden')}
        aria-label='Sidebar navigation'
      >
        {sections.map((section) => (
          <div key={section.title} className='mb-4'>
            <div className='px-3 mb-2 text-xs font-bold uppercase text-foreground'>
              {section.title}
            </div>
            <ul className='space-y-1 text-sm'>
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group block px-3 py-1 rounded pl-4',
                        active
                          ? 'bg-primary/20 border-l-2 border-primary pl-3 font-medium text-primary'
                          : 'text-primary/80'
                      )}
                    >
                      <span className='link-underline'>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <SiteNav
          className='sm:hidden flex-col items-start gap-4 text-sm text-muted-foreground ml-2'
          showSeparators={false}
        />
      </nav>
    </aside>
  );
}

export type { SidebarSection };
