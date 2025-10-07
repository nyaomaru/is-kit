import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Stack } from '@/components/ui/stack';
import { API_ITEMS } from '@/constants/api-items';

export default function ApiIndexPage() {
  const items = API_ITEMS;
  return (
    <Stack variant='main' className='container mx-auto px-4 py-10' gap='xl'>
      <Stack variant='section' gap='sm'>
        <Heading variant='h1'>API Reference</Heading>
        <Paragraph className='text-muted-foreground'>
          Explore the available functions and combinators. Use the sidebar to
          navigate.
        </Paragraph>
      </Stack>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='group focus:outline-none'
          >
            <Card className='h-full transition-colors group-hover:border-primary'>
              <CardHeader>
                <div className='inline-block w-fit'>
                  <CardTitle className='inline-block text-lg underline-offset-4'>
                    {item.title}
                  </CardTitle>
                  <div className='h-px w-0 bg-primary transition-[width] duration-500 group-hover:w-full' />
                </div>
                <CardDescription className='mt-3'>
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </Stack>
  );
}
