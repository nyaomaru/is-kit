import Link from 'next/link';

import { cn } from '@/lib/utils';

type SiteNavProps = {
  className?: string;
};

export function SiteNav({ className }: SiteNavProps) {
  return (
    <nav
      className={cn(
        'flex items-center gap-4 text-sm text-muted-foreground',
        className
      )}
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
      <span className='mx-2 text-primary'>|</span>
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
