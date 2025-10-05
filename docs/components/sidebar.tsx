'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type SidebarItem = { href: string; label: string };
type SidebarSection = { title: string; items: SidebarItem[] };

export type SidebarProps = {
  sections: SidebarSection[];
  open: boolean;
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
      </nav>
    </aside>
  );
}

export type { SidebarSection };
