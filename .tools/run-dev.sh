#!/bin/zsh
# Wrapper used by .claude/launch.json: makes the locally-downloaded Node.js
# (in .tools/node) available on PATH before invoking npm, since npm is not
# installed system-wide.
DIR="$(cd "$(dirname "${0:A}")/.." && pwd)"
cd "$DIR"
export PATH="$DIR/.tools/node/bin:$PATH"
exec npm run dev
