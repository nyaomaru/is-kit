# is-kit docs

This directory contains the public documentation site for `is-kit`.

The site is built with Next.js and shadcn/ui. It serves the marketing pages, hand-written API guides, and the generated TypeDoc output.

## What lives here

- `app/` - Next.js routes and page entry points
- `components/` - reusable docs-site UI and page sections
- `constants/` - site navigation and page metadata
- `lib/` - docs-specific helpers and data shaping
- `public/` - static assets and generated API output

## Local development

From the repository root:

```bash
pnpm --filter ./docs dev
```

Other common commands:

```bash
pnpm --filter ./docs build
pnpm --filter ./docs start
```

If you use `mise`, run the same commands through `mise exec`.

## Generated API reference

The API reference is generated from the library source with TypeDoc and written to `docs/public/api`.

From the repository root:

```bash
pnpm typedoc
```

After generation, the docs site serves that static output under `/api`.

## Common editing workflow

### Update a guide or landing page

Edit the relevant route in `app/` and the supporting components in `components/`.

### Update navigation or docs metadata

Check the files under `constants/` and `lib/`.

### Refresh generated API docs

Run:

```bash
pnpm typedoc
```

### Add or update static assets

Place them under `public/`.

## shadcn/ui

The docs app is already configured for shadcn/ui with the `@/*` alias.

List available components:

```bash
pnpm --filter ./docs run shadcn:list
```

Add a component:

```bash
pnpm --filter ./docs run shadcn:add button
```

If you need to reinitialize shadcn:

```bash
pnpm --filter ./docs run shadcn:init
```

## Example

```tsx
import { Button } from '@/components/ui/button';

export default function Example() {
  return (
    <div className='space-x-2'>
      <Button>Default</Button>
      <Button variant='secondary'>Secondary</Button>
    </div>
  );
}
```
