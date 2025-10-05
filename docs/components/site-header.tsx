'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heading } from '@/components/ui/heading';
import { DOCS_TOGGLE_SIDEBAR_EVENT } from '@/lib/events';

export function SiteHeader() {
  const handleToggle = () => {
    try {
      // Broadcast toggle event so content layouts can respond.
      window.dispatchEvent(new CustomEvent(DOCS_TOGGLE_SIDEBAR_EVENT));
    } catch (error) {
      console.error('Failed to dispatch sidebar toggle event', error);
    }
  };
  return (
    <header className='fixed inset-x-0 top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 w-full items-center justify-between px-4'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            aria-label='Toggle sidebar'
            onClick={handleToggle}
            className='group h-8 w-8 inline-flex items-center justify-center rounded text-foreground hover:bg-primary/10 hover:text-primary transition-colors'
          >
            <span className='sr-only'>Toggle sidebar</span>
            <span
              aria-hidden
              className='flex flex-col items-center justify-center gap-1'
            >
              <span className='block h-0.5 w-5 bg-primary rounded' />
              <span className='block h-0.5 w-5 bg-primary rounded' />
              <span className='block h-0.5 w-5 bg-primary rounded' />
            </span>
          </button>
          <Heading
            variant='h1'
            className='m-0 p-0 leading-none text-base font-normal'
          >
            <Link href='/' className='inline-flex items-center gap-2 mt-2 ml-2'>
              <Image
                src='/iskit_logo2.svg'
                alt='is-kit'
                width={86}
                height={22}
                priority
              />
            </Link>
          </Heading>
        </div>
        <nav className='hidden md:flex items-center gap-4 text-sm text-muted-foreground'>
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
      </div>
    </header>
  );
}
