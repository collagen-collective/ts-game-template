# `<project>`

> **Made from a shared TypeScript game-project template.** Italic text is a prompt from the
> template, and anything in angle brackets is a placeholder: answer each one and delete it.
> ``rg '`<' README.md CLAUDE.md docs/`` lists whatever is still unfilled, except for two
> placeholders outside the Markdown: the `name` field in `package.json` and the page `title` in
> `index.html`. *Getting started*, below, has the steps. Delete this block when the repo is your
> own.

*One paragraph. What the player does, where they do it, and what the loop is. Concrete enough that
a stranger could picture a minute of play, and short enough to read before deciding whether to keep
reading. If it needs a second paragraph, the premise is not settled yet — say so in
[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md) and move on.*

## Getting started

This template is a starting point for a browser game built with a coding agent, such as Claude
Code, doing most of the typing and a person deciding what the game is and how it should feel. It
ships no game code; *What ships here*, below, says what it does ship.

1. **Make your repository** with GitHub's *Use this template* button, clone it, and run `npm ci`
   (Node 22 or later).
2. **Fill in the premise.** In Claude Code, run `/gettingstarted`: it interviews you, writes down
   what is settled, files what isn't as an open question, and records the first design-log entry.
   Without Claude Code, answer the italic prompts in this README and in `docs/` by hand. Either
   way, expect most of it to be open questions at first; that is the right answer for a new game.
3. **Link it to the template,** once: `npm run template:link`, then commit `.copier-answers.yml`.
   From then on the project can take in what the template learns later (*Staying in step with the
   template*, below).
4. **Build something playable.** The first code session chooses the layout (*Where things live*)
   and writes the first end-to-end test, `tests/e2e/boot.spec.ts` (*Toolchain*). After that, a
   build you can sit down and play is seconds away, and playing it is the point.

## The three documents

They divide by tense, and that is all there is to filing: anything you write either fits one of them
or replaces one of them.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)** is present tense: what is settled. What the game wants
  to be, what it has to be, the guidelines for the whole game, and the main systems. Each system
  states the problem it exists to solve before it states the answer. Its §5 says how we work.
- **[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md)** is future tense: what you still have to
  find out. Every entry says *how it gets answered*: by playing (PLAY), by discussion (DECIDE), or
  later (DEFER). That part matters most, because a question only playing can answer, such as
  whether a jump feels heavy, cannot be settled by handing someone a task.
- **[`docs/DESIGN-LOG.md`](./docs/DESIGN-LOG.md)** is past tense: what was tried and what happened,
  oldest first. Append only. Read end to end, it is the story of how the design got where it is,
  including the places where solving one problem changed the answer to another.

The Charter says *what* and *why*, never *how* to build it. That is deliberate: a charter that
describes the code goes out of date the first time the code changes, and once readers know one
section is out of date, they stop trusting the rest.

## Words we use

These documents were written over several games, mostly to be read by coding agents, and they use
some shorthand of their own. In order of how soon you will meet it:

