'use client';
import { useMemo } from 'react';
import {
  TYPEWRITER_DEFAULT_SPEED_MS,
  TYPEWRITER_DEFAULT_START_DELAY_MS,
  TYPEWRITER_CARET_WIDTH,
  TYPEWRITER_CARET_BLINK_MS,
} from '@/constants/ui';

// CSS-driven typewriter: no JS timers/state. See globals.css for keyframes.
export type TypewriterProps = {
  text: string;
  speedMs?: number; // per-character ms
  startDelayMs?: number;
  className?: string;
  cursor?: boolean;
};

export function Typewriter({
  text,
  speedMs = TYPEWRITER_DEFAULT_SPEED_MS,
  startDelayMs = TYPEWRITER_DEFAULT_START_DELAY_MS,
  className,
  cursor = true,
}: TypewriterProps) {
  const safeText = useMemo(() => text ?? '', [text]);
  type TypewriterStyle = React.CSSProperties & {
    '--tw-chars'?: string;
    '--tw-speed'?: string;
    '--tw-delay'?: string;
    '--tw-duration'?: string;
    '--tw-caret-width'?: string;
    '--tw-caret-blink'?: string;
  };
  const style: TypewriterStyle = {
    // CSS vars used by globals.css animations
    '--tw-chars': String(safeText.length),
    '--tw-speed': `${speedMs}ms`,
    '--tw-delay': `${startDelayMs}ms`,
    '--tw-duration': `calc(var(--tw-chars) * var(--tw-speed))`,
    '--tw-caret-width': TYPEWRITER_CARET_WIDTH,
    '--tw-caret-blink': `${TYPEWRITER_CARET_BLINK_MS}ms`,
  };
  const cls = `tw-typewriter${cursor ? '' : ' tw-no-caret'}${className ? ' ' + className : ''}`;
  return (
    <span className={cls} style={style}>
      {safeText}
    </span>
  );
}
