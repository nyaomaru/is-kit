import React from 'react';
import { Paragraph } from '@/components/ui/paragraph';

export type LoadingOverlayProps = { label?: string };
export function LoadingOverlay({ label = 'Loading…' }: LoadingOverlayProps) {
  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm'
      role='alert'
      aria-busy
      aria-live='polite'
    >
      <div className='flex flex-col items-center gap-4 p-6 rounded-lg border bg-background shadow-sm'>
        {/* NOTE: Next/Image is avoided for animated SVGs */}
        <img
          src='/iskit_rotate_animated_1s.svg'
          width={120}
          height={120}
          alt={label}
          className='h-28 w-28'
        />
        <Paragraph className='text-sm text-muted-foreground'>{label}</Paragraph>
      </div>
    </div>
  );
}
