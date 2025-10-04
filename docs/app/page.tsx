import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { TextLink } from '@/components/ui/text-link';

export default function HomePage() {
  return (
    <div className='space-y-6'>
      <Heading variant='h1' className='text-3xl font-bold tracking-tight'>
        is-kit
      </Heading>
      <Paragraph className='text-muted-foreground'>
        Redirecting to localized docs…
      </Paragraph>
      <Paragraph>
        Try <TextLink href='/en'>/en</TextLink> or{' '}
        <TextLink href='/ja'>/ja</TextLink>.
      </Paragraph>
    </div>
  );
}
