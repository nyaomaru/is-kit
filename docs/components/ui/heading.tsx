import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const headingVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'font-semibold',
      h4: 'font-medium',
      h5: 'font-medium',
      h6: 'font-medium'
    }
  },
  defaultVariants: {
    variant: 'h2'
  }
});

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    /** Semantic heading tag to render; defaults to `h2`. */
    variant?: HeadingTag;
  };

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = 'h2', ...props }, ref) => {
    const Tag = variant;
    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Heading.displayName = 'Heading';

export { headingVariants };
