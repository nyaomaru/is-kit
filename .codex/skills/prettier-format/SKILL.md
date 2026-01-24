---
name: prettier-format
description: Run Prettier for the is-kit repository. Use when asked to format or check formatting in this project. Always consult AGENTS.md in the repo root before executing commands.
---

# Prettier Format (is-kit)

## Overview

Format or check code using this repo's Prettier configuration and ignore rules. Prefer local binaries and the project's package manager.

## Workflow

1. Read repository instructions.

- Open `AGENTS.md` in the repo root and follow all constraints (commands, formatting, tests, etc.).
- If `AGENTS.md` is missing, ask how to proceed.

2. Determine intent and scope.

- Use `--check` for "verify formatting" requests.
- Use `--write` for "format" or "fix" requests.
- Ask for target paths when not specified; do not assume whole repo unless requested.

3. Run Prettier with local tooling.

- Prefer `./node_modules/.bin/prettier`.
- Alternative: `pnpm prettier` (repo uses pnpm).
- Avoid `npx` unless the user explicitly approves network downloads.

4. Report results.

- Summarize changed files or confirm a clean check.
- If a command fails, include the error and propose the next step.

## Quick Commands

- Format repo: `./node_modules/.bin/prettier --write .`
- Check formatting: `./node_modules/.bin/prettier --check .`
- Format paths: `./node_modules/.bin/prettier --write src tests`
- Check paths: `pnpm prettier --check src tests`

## Resources

### scripts/

- `run_prettier.sh`: Run Prettier with `--write` or `--check` and auto-pick a runner.
