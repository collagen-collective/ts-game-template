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

`src/` and `tests/` are empty. There is no implementation to read, no architecture to conform to,
and no issue tracker. That is the starting condition, not an accident. `scripts/` holds the merge
driver for the three documents, and three instruments that know nothing about any game:
`shots.mjs`, which captures posed frames, `takes.mjs`, which renders and measures the game's own
sound, and `e2e-slow.mjs`, which runs the end-to-end suite at about CI's speed. The game supplies
what they drive.

The build tooling is configured and installed: Vite, TypeScript, ESLint, Prettier, Vitest,
Playwright, husky. `index.html` names `/src/runtime/main.ts` as the entry point and that file does
not exist yet; the Playwright config looks for tests in `tests/e2e/`, and Vitest runs any
`*.test.ts` under `src/` or `tests/` outside it. Those are the file-layout assumptions the scaffold
makes, and each is a line to change rather than a convention to obey.

Some of what ships was carried back from dragon, a game built from this template, after its first
two weeks. The Charter's §5 holds the rules it paid for that apply to any game. `CLAUDE.md` holds
what it found about working with the person and with other agents. The `design-log` skill holds
how its log came to be written, playtests above all. And the end-to-end setup, the play gate, the
documents' merge driver and the pull-request template are its tooling, each with the reason it
exists written beside it.

Extra Sapien, a second game built from it, carried back more after its first two days:
- the frame harness, which it and dragon had each built for themselves, and the `frame-check` skill;
- the slow run;
- §5's rules for running builders side by side.

Kyle on Duty, a third, carried back more after its first two days and its first sitting:
- the sound harness, `takes.mjs`, and the `sound-check` skill: all four games built from the
  template had each built a renderer and a measurer of their own sound;
- §5's rules for putting several questions to the person at once, checking a builder's worktree
  before it starts, playing the whole game with a bot before frames, and keeping what the person
  called right in the run as the control, most of them paid for by the other games too.

## Where things live

*Empty until there is code. When a session settles a layout, record it here in a paragraph or two
(what lives where, and what may read or write what), and log why in the design log. Whatever the
layout, one property is worth choosing on purpose: a way to step the game's state without drawing
it. Dragon's traces, and most of its tests, depended on that.*

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
proxy for a judgment, and it takes a person playing it to make that judgment. Feel-shaped questions
routed through a queue come back as correct fragments that do not compose, verified by gates that
cannot see the thing you were actually asking about.

**Test what has stopped changing.** Every test written against a system you are still tuning is a
bet you will pay to unwind. About six thousand lines of that bet came due at once.

