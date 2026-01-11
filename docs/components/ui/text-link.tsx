import * as React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

/** Next.js link props reused by the stylised inline link component. */
type TextLinkProps = React.ComponentPropsWithoutRef<typeof Link>;

/**
 * Shared inline link component that applies the docs underline animation.
 * @param props Next.js link properties combined with standard anchor attributes.
 * @returns Stylized link element.
 */
export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          'group inline-flex items-center text-primary transition-colors focus-visible:outline-none focus-visible:underline link-underline',
          className,
        )}
        {...props}
      >
        {children}
      </Link>
    );
  },
);
TextLink.displayName = 'TextLink';
