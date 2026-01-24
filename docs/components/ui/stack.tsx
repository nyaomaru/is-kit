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
      xl: 'gap-10'
    }
  },
  defaultVariants: {
    gap: 'md'
  }
});

type StackTag = 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav';

type StackProps<Tag extends StackTag = 'div'> = VariantProps<
  typeof stackVariants
> &
  Omit<JSX.IntrinsicElements[Tag], 'className' | 'ref'> & {
    /** Tailwind utility classes merged onto the rendered element. */
    className?: string;
    /** Semantic element to render; defaults to `div`. */
    variant?: Tag;
  };

type ElementFromTag<Tag extends StackTag> =
  JSX.IntrinsicElements[Tag] extends React.DetailedHTMLProps<
    React.HTMLAttributes<infer Element>,
    unknown
  >
    ? Element
    : never;

type StackComponent = <Tag extends StackTag = 'div'>(
  props: StackProps<Tag> & { ref?: React.Ref<ElementFromTag<Tag>> }
) => React.ReactElement | null;

/**
 * Vertical layout primitive with configurable gap and semantic element.
 * @param variant HTML element to render for semantic intent.
 * @param gap Vertical spacing between children.
 * @returns Stack layout element with merged class names.
 */
const StackBase = <Tag extends StackTag = 'div'>(
  { className, gap, variant, ...props }: StackProps<Tag>,
  ref: React.ForwardedRef<ElementFromTag<Tag>>
) => {
  const Component = (variant ?? 'div') as StackTag;
  return React.createElement(Component, {
    ...(props as Record<string, unknown>),
    ref,
    className: cn(stackVariants({ gap }), className)
  } as React.Attributes & JSX.IntrinsicElements[Tag]);
};

StackBase.displayName = 'Stack';

export const Stack = React.forwardRef(StackBase) as StackComponent;

export { stackVariants };
