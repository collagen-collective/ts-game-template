# `<project>`

> **Scaffolded from a shared TypeScript game-project template.** Italic text is a prompt from the
> template; anything in angle brackets is a placeholder. Answer the prompts and delete them.
> ``rg '`<' README.md CLAUDE.md docs/`` lists whatever is still unfilled. Two placeholders it will
> not list, because they are not Markdown: the `name` field in `package.json` and the page `title`
> in `index.html`. **In Claude Code, `/gettingstarted` walks you through all of it** — it interviews
> you, fills in what is settled, and files what isn't. Delete this block when the repo is your own.

*One paragraph. What the player does, where they do it, and what the loop is. Concrete enough that
a stranger could picture a minute of play, and short enough to read before deciding whether to keep
reading. If it needs a second paragraph, the premise is not settled yet — say so in
[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md) and move on.*

## Read this first

Three documents, and they divide by tense. That is the whole filing rule: anything you write either
fits one of them or replaces one of them.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)** is present tense: what is settled. What the game wants
  to be, what it has to be, the laws that bind everywhere, and the building blocks. Each block
  states the problem it exists to solve before it states the answer.
- **[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md)** is future tense: what you still have to
  find out. Every entry says *how it gets resolved*, because that is the part that gets skipped,
  and skipping it is how a question about how something feels ends up in a task queue that cannot
  answer it.
- **[`docs/DESIGN-LOG.md`](./docs/DESIGN-LOG.md)** is past tense: what was tried and what happened,
  oldest first. Append only. Read end to end it is the problem-solving narrative, including the
  places where solving one problem changed the answer to another one upstream.

The Charter is deliberately a *what* and a *why*. It does not say how to build any of it. That
omission is the point: a charter that specifies mechanism goes stale the first time the mechanism
changes, and once one section is known to be stale, the load-bearing ones stop being trusted along
with it.

## What ships here, and what does not

`src/`, `tests/`, and `scripts/` are empty. There is no implementation to read, no architecture to
conform to, and no issue tracker. That is the starting condition, not an accident.

The build tooling is configured and installed: Vite, TypeScript, ESLint, Prettier, Vitest,
Playwright, husky. `index.html` names `/src/runtime/main.ts` as the entry point and that file does
not exist yet — it is the one file-layout assumption the scaffold makes, and it is a line to change
rather than a convention to obey.

## Four rules carried in

*These came out of a previous project that reached a thousand commits and fifty thousand lines of
production code, with an equal weight of tests, before anyone had established whether it was fun.
The build at the end booted into two zones and one quest that shipped already finished. Every
automated gate was green throughout.*

*They are inherited defaults, not this project's findings. Keep them, argue with them, or delete
this section — but do it deliberately, and log the decision.*

**Done is the wire, not the module.** A feature is finished when a booted game lets a player do the
thing. A system with a passing test and no caller is not delivered, and neither the test suite nor
the type-checker can tell you so: unit tests import modules directly, so a module keeps a green
test long after nothing in the running game reaches it. The audit that produced this rule found
forty unreachable modules under six thousand lines of passing tests, a combat HUD with zero
importers, and an enemy damage event nothing subscribed to — which had left the player invulnerable
in every green build for weeks.

**Play it.** A system whose feel you are still finding has earned nothing but being played. A
throwaway prototype of under nine hundred lines, written in one pass and judged on nothing but
whether it was fun, was a better game than the fifty thousand lines it was prototyping — it had no
tickets, no tests, and no design docs to conform to. When you write down a playtest, write down
what *worked*. Defect lists are the easy half, and they are not the half that tells you what to
protect.

**Ask whether every criterion could pass and the thing still be wrong.** If yes, the criteria are a
proxy for a judgment, and a person has to play it and render the verdict. Feel-shaped questions
routed through a queue come back as correct fragments that do not compose, verified by gates that
cannot see the thing you were actually asking about.

**Test what has stopped changing.** Every test written against a system you are still tuning is a
bet you will pay to unwind. About six thousand lines of that bet came due at once.

## Toolchain

Requires Node 22+.

```bash
npm ci            # install
npm run dev       # vite dev server on :3000
npm run build     # tsc --noEmit && vite build
npm run typecheck # tsc --noEmit
npm run lint      # eslint src tests
npm run format    # prettier --write src tests
npm test          # vitest run
npm run test:e2e  # playwright test
npm run verify    # typecheck + lint + unit + e2e
```

`npm run verify` is the gate. With `src/` and `tests/` empty it does not pass yet: every step has
nothing to act on, and several tools treat "no input files" as an error. A Playwright config still
needs to be added before `test:e2e` can run. Adding the first source file and the first test is
what makes any of it meaningful.

A husky `pre-commit` hook runs `tsc --noEmit` and `lint-staged`. CI (`.github/workflows/ci.yml`)
runs typecheck, a Prettier check, ESLint, and the unit tests on pull requests.

## Optional: the RTK agent tooling

The scaffold carries a setup for [RTK](https://github.com/rtk-ai/rtk), a third-party CLI proxy that
compresses command output to cut an LLM agent's token consumption. **It is optional and nothing here
needs it.** If you are not running a coding agent against this repo, it changes nothing about how
the game builds or runs.

It lives in three places, none of which is a document:

- **`.claude/hooks/rtk-rewrite.sh`**, wired to `PreToolUse`/`Bash` in `.claude/settings.json` —
  rewrites each shell command to run under `rtk`. This is deliberately a mechanism rather than an
  instruction: no document has to tell an agent to type `rtk` in front of things, and an agent that
  never heard of RTK gets the benefit anyway. When `rtk` is not installed the hook exits silently
  and the command runs exactly as written, so a local checkout without RTK behaves normally. (The
  template used to put a generated block of instructions in `CLAUDE.md` instead; dragon replaced it
  with this hook, and an agent without RTK no longer reads an instruction it cannot follow.)
- **`.rtk/filters.toml`** — project-local output filters. Ships with commented examples only.
- **`.claude/hooks/cloud-session-start.sh`** — installs RTK in Claude Code Cloud sessions, building
  it from a tag-pinned git checkout (the vendor's install script cannot reach its own release
  metadata from inside the sandbox; the script's comments explain why at length). It runs only when
  `CLAUDE_CODE_REMOTE=true`, so a local session never reaches it, and it needs `cargo` — without
  one it warns and continues without RTK. Once RTK is built, the script runs `rtk init -g`, which
  writes a ten-line note about the hook into the container's own Claude config, outside the
  repository.

To remove it:

```bash
rm -rf .rtk .claude/hooks/rtk-rewrite.sh
# then delete the "PreToolUse" block from .claude/settings.json,
# and the "Install rtk" block, with the `rtk init -g` block after it,
# in .claude/hooks/cloud-session-start.sh
```

Separately, `.claude/settings.json` sets `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. That is an
unrelated opt-in Claude Code flag; delete the `env` block if you don't want it.
