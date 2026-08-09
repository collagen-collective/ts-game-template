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

# Install rtk to reduce LLM token consumption in agent cloud sessions
# rtk is a Rust-based CLI proxy that compresses command output by 60-90%
if ! command -v rtk &> /dev/null; then
  echo "Installing rtk..."
  # Use the official install script with timeout and error handling
  if timeout 120 sh -c 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh' 2>&1 | tee /tmp/rtk-install.log; then
    echo "rtk installation completed"
    # Add ~/.local/bin to PATH for this session and future commands
    export PATH="$HOME/.local/bin:$PATH"
    if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
      echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
    fi
  else
    echo "Warning: rtk installation encountered issues (see /tmp/rtk-install.log); rtk may not be available"
  fi
else
  echo "rtk is already installed"
fi
