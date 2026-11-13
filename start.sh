#!/usr/bin/env bash
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
npm run build && npx vite preview --port 3000 --host 127.0.0.1 --strictPort --open
