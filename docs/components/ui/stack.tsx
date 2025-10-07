import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-10',
    },
  },
  defaultVariants: {
    gap: 'md',
  },
});

type StackTag = 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav';

type StackProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof stackVariants> & {
    /** Semantic element to render; defaults to `div`. */
    variant?: StackTag;
  };

/**
 * Vertical layout primitive with configurable gap and semantic element.
 * @param variant HTML element to render for semantic intent.
 * @param gap Vertical spacing between children.
 * @returns Stack layout element with merged class names.
 */
export const Stack = React.forwardRef<HTMLElement, StackProps>(
  ({ className, gap, variant = 'div', ...props }, ref) => {
    const Tag = variant;
    return (
      <Tag
        ref={ref}
        className={cn(stackVariants({ gap }), className)}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';

export { stackVariants };
