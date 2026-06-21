#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-dev}"
HOST="${HOST:-127.0.0.1}"
DEV_PORT="${DEV_PORT:-5173}"
PREVIEW_PORT="${PREVIEW_PORT:-4173}"
CODEX_NODE_BIN="/Users/limin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"

find_node_bin() {
  if command -v node >/dev/null 2>&1; then
    dirname "$(command -v node)"
    return 0
  fi

  if [ -x "$CODEX_NODE_BIN/node" ]; then
    echo "$CODEX_NODE_BIN"
    return 0
  fi

  return 1
}

NODE_BIN="$(find_node_bin || true)"

if [ -z "$NODE_BIN" ]; then
  echo "Node.js was not found." >&2
  echo "Install Node.js, then run one of these commands:" >&2
  echo "  corepack enable && corepack prepare pnpm@10.12.1 --activate" >&2
  echo "  pnpm install" >&2
  echo "  pnpm dev" >&2
  exit 1
fi

export PATH="$NODE_BIN:$PATH"
cd "$SCRIPT_DIR"

case "$MODE" in
  dev)
    if [ ! -x "$SCRIPT_DIR/node_modules/.bin/vite" ]; then
      echo "Dependencies are missing. Run: pnpm install" >&2
      exit 1
    fi
    exec "$SCRIPT_DIR/node_modules/.bin/vite" --host "$HOST" --port "$DEV_PORT"
    ;;
  preview)
    if [ ! -x "$SCRIPT_DIR/node_modules/.bin/vite" ]; then
      echo "Dependencies are missing. Run: pnpm install" >&2
      exit 1
    fi
    exec "$SCRIPT_DIR/node_modules/.bin/vite" preview --host "$HOST" --port "$PREVIEW_PORT"
    ;;
  build)
    if [ -x "$SCRIPT_DIR/node_modules/.bin/vue-tsc" ] && [ -x "$SCRIPT_DIR/node_modules/.bin/vite" ]; then
      "$SCRIPT_DIR/node_modules/.bin/vue-tsc" --noEmit
      exec "$SCRIPT_DIR/node_modules/.bin/vite" build
    fi
    echo "Dependencies are missing. Run: pnpm install" >&2
    exit 1
    ;;
  *)
    echo "Usage: ./start.sh [dev|preview|build]" >&2
    echo "Examples:" >&2
    echo "  ./start.sh dev      # http://127.0.0.1:5173/" >&2
    echo "  ./start.sh preview  # http://127.0.0.1:4173/" >&2
    echo "  ./start.sh build" >&2
    exit 1
    ;;
esac
