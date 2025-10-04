# 😺 Contributing to is-kit

🎉 Thanks for considering contributing to `is-kit`!

We welcome any improvements, whether it's a feature, bugfix, test, or documentation change.

---

## 🛠 Setup

```sh
pnpm install
```

To run tests locally:

```sh
pnpm test && pnpm test:types
```

Optional checks:

```sh
pnpm lint
pnpm build
```

## Workflow

1. Fork this repository
2. Clone your forked repository

```sh
git clone https://github.com/nyaomaru/is-kit.git
cd is-kit
```

3. Create a feature branch

```sh
git checkout -b your-feature-name
```

## 🌱 Branch Naming Convention

We don't enforce strict rules on branch naming.

But we recommend using descriptive names for clarity.

Feel free to set your naming like below.

Examples:

- feat/add-new-combinator
- fix/not-refinement-edge-case
- docs/update-readme

## 💬 Commit Message Style

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

(Don't worry if you forget it—happens to the best of us!)

```sh
type(scope): brief description

e.g.,
feat(combinators): add oneOfValues fast path
fix(logic): correct not() exclusion typing
```

Types include: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## 🚀 Pull Request Process

- Make sure all checks pass: `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:types`
- Describe what you changed and why
- If your PR resolves an issue, mention it (Closes #123)
- Add or update tests (runtime and/or type tests) if applicable
- Keep PRs focused and concise
- Feel free to open it as a **Draft PR** while you're still working.

## 📏 Style Guide

- No strict rules
- Keep the code **clean**, **readable**, and **documented**
- Prefer descriptive naming
- Add JSDoc comments when introducing new public functions

### TypeScript guard/refinement conventions

- Prefer returning `Predicate<T>` for guards that accept `unknown` and narrow to `T`.
- Use `Refine<A, B>` when the input type is already known (`A`) and you refine to a subtype (`B`).
- Keep overloads that accept a typed input (e.g. `oneOf<A>(...) : (input: A) => input is ...`) as-is; `Predicate<...>` is only for the `unknown`-input shape.
- For comparator-style helpers, use `const` generics to preserve literal types (e.g., `equals<const T>(target: T): Predicate<T>`), enabling precise narrowing to the exact literal.
- When a returned function must carry additional generics on the input (e.g., `equalsKey` returning `<A>(input) is A & ...`), keep the type predicate form; do not force `Predicate<...>` at the cost of expressiveness.

Thank you again! 🙌

If you have any questions or ideas, feel free to open a discussion or issue. 🚀
