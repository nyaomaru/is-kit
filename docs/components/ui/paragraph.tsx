import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const paragraphVariants = cva('', {
  variants: {
    variant: {
      default: 'text-foreground',
      muted: 'text-primary/80',
      lead: 'text-xl text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof paragraphVariants> & {
    /** Visual style applied to the paragraph. */
    variant?: 'default' | 'muted' | 'lead';
  };

export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(paragraphVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Paragraph.displayName = 'Paragraph';

export { paragraphVariants };
