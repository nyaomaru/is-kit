#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: run_prettier.sh [--check|--write] [paths...]

Defaults:
  --write
  paths: .

Examples:
  run_prettier.sh --write .
  run_prettier.sh --check src tests
USAGE
}

mode="--write"
paths=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check|--write)
      mode="$1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      paths+=("$@")
      break
      ;;
    *)
      paths+=("$1")
      shift
      ;;
  esac
done

if [[ ${#paths[@]} -eq 0 ]]; then
  paths=(".")
fi

if [[ -x "./node_modules/.bin/prettier" ]]; then
  runner=("./node_modules/.bin/prettier")
elif command -v pnpm >/dev/null 2>&1; then
  runner=("pnpm" "prettier")
elif command -v yarn >/dev/null 2>&1; then
  runner=("yarn" "prettier")
elif command -v npm >/dev/null 2>&1; then
  runner=("npx" "prettier")
else
  echo "prettier not found. Install it or run in a repo with node_modules/.bin/prettier." >&2
  exit 1
fi

"${runner[@]}" "$mode" "${paths[@]}"
