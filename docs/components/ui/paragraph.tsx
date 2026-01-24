import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const paragraphVariants = cva('', {
  variants: {
    variant: {
      default: 'text-foreground',
      muted: 'text-primary/80',
      lead: 'text-xl text-primary'
    },
    spacing: {
      default: '',
      flat: ''
    }
  },
  defaultVariants: {
    variant: 'default',
    spacing: 'default'
  }
});

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof paragraphVariants> & {
    /** Visual style applied to the paragraph. */
    variant?: 'default' | 'muted' | 'lead';
    /** Spacing preset applied to the paragraph margins. */
    spacing?: 'default' | 'flat';
  };

export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    { className, spacing = 'default', style, variant = 'default', ...props },
    ref
  ) => {
    const composedStyle =
      spacing === 'flat' ? { marginTop: 0, ...style } : style;

    return (
      <p
        ref={ref}
        className={cn(paragraphVariants({ spacing, variant }), className)}
        style={composedStyle}
        {...props}
      />
    );
  }
);
Paragraph.displayName = 'Paragraph';

export { paragraphVariants };
