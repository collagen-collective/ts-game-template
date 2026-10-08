# `<project>`

> **Made from a shared TypeScript game-project template.** Italic text is a prompt from the
> template, and anything in angle brackets is a placeholder: answer each one and delete it.
> ``rg '`<' README.md CLAUDE.md docs/`` lists them, except two outside the Markdown: the `name` in
> `package.json` and the page `title` in `index.html`. *Getting started*, below, has the steps.
> Delete this block when the repo is your own.

*One paragraph. What the player does, where they do it, and what the loop is. Concrete enough that
a stranger could picture a minute of play, and short enough to read before deciding whether to keep
reading. If it needs a second paragraph, the premise is not settled yet — say so in
[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md) and move on.*

## Getting started

This template is a starting point for a browser game built with a coding agent, such as Claude
Code, doing most of the typing and a person deciding what the game is and how it should feel. It
ships no game code.

1. **Make your repository** with GitHub's *Use this template* button, clone it, and run `npm ci`
   (Node 22 or later).
2. **Fill in the premise.** In Claude Code, run `/gettingstarted`: it interviews you, writes down
   what is settled, files what isn't as an open question, and records the first design-log entry.
   Without Claude Code, answer the italic prompts in this README and in `docs/` by hand. Either
   way, expect most of it to be open questions at first; that is the right answer for a new game.
3. **Link it to the template,** once: `npm run template:link`, then commit `.copier-answers.yml`,
   so that the project can take in what the template learns later.
4. **Build something playable.** The first code session chooses the layout (*Where things live*)
   and writes the first end-to-end test, `tests/e2e/boot.spec.ts`. After that, a build you can sit
   down and play is seconds away, and playing it is the point.

## The three documents

They divide by tense, and that is all there is to filing: anything you write either fits one of them
or replaces one of them.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)**, present tense: what is settled. What the game wants
  to be, what it has to be, the guidelines for the whole game, and its main systems, each stating
  the problem it solves before the answer. It says *what* and *why*, never *how* to build it.
- **[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md)**, future tense: what is still to be found
  out, each entry tagged by how it gets answered: by playing (PLAY), by discussion (DECIDE), or
  later (DEFER). A question only playing can answer cannot be settled by handing someone a task.
- **[`docs/DESIGN-LOG.md`](./docs/DESIGN-LOG.md)**, past tense: what was tried and what happened,
  oldest first, and append only.

How we work, as the principles earlier games built from this template learned, is in
[`CLAUDE.md`](./CLAUDE.md), which an agent reads every session.

## What ships here, and what does not

`src/` and `tests/` are empty. There is no implementation to read, no architecture to conform to,
and no issue tracker. That is the starting point, not an accident.

- **`docs/` and `CLAUDE.md`**: the three documents, and how we work.
- **`scripts/`**: tools that work with any game, under *Toolchain*.
- **`feedback/` and `infra/`**: an in-game feedback page and the function that delivers its reports
  (*Feedback from inside the game*).
- **`.claude/skills/`**: the agent workflows, `gettingstarted`, `design-log`, `frame-check`,
  `sound-check` and `template-sync`. In Claude Code each runs as a slash command or when the
  situation calls for it.

The build tooling is configured and installed: Vite, TypeScript, ESLint, Prettier, Vitest,
Playwright, husky. Its only assumptions about layout are that `index.html` names
`/src/runtime/main.ts` as the entry point, that Playwright looks for tests in `tests/e2e/`, and that
Vitest runs any other `*.test.ts`. Each is a line to change, not a convention to obey.

## Where things live

*Empty until there is code. When a session settles a layout, record it here in a paragraph or two
(what lives where, and what may read or write what), and log why in the design log. Whatever the
layout, two properties are worth choosing on purpose: a way to step the game's state without
drawing it, so that tests and traces can run the game in Node with no browser, and a handle the
end-to-end tests can drive the game by.*

## Toolchain

```bash
npm ci              # install
npm run dev         # vite dev server on :3000
npm run build       # tsc --noEmit && vite build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src tests
npm run format      # prettier --write src tests
npm test            # vitest run
npm run test:e2e    # playwright test: boots the real game in headless Chromium
npm run verify      # typecheck + lint + unit + e2e
npm run verify:play # typecheck + the boot test: a build a person can sit down to
npm run test:e2e:slow  # the end-to-end suite a little slower than CI (Linux)
npm run shots -- <shots.mjs> <out-dir>  # posed frames, and a sheet of them
npm run takes -- <takes.mjs> <out-dir>  # the game's own sound, rendered and measured
npm run feedback:check [-- <out-dir>]  # the feedback page, driven in a browser
npm run template:link    # once: record which template commit this project began from
npm run template:update  # bring in what the template has gained since
cd infra && npm ci && npm run typecheck && npm test  # the feedback function's AWS side, as code
```

**The gate**, `npm run verify`, is every check a change passes before a pull request. With `src/`
and `tests/` empty, most of it has nothing to act on, and several tools exit non-zero on "no input
files" when run by hand; the first source file and the first test make the rest meaningful.

**The boot test**, `tests/e2e/boot.spec.ts`, is the first end-to-end test to write. It boots the
game, fails on any page or console error, draws one frame with everything that has a shader in it,
and then reads the GL error flag in the page: a shader that fails to compile is logged rather than
thrown, and GL errors reach the console late, as warnings an error listener does not see.
`npm run verify:play` is the typecheck and that test, seconds against the gate's minutes, and all a
build needs before someone plays it.

