#!/bin/bash
# Runs at every Claude Code Cloud session start (startup and resume).
# Exits immediately when running in a local session.

set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"


# Install npm dependencies
npm ci

# Add node_modules/.bin to PATH for the rest of this script and for all
# subsequent Bash commands Claude runs in this session.
export PATH="$CLAUDE_PROJECT_DIR/node_modules/.bin:$PATH"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$CLAUDE_PROJECT_DIR/node_modules/.bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

# Playwright: the pinned @playwright/test may want a newer Chromium build than
# the one preinstalled in the cloud sandbox. playwright.config.ts honours this
# variable and launches that binary directly instead of downloading one.
if [ -x /opt/pw-browsers/chromium ]; then
  export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium" >> "$CLAUDE_ENV_FILE"
  fi
fi