- **The person** (or *the person you're working with*): the human designing the game, as against
  the agents writing code. Instructions to agents call you this. How the game feels is yours to
  judge; agents measure, and you decide.
- **Session**: one working conversation with a coding agent. Not a stretch of playing the game,
  which the Charter calls a *play session*.
- **Sitting**: one stretch of the person playing a build. *The first sitting* is the first time
  you played it. A sitting written up in the design log is a **playtest**.
- **Build**: a version of the game pushed for the person to play.
- **The gate**: `npm run verify`, everything a change must pass before a pull request. **The play
  gate** is `npm run verify:play`, the few seconds of checks a build needs before someone plays it.
- **Wired** (in *done means wired in*): reachable from the running game. A module with passing
  tests that nothing in the game calls is not wired in.
- **PLAY, DECIDE, COLLISIONS, DEFER**: the four kinds of entry in `OPEN-QUESTIONS.md`, by how each
  gets resolved. A *collision* is two decisions already made that contradict each other.
- **§5**: section 5 of the Charter, *How we work*, where the project's working guidelines live.
- **Instrument**: anything built to show or measure what the game is doing, such as a debug
  overlay, a count, a trace or a screenshot script. *The instrument is missing* means nobody can
  yet see the thing being argued about.
- **Readout**: an on-screen debug overlay that shows state the game otherwise doesn't (where the
  camera is, the world's seed, the value being tuned).
- **Trace**: a record of the game's state over a few seconds, made by running the simulation in
  Node without drawing it.
- **Frames, shots and the sheet**: screenshots of the game posed in a chosen state; `npm run shots`
  takes them and lays them out side by side on one image, the sheet.
- **Takes**: the same for sound. `npm run takes` renders the game's sounds to audio files and
  measures them, since an agent cannot listen.
- **Observation and finding**: an observation is what came back (a number, a pass or a fail, a
  frame); a finding is what it means once it has been checked against its controls.
- **Controls**: cases whose answer is already known, run beside a measurement. A negative control
  should show nothing and a positive control a clear signal, so that a blind instrument, or one
  that reports a signal that is not there, gets caught. The part of a scene or sound the person has
  said is right, measured beside a change, is one.
- **Seed**: the number a generated world is built from, so the same world can be built again.
- **Builder**: a sub-agent a session starts to build one piece of the work alongside others, usually
  in a git worktree of its own. *Fanning out* is starting several at once.
- **Brief**: the written handover to another agent: what to do, why, and what is known.
- **Round**: one cycle of plan, build and play.
- **Tell**: something a player does in play that was agreed in advance to mean something (opening
  the map often enough to mean *I'm lost*, say).
- **Paid for**: learned at a cost. A guideline a game *paid for* is one it wrote down after a
  mistake cost it time.
- **Carried back**: sent from a game to the template, so that every game gets it. A guideline that
  *comes home* is one this project sent that returns in a template update.

## What ships here, and what does not

`src/` and `tests/` are empty. There is no implementation to read, no architecture to conform to,
and no issue tracker. That is the starting point, not an accident.

- **`docs/`**: the three documents, above.
- **`scripts/`**: tools that work with any game. `shots.mjs`, `takes.mjs` and `e2e-slow.mjs` are
  described under *Toolchain*; `merge-docs.mjs` is the documents' merge driver, also there; and
  `template.mjs` keeps the project in step with the template (*Staying in step*).
- **`feedback/` and `infra/`**: an in-game feedback page and the function that delivers its reports
  (*Feedback from inside the game*).
- **`.claude/skills/`**: the agent workflows, `gettingstarted`, `design-log`, `frame-check`,
  `sound-check` and `template-sync`. In Claude Code each runs as a slash command or when the
  situation calls for it.

The build tooling is configured and installed: Vite, TypeScript, ESLint, Prettier, Vitest,
Playwright, husky. `index.html` names `/src/runtime/main.ts` as the entry point, and that file does
not exist yet; the Playwright config looks for tests in `tests/e2e/`, and Vitest runs any
`*.test.ts` under `src/` or `tests/` outside it. Those are the only assumptions the scaffold makes
about file layout, and each is a line to change rather than a convention to obey.

## Feedback from inside the game

A player at the hosted game can send a report from inside it: their words, the frame they were
looking at, and whatever of the world's state the game chooses to send. Each report lands as a
folder in a private repository you create, where a session can read it. The page, the AWS function
that commits a report, and the function's setup as code all ship here and work with any game.
[`feedback/README.md`](./feedback/README.md) says how to put it in a game, how to set it up, and
how to remove it if you don't want it.

## Where things live

*Empty until there is code. When a session settles a layout, record it here in a paragraph or two
(what lives where, and what may read or write what), and log why in the design log. Whatever the
layout, two properties are worth choosing on purpose: a way to step the game's state without
drawing it, so that tests and traces can run the game in Node with no browser, and a handle the
end-to-end tests can drive the game by. The Charter's §5 says what each is for.*

## Three inherited guidelines

*These came out of a previous project that reached a thousand commits and fifty thousand lines of
production code, with as much again in tests, before anyone had checked whether it was fun. The
build at the end booted into two zones and one quest that was already complete when it loaded.
Every automated check passed throughout.*

*They are inherited defaults, not this project's findings. Keep them, argue with them, or delete
this section — but do it deliberately, and log the decision.*

**Done means wired in, not written.** A feature is finished when a booted game lets a player do the
thing. A system with a passing test and no caller is not delivered, and neither the test suite nor
the type-checker can tell you so: unit tests import modules directly, so a module keeps a green test
long after nothing in the running game reaches it. The audit that produced this guideline found
forty unreachable modules under six thousand lines of passing tests, a combat HUD with zero
importers, and an enemy damage event nothing subscribed to — which had left the player invulnerable
in every green build for weeks.

**Play it, and test only what has stopped changing.** While you are still finding out how a system
should feel, it needs playing, not tests or documents. An agent's playtest is numbers and
screenshots: it can establish that something turns in eight seconds, not whether eight seconds
feels heavy or merely slow, and that judgment is yours, at the game. A throwaway prototype of under
nine hundred lines, written in one pass and judged on nothing but whether it was fun, was a better
game than the fifty thousand lines it was prototyping — it had no tickets, no tests, and no design
docs to conform to. And every test written against a system you are still tuning is a bet you will
pay to unwind: about six thousand lines of that bet came due at once.

**Ask whether every criterion could pass and the thing still be wrong.** If yes, the criteria are a
stand-in for a judgment, and it takes a person playing it to make that judgment. A question about
how something feels, split into tasks and handed out, comes back as pieces that each pass their
check and do not add up to the thing you were asking about.

The games built from this template since kept all of these, and learned more. The lessons that
apply to any game are in [`docs/CHARTER.md`](./docs/CHARTER.md) §5, under *Inherited*, each with its
reason. They are inherited on the same terms as these three.

## Toolchain

Requires Node 22+.

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

When to reach for each of these is in the Charter's §5, under the moment it is for. This section
says what each one does.

**The gate.** `npm run verify` is every check a change passes before it goes into a pull request.
With `src/` and `tests/` empty, most of it has nothing to act on, and several tools exit non-zero
on "no input files" when run by hand; only the unit tests pass from the start, because the merge
driver's tests are there. The first source file and the first test are what make the rest of it
meaningful.

**The boot test and the play gate.** The first end-to-end test to write is
`tests/e2e/boot.spec.ts`. It boots the game, fails on any page or console error, draws one frame
with everything that has a shader in it, and then reads the GL error flag in the page: a shader
that fails to compile is logged rather than thrown, and GL errors reach the console late, from
another process and as warnings, where a listener for errors does not see them.
`npm run verify:play` is the typecheck and that test, a few seconds against the full gate's
minutes, and it is all a build needs before someone plays it.

**The end-to-end tests** boot the real game in headless Chromium and drive it. Headless Chromium
can usually run WebGL 2 in software, so a 3D game can boot in CI and in a cloud session; check that
it does where you work before you plan on it. Every run starts its own Vite server on a port taken
from the checkout's path, off the dev server's 3000, so worktrees can each run the suite at once and
a run never tests another checkout's server. `E2E_PORT` chooses the port; two runs in one checkout
need one each. That server watches nothing (`E2E_SERVER`, in `vite.config.ts`), so a file saved
while the suite runs does not reload the page under a test: a run tests the code as it stood when it
began. `playwright.config.ts` says why each of these is so.

**`npm run test:e2e:slow`** runs the suite on two workers sharing one core, about 1.3 times slower
than CI's runner, which draws more slowly than a development machine. Run it before a pull request,
and set a test's time limit from it.

**`npm run shots`** takes screenshots. A script the game provides puts the game into each state
worth seeing and names the frame; the tool serves the game on its own port, reports anything that
breaks in the page, and lays the frames out side by side on one image, the sheet. With
`--tree before=@<commit>`, it puts an older commit's frames beside this checkout's, one row per
shot. `scripts/shots.mjs` says what the game's script exports. The `frame-check` skill is how an
agent uses it.

**`npm run takes`** does the same for sound, since an agent cannot hear. A script the game provides
renders each sound worth hearing into an `OfflineAudioContext`, through the game's own audio code,
and names the recording, the take. The tool writes each take as a WAV, measures it (loudness by
ITU-R BS.1770, peak and clipping, when it starts and how long it rings, its energy by octave, its
stereo width: `scripts/lib/listen.mjs`), and lays the takes out on a sheet of waveforms and
spectrograms. With `--tree before=@<commit>` it prints an older commit's numbers beside these, and
`--match -20` writes copies of equal loudness for the person to compare by ear. The `sound-check`
skill is how an agent uses it.

**The pre-commit hook and CI.** A husky `pre-commit` hook runs `tsc --noEmit` and `lint-staged`.
Before the first source file exists, tsc has nothing to check and reports that as an error; the hook
lets a commit through when that is all tsc has to say, so a new project can commit its documents
from the first day. CI (`.github/workflows/ci.yml`) runs on pull requests: typecheck, a Prettier
check, ESLint, the unit tests, and the end-to-end suite, keeping what a failed end-to-end run left
in `test-results/` for a week. It makes the same allowance as the hook, and shows it: until the
repository has TypeScript besides its root config files, in any folder, its typecheck-and-lint job
and its end-to-end job show as skipped rather than passed. Once there is source they run, and the
end-to-end job fails until the boot test exists.

**The documents' merge driver.** Every branch appends to the design log, so without help nearly
every merge of main conflicts there, and often in the Charter's §5 too. `scripts/merge-docs.mjs`
keeps both sides' additions, the log's entries in date order, and leaves anything else as an
ordinary conflict: a passage both sides changed is still there to be read. `npm ci` registers it,
through `prepare`. Where it is not registered, GitHub's merge button included, the documents merge
as they always did.

## Staying in step with the template

Several games are built from this template, and each finds things the others need. The template is
how a lesson travels from one game to the others, and both directions are meant to be routine. Which
game sent what is in the template's own history: its pull requests and commit messages.

**From the template to a project.** `npm run template:update` brings in what the template has
gained since the project last did, as a three-way merge, file by file, through
[Copier](https://copier.readthedocs.io) (the same idea as `cruft`, for templates that are themselves
working repositories). What the project changed is kept; what the template changed comes in; where
both changed the same lines, the file is left with conflict markers and marked unmerged, as after a
`git merge`, to be read and resolved. A file or a passage the project deleted stays deleted. The
three documents get their merge driver here too, so a guideline the template added beside one the
project added keeps both. `package-lock.json` is never merged: `npm install` rebuilds it from the
merged `package.json`. The update needs [uv](https://docs.astral.sh/uv/) or pipx to run Copier,
and nothing else installed; it prints what came in, by the template's commit messages, and what is
left to resolve.

`.copier-answers.yml` records the template commit the project was last brought up to. A project
made with GitHub's *Use this template* button has none until `npm run template:link` writes it, by
finding the template commit the project's first commit was made from (*Getting started*, step 3).

`.github/workflows/template-update.yml` runs the update once a week and opens a pull request with
what came in, conflicts listed in its description, so a project hears of a finding without anyone
remembering to look. It needs a repository setting and, for CI to run on that pull request, a
token; the workflow's header says which.

**From a project to the template.** A lesson goes back as a pull request to the template, written
the way the guidelines already there are: only what applies to any game, under the name of the game
that learned it, with what it cost there, and without that game's own engine or libraries. Once
merged, every other project receives it at its next update. The `template-sync` skill has both
directions in detail, including what to do when the update brings a project's own guideline back to
it.

The template's own repository is
[`collagen-collective/ts-game-template`](https://github.com/collagen-collective/ts-game-template).
`copier.yml` there says what is copied and what is not; projects never see it.

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
  template used to put a generated block of instructions in `CLAUDE.md` instead; an earlier game
  replaced it with this hook, and an agent without RTK no longer reads an instruction it cannot
  follow.)
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
