import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind utility classes, deduplicating conflicting entries.
 * @param inputs Class name arguments forwarded to `clsx`/`twMerge`.
 * @returns Space-delimited class string with Tailwind conflicts resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
