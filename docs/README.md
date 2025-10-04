# is-kit docs (Next.js + shadcn)

This directory hosts the is-kit documentation site built with Next.js and shadcn/ui.

- Dev: `pnpm --filter ./docs dev`
- Build: `pnpm --filter ./docs build`
- Start: `pnpm --filter ./docs start`
- mise users can run the same flows via `mise exec pnpm --filter ./docs dev` (swap `dev` for `build`/`start` as needed).

API Reference (TypeDoc) is generated into `docs/public/api` via the root script:

```
pnpm typedoc
```

This allows the site to serve the static API under `/api`.

## Adding shadcn/ui components

The docs app is preconfigured for shadcn/ui (`components.json`, Tailwind, alias `@/*`).

- List available components:
  - From repo root: `pnpm --filter ./docs run shadcn:list`
- Add a component (examples):
  - From repo root: `pnpm --filter ./docs run shadcn:add button`
  - Or inside `docs/`: `pnpm dlx shadcn@latest add button`
- If needed, (re)initialize shadcn (already set up):
  - `pnpm --filter ./docs run shadcn:init`

After adding, import components from `@/components/ui/*` in the docs pages.

## Example usage

```tsx
// app/example/page.tsx
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
