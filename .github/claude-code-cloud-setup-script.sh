#!/bin/bash
# Claude Code Cloud — Environment Setup Script
#
# This script is entered into the "Setup script" field in the Claude Code
# environment settings UI at code.claude.com. It runs once per environment
# cache lifetime (roughly 7 days), before Claude Code launches.
#
# It is version-tracked here. Copy-paste the body into:
#   claude.ai/code → (environment selector) → edit environment → Setup script
#
# Reference: https://code.claude.com/docs/en/claude-code-on-the-web#setup-scripts
#
# ── Why only Playwright here? ────────────────────────────────────────────────
# Everything that needs the repo root (npm ci, etc.) runs in the
# SessionStart hook at .claude/hooks/cloud-session-start.sh, where
# $CLAUDE_PROJECT_DIR is available. That hook runs on every session start.
#
# Playwright is here because installing Chromium is a large download (~200 MB)
# that benefits from the environment cache — it installs once, not on every
# session startup.
#
# ── Optional environment variable ─────────────────────────────────────────────
# GH_TOKEN (a GitHub PAT with repo scope) is only used as a fallback by the
# SessionStart hook, for the case where `origin` needs credentials this
# runner doesn't have (e.g. an SSH remote with no key here). It is not
# required when origin is already reachable, which is the common case.
# ─────────────────────────────────────────────────────────────────────────────

set -e

# The Claude Code Cloud security proxy blocks ppa.launchpadcontent.net
# (it is not in the "Trusted" network allowlist, unlike ppa.launchpad.net).
# The Ubuntu image ships with deadsnakes and ondrej/php PPAs that live on
# that domain. `npx playwright install --with-deps` runs `apt-get update`,
# which hits those PPAs and gets 403s, causing apt to exit non-zero and
# Playwright to abort before Chromium is installed.
# Remove any sources that reference the blocked domain first.
grep -rl "launchpadcontent.net" /etc/apt/sources.list.d/ 2>/dev/null | xargs rm -f || true

npx playwright install chromium --with-deps
