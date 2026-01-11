import Link from 'next/link';
import Image from 'next/image';

import { Paragraph } from '@/components/ui/paragraph';

export type HeroSectionProps = {
  /** Localized lead-in copy rendered under the logo. */
  description: string;
};
export function HeroSection({ description }: HeroSectionProps) {
  return (
    <section className='mb-16 flex flex-col items-center text-center'>
      <Link
        href='https://github.com/nyaomaru/is-kit'
        className='mb-6 mt-10 inline-flex max-w-full items-center justify-center'
      >
        <Image
          src='/iskit_logo1.svg'
          alt='is-kit logo'
          width={300}
          height={300}
          sizes='(max-width: 768px) 150px, 300px'
          className='h-[150px] w-auto max-w-full sm:h-[180px] md:h-[300px]'
        />
      </Link>
      <Paragraph
        variant='lead'
        className='mt-4 mb-8 w-full max-w-2xl px-4 sm:px-0'
      >
        {description}
      </Paragraph>
    </section>
  );
}