**The end-to-end tests** boot the real game in headless Chromium, which can usually run WebGL 2 in
software; check that it does where you work before you plan on it. Every run starts its own server,
on a port of its own that watches nothing, so worktrees can each run the suite at once
(`playwright.config.ts` says why). `npm run test:e2e:slow` runs the suite a little slower than CI's
runner: run it before a pull request, and set test time limits from it.

**`npm run shots`** poses the game in each state a script of the game's own names, and lays the
frames out on one sheet. **`npm run takes`** renders the game's own sound offline and measures it.
Both can put an older commit beside this one, and the `frame-check` and `sound-check` skills say
how to use them.

**The hook, CI and the merge driver.** The `pre-commit` hook and CI (`.github/workflows/ci.yml`)
both let a project with no source yet commit its documents, and their comments say how. Every
branch appends to the design log, so `scripts/merge-docs.mjs`, registered by `npm ci`, keeps both
sides' additions to the three documents and `CLAUDE.md`, and leaves anything else as an ordinary
conflict.

## Feedback from inside the game

A player at the hosted game can send a report from inside it: their words, the frame they were
looking at, and whatever of the world's state the game chooses to send. Each report lands as a
folder in a private repository you create, where a session can read it. The page, the AWS function
that commits a report, and the function's setup as code all ship here and work with any game.
[`feedback/README.md`](./feedback/README.md) says how to put it in a game, how to set it up, and
how to remove it if you don't want it.

## Staying in step with the template

Several games are built from this template, and each finds things the others need.

**From the template to a project.** `npm run template:update` brings in what the template has gained
since the project last did, through [Copier](https://copier.readthedocs.io), which needs
[uv](https://docs.astral.sh/uv/) or pipx. It is a three-way merge: what the project changed is kept,
what the template changed comes in, and where both changed the same lines the file is left with
conflict markers to read and resolve. `.copier-answers.yml` records the template commit the project
was last brought up to. `.github/workflows/template-update.yml` runs the update once a week and
opens a pull request with what came in; its header says what it needs.

**From a project to the template.** When a project learns something that would serve any game, it
opens an issue on the template's repository,
[`collagen-collective/ts-game-template`](https://github.com/collagen-collective/ts-game-template).
The template triages those issues, folds a lesson in once it clears the bar (`CLAUDE.md`, *When you
learn something*), and every project receives it at its next update. The `template-sync` skill has
both directions in detail.

## Why this template exists

It came out of a project that reached a thousand commits and fifty thousand lines of production
code, with as much again in tests, before anyone checked whether it was fun. Every automated check
passed throughout. The build at the end booted into two zones and one quest that was already
complete when it loaded. An audit found forty modules that nothing in the game reached, under six
thousand lines of passing tests, and an enemy damage event that nothing subscribed to, which had
left the player invulnerable in every green build for weeks. A throwaway prototype of under nine
hundred lines, judged on nothing but whether it was fun, was a better game.

So this template starts with no code, keeps the design in three short documents, and puts a build
the person can play seconds away. The principles in [`CLAUDE.md`](./CLAUDE.md) are what that
project and the games built since have taught. They are defaults: keep them, prune them or argue
with them, but do it deliberately, and log it.

## Words we use

These documents are mostly read by coding agents, and use a few terms of their own:

- **The person**: the human designing the game, as against the agents writing code. How the game
  feels is theirs to judge; agents measure, and the person decides.
- **Session**: one working conversation with a coding agent. A stretch of the person playing a build
  is a **sitting**, and a sitting written up in the design log is a **playtest**. A *play session*,
  in the Charter, is the player's, inside the game.
- **The gate**: `npm run verify`, everything a change must pass before a pull request.
- **PLAY, DECIDE, COLLISIONS, DEFER**: the kinds of entry in `OPEN-QUESTIONS.md`, by how each gets
  resolved. A *collision* is two decisions already made that contradict each other.
- **Instrument**: anything built to show or measure what the game is doing. A **readout** is an
  on-screen overlay of state the game otherwise doesn't show; a **trace** is the game's state over a
  few seconds, printed by running the simulation in Node; **frames** are screenshots of posed
  states, laid out on one image, **the sheet**; and **takes** are the same for sound.
- **Observation, finding and controls**: an observation is what came back (a number, a pass, a
  frame); it becomes a finding once it has been checked against controls, cases whose answer is
  already known. A negative control should show nothing, and a positive control a clear signal.

## Optional: the RTK agent tooling

The scaffold carries a setup for [RTK](https://github.com/rtk-ai/rtk), a third-party CLI proxy that
compresses command output to cut an agent's token use. Nothing here needs it, and without `rtk`
installed it does nothing. It is a `PreToolUse` hook in `.claude/settings.json`
(`.claude/hooks/rtk-rewrite.sh`), project filters in `.rtk/filters.toml`, and an install step in
`.claude/hooks/cloud-session-start.sh`; each file's comments say how it works. To remove it:

```bash
rm -rf .rtk .claude/hooks/rtk-rewrite.sh
# then delete the "PreToolUse" block from .claude/settings.json,
# and the "Install rtk" block, with the `rtk init -g` block after it,
# in .claude/hooks/cloud-session-start.sh
```

Separately, `.claude/settings.json` sets `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, an unrelated
opt-in Claude Code flag. Delete the `env` block if you don't want it.
