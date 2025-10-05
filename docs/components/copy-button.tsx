'use client';
import { useState } from 'react';
import { COPY_BUTTON_RESET_MS } from '@/constants/ui';

export type CopyButtonProps = {
  /** Raw string copied to the clipboard when the button is pressed. */
  text: string;
  /** Extra classes merged onto the button element. */
  className?: string;
  /** Milliseconds before the copied state resets back to idle. */
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
