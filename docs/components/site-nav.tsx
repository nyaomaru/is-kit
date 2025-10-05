import Link from 'next/link';

import { cn } from '@/lib/utils';

type SiteNavProps = {
  /** Optional extra classes applied to the nav container. */
  className?: string;
  /** Whether to show separators between links. Defaults to true. */
  showSeparators?: boolean;
  /** Layout direction for the nav links. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
};

export function SiteNav({
  className,
  showSeparators = true,
  orientation = 'horizontal',
}: SiteNavProps) {
  const baseClasses =
    orientation === 'horizontal'
      ? 'flex items-center gap-4 text-sm text-muted-foreground'
      : 'flex flex-col items-start gap-3 text-sm text-muted-foreground';
  return (
    <nav
      className={cn(baseClasses, className)}
    >
      <Link href='/' className='group'>
        <span className='link-underline'>Home</span>
      </Link>
      <a href='/api-reference' className='group'>
        <span className='link-underline'>API</span>
      </a>
      <a
        href='https://github.com/nyaomaru/is-kit'
        target='_blank'
        rel='noreferrer'
        className='group'
      >
        <span className='link-underline'>GitHub</span>
      </a>
      {showSeparators && orientation === 'horizontal' ? (
        <span className='mx-2 text-primary'>|</span>
      ) : null}
      <Link href='/en' className='group'>
        <span className='link-underline'>EN</span>
      </Link>
      <Link href='/ja' className='group'>
        <span className='link-underline'>JA</span>
      </Link>
      <Link href='/nl' className='group'>
        <span className='link-underline'>NL</span>
      </Link>
    </nav>
  );
}
