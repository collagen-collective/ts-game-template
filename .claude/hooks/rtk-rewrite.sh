#!/bin/bash
# PreToolUse(Bash): route shell commands through rtk, which compresses command
# output before it reaches the context window.
#
# This exists so that no document has to tell an agent to type `rtk` in front of
# things. The rewrite is mechanical, so a mechanism does it.
#
# rtk is installed by cloud-session-start.sh and is absent from most local
# checkouts, so a missing or failing binary must never block the Bash tool:
# exit 0 with no output and Claude Code runs the command exactly as written.

set -uo pipefail

command -v rtk > /dev/null 2>&1 || exit 0

payload=$(cat)

if rewritten=$(printf '%s' "$payload" | rtk hook claude 2> /dev/null); then
  [ -n "$rewritten" ] && printf '%s' "$rewritten"
fi

exit 0
