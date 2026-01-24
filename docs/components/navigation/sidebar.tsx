'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SiteNav } from '@/components/navigation/site-nav';

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
        'fixed inset-x-0 top-14 bottom-0 z-40 h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 transition-transform duration-200 ease-out md:left-0 md:right-auto md:w-40 md:border-r md:border-border md:p-0 md:pr-4 md:transition-[transform,opacity] md:duration-200 md:ease-in-out',
        open
          ? 'translate-x-0 opacity-100 pointer-events-auto w-full md:translate-x-0'
          : '-translate-x-full opacity-0 pointer-events-none w-full md:-translate-x-full',
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
          orientation='vertical'
          showSeparators={false}
          className='sm:hidden ml-2 mt-6'
        />
      </nav>
    </aside>
  );
}

export type { SidebarSection };
