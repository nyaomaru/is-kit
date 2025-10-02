import Link from 'next/link';
import Image from 'next/image';

import { Paragraph } from '@/components/ui/paragraph';

export type HeroSectionProps = { description: string };
export function HeroSection({ description }: HeroSectionProps) {
  return (
    <section className='mb-16 flex flex-col items-center text-center'>
      <Link href='https://github.com/nyaomaru/is-kit' className='mb-6'>
        <Image
          src='/iskit_logo1.svg'
          alt='is-kit logo'
          width={300}
          height={300}
        />
      </Link>
      <Paragraph variant='lead' className='max-w-2xl mt-4 mb-8'>
        {description}
      </Paragraph>
    </section>
  );
}
