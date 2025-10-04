'use client';
import { useState } from 'react';
import { COPY_BUTTON_RESET_MS } from '@/constants/ui';

export type CopyButtonProps = {
  text: string;
  className?: string;
  resetAfterMs?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function CopyButton({
  text,
  className,
  resetAfterMs = COPY_BUTTON_RESET_MS,
  ...rest
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetAfterMs);
    } catch {}
  }

  return (
    <button
      type='button'
      onClick={onCopy}
      className={
        'text-xs rounded border border-primary text-primary px-2 py-1 hover:bg-primary/10 transition-colors ' +
        (className ?? '')
      }
      aria-live='polite'
      {...rest}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
