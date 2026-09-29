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

# Install rtk (Rust Token Killer) to reduce LLM token consumption in agent
# cloud sessions. rtk is a Rust CLI proxy that compresses command output.
#
# This builds from a git checkout instead of running upstream's install.sh,
# because that script cannot reach what it needs from inside the sandbox:
#
#   * install.sh resolves the release version through github.com, falling back
#     to api.github.com. The sandbox proxy only serves GitHub over HTTP for
#     repositories attached to the session, and rtk-ai/rtk is not one, so both
#     lookups return 403 and the script aborts before downloading anything.
#     Its prebuilt binaries live on those same blocked hosts, so pinning
#     RTK_VERSION to skip the lookup would not help either.
#   * Anonymous *git* reads of public repositories are served, so a git
#     checkout is the one route into rtk-ai/rtk that stays open.
#   * `cargo install rtk` is NOT equivalent: the `rtk` name on crates.io
#     belongs to an unrelated project ("Rust Type Kit"), as does `rtk` on npm.
#     It has to be this git repository, pinned by tag — upstream's default
#     branch is `develop`, which carries release candidates.
RTK_VERSION="${RTK_VERSION:-v0.44.2}"
RTK_PREFIX="${RTK_PREFIX:-$HOME/.local}"
RTK_LOG=/tmp/rtk-install.log

# Put the install prefix on PATH up front, for this script and for every later
# Bash command in the session, whether or not we end up building below.
export PATH="$RTK_PREFIX/bin:$PATH"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$RTK_PREFIX/bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

# `rtk gain` is the Token Killer's savings dashboard, and the Type Kit that
# shares its name has no such subcommand — so this answers both "is rtk here?"
# and "is it the right rtk?" in one check, and skips the build on resume.
if command -v rtk > /dev/null 2>&1 && rtk gain > /dev/null 2>&1; then
  echo "rtk already installed ($(rtk --version 2>/dev/null))"
elif ! command -v cargo > /dev/null 2>&1; then
  echo "Warning: cargo not found; skipping rtk install, rtk will be unavailable"
else
  echo "Installing rtk $RTK_VERSION from source (a few minutes on a cold container)..."
  # rtk's release profile is tuned for a binary that ships once and then runs
  # for months: whole-program LTO in a single codegen unit. We rebuild it on
  # every cold container instead, so trade that back for build time. It cuts
  # the compile from ~3m10s to ~2m for byte-identical filter output.
  if CARGO_PROFILE_RELEASE_LTO=false \
    CARGO_PROFILE_RELEASE_CODEGEN_UNITS=16 \
    cargo install rtk \
    --git https://github.com/rtk-ai/rtk \
    --tag "$RTK_VERSION" \
    --locked \
    --root "$RTK_PREFIX" \
    > "$RTK_LOG" 2>&1; then
    echo "rtk installed ($(rtk --version 2>/dev/null))"
  else
    echo "Warning: rtk install failed; rtk will be unavailable. Last lines of $RTK_LOG:"
    tail -n 15 "$RTK_LOG" || true
  fi
fi

# Point the container's own Claude config at rtk: a ten-line RTK.md, referenced
# from ~/.claude/CLAUDE.md, says the hook rewrites commands and lists rtk's own
# commands. Nothing in the repository changes. Only when the build above left a
# working rtk: unguarded, a missing binary would fail this whole hook on its
# last line, after everything it exists for had already succeeded.
if command -v rtk > /dev/null 2>&1 && rtk gain > /dev/null 2>&1; then
  rtk init -g
fi