Dragon, a game built from this template, kept all four: its brief asked for the same things in its
own words. In its first two weeks it paid for more, and the ones that apply to any game are in
[`docs/CHARTER.md`](./docs/CHARTER.md) §5, under *Inherited from dragon*, each with a line of what
it cost. Extra Sapien, a second game, added a few of its own under *Inherited from Extra Sapien*.
They are inherited on the same terms as these four.

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
```

`npm run verify` is the gate. With `src/` and `tests/` empty it does not pass yet: most steps have
nothing to act on, and several tools treat "no input files" as an error. The unit tests pass from
the start, because the merge driver's tests are there. Adding the first source file and the first
test is what makes the rest of it meaningful.

The end-to-end tests are the ones that say a player can do a thing: they boot the real game in
headless Chromium and drive it. Headless Chromium ran WebGL 2, drawing in software, in dragon's
cloud sessions and its CI, and again in a cloud session when these files were written, so a 3D game
can boot there. Check it where you work before planning on it, as dragon did: the whole test
strategy turned on it, the check took two minutes, and it would have cost a day the other way. The
first test to write is `tests/e2e/boot.spec.ts`, which boots the game, fails on any page or console
error, draws one frame with everything that has a shader in it, and reads the GL error flag, since
GL errors reach the console late and as warnings. `npm run verify:play` is the typecheck and that
test, and a build pushed for a person to play waits on it rather than on the gate: dragon's gate
took five minutes even after it had been cut from fifteen, and every sitting used to wait for it.
The gate runs while they play, anything it finds is said and fixed rather than left for the next
push, and once there is code, nothing goes into a pull request without it.

Every end-to-end run starts its own Vite server, on a port taken from the checkout's path and off
the dev server's 3000, so worktrees can each run the suite at once and a run never tests another
checkout's server. `E2E_PORT` chooses the port; two runs in one checkout need one each. That server
watches nothing (`E2E_SERVER`, in `vite.config.ts`), so a file saved while the suite runs does not
reload the page under whichever test is running: a run tests the code as it stood when it began.
`playwright.config.ts` says why each of these is so.

CI's runner draws more slowly than a development machine, so a test's time limit set from a run
there is set for the faster machine. In Extra Sapien, a game built from this template, two tests
passed every run in a four-core cloud session and failed on CI, whose runner drew 2.8 times slower.
`npm run test:e2e:slow` runs the suite on two workers sharing one core, about 1.3 times slower than
CI, and failed the same two tests the same way. With their limits raised, it found a third that CI
was passing with almost nothing in hand: 1.5 minutes against a limit of 90 seconds. Run it before
setting a time limit, and before a pull request.

Screenshots are part of verification, and `npm run shots` takes them. A script of the game's own
drives the game into each state worth seeing and names the frame. The harness serves the game, says
what breaks in the page, and lays the frames out on one sheet. With `--tree before=@<commit>`, it
puts an older commit's frames beside this checkout's, a row a shot. `scripts/shots.mjs` says what
the game's script exports. What the game offers it to drive is the game's choice. The
`frame-check` skill is how to use it on a report of something that looks wrong. Dragon and Extra
Sapien each built one of these before it shipped here, and in Extra Sapien a tour of the whole game
in frames found 22 defects with every test green.

An agent cannot hear, so the sound gets the same treatment, and `npm run takes` gives it. A script
of the game's own renders each sound worth hearing into an `OfflineAudioContext`, through the
game's own code, and names the take. The harness serves the game as `shots.mjs` does (the two share
`scripts/lib/trees.mjs`), writes each take as a WAV, measures it (loudness by ITU-R BS.1770, peak
and clipping, when it starts and how long it rings, its octaves, how wide it is:
`scripts/lib/listen.mjs`), and lays the takes out on a sheet of waveforms and spectrograms. With
`--tree before=@<commit>` it prints the numbers side by side, and `--match -20` writes copies of
equal loudness for the person to compare by ear. The `sound-check` skill is how to use it on a
report of something that sounds wrong. Dragon, Extra Sapien, sandworm and Kyle on Duty each built a
renderer and a measurer of their own before this one; it was tried on two of them before it shipped.

A husky `pre-commit` hook runs `tsc --noEmit` and `lint-staged`. Before the first source file
exists, tsc has nothing to check and reports that as an error; the hook lets a commit through when
that is all tsc has to say, so a new project can commit its documents from the first day. CI
(`.github/workflows/ci.yml`) runs typecheck, a Prettier check, ESLint, the unit tests, and the
end-to-end suite on pull requests, and keeps what a failed end-to-end run left in `test-results/`
for a week. It runs on pull requests only, since every push in a session is already gated on
`npm run verify`; on GitHub it is the check before a merge. CI is let off the same way, and says
so: until the repository has TypeScript besides its root config files, its typecheck-and-lint job
and its end-to-end job are skipped, and show as skipped rather than passed. TypeScript in any
folder counts, so a project that moves its code out of `src/` is checked rather than skipped. Once
there is source they run, and the end-to-end job fails until the boot test exists.

The three documents merge themselves where both sides only added to them. Every branch appends to
the design log, so in dragon every merge of main into a branch conflicted there, seven of seven, and
often in the Charter's §5 as well. `scripts/merge-docs.mjs` keeps both sides' additions, the log's
entries in date order, and leaves anything else as an ordinary conflict: a passage both sides
changed is still there to be read. `npm ci` registers it, through `prepare`. Where it is not
registered, GitHub's merge button included, the documents merge as they always did.

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
