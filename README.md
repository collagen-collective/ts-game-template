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
ships no game code: it ships three design documents, a configured toolchain, a few game-agnostic
tools, and the rules earlier games learned the hard way.

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

They divide by tense, and that is the whole filing rule: anything you write either fits one of them
or replaces one of them.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)** is present tense: what is settled. What the game wants
  to be, what it has to be, the rules that hold everywhere, and the main systems. Each system
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
- **§5**: section 5 of the Charter, *How we work*, where the project's working rules live.
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
- **Paid for**: learned at a cost. A rule a game *paid for* is one it wrote down after a mistake
  cost it time.
- **Carried back**: sent from a game to the template, so that every game gets it. A rule that
  *comes home* is one this project sent that returns in a template update.

## What ships here, and what does not

`src/` and `tests/` are empty. There is no implementation to read, no architecture to conform to,
and no issue tracker. That is the starting point, not an accident.

- **`scripts/`** holds the merge driver for the three documents; `template.mjs`, which keeps the
  project in step with the template; and three tools that work with any game: `shots.mjs`, which
  takes posed screenshots, `takes.mjs`, which renders and measures the game's own sound, and
  `e2e-slow.mjs`, which runs the end-to-end tests at about CI's speed. The game supplies a small
  script for each that says what to capture.
- **`feedback/` and `infra/`** are an in-game feedback page, the function that takes a player's
  report from the hosted game and commits it to a private repository, a stand-in for that function
  on the dev server, and the function's AWS setup as code (*Feedback from inside the game*,
  below). They know nothing about any game either: the game hands the page its canvas and whatever
  state it wants to send.
- **`.claude/skills/`** holds the agent workflows: `gettingstarted`, `design-log`, `frame-check`,
  `sound-check` and `template-sync`. In Claude Code each runs as a slash command or when the
  situation calls for it.

The build tooling is configured and installed: Vite, TypeScript, ESLint, Prettier, Vitest,
Playwright, husky. `index.html` names `/src/runtime/main.ts` as the entry point and that file does
not exist yet; the Playwright config looks for tests in `tests/e2e/`, and Vitest runs any
`*.test.ts` under `src/` or `tests/` outside it. Those are the only assumptions the scaffold makes
about file layout, and each is a line to change rather than a convention to obey.

## Feedback from inside the game

A player at the hosted game, away from the session, can send a report from inside it: their words,
the frame they were looking at, and whatever of the world's state the game chooses to send. Each
report lands as one folder, `inbox/<when>_<who>/`, in a private repository of the project's
making, where a session can read it. All of it ships here, and none of it knows any game:

- **`feedback/page/`** is the page. At the pause it keeps the frame the player is looking at, HUD
  and all; from the game's menu it opens over the game, first to mark the frame (a ring, a stroke,
  undo) and then to say what kind of thing it is, write as much or as little as they like, and
  untick anything they would rather not send. Nothing on it is required. It reads a gamepad (the
  browser's standard mapping) and the keys and mouse itself while it is open, keeps the keys from
  the game, and closes only once every press made on it is let go. It looks neutral, and a game
  restyles it from its own stylesheet (`style.ts` lists the custom properties).
  `feedback/demo/` is a stand-in game that uses it, to try on `npm run dev` at `/feedback/demo/`,
  and `npm run feedback:check` drives the demo in a browser, on both devices and through a refusal.
- **`feedback/handler.mjs`** is an AWS Lambda function, reached at its function URL. It holds the
  GitHub token, which a page must never hold, takes a report only with a key it knows, and commits
  it to the inbox as one commit. It needs no packages, so it seldom changes: in an earlier game, a
  marked copy of the frame and a ten-second trace came after it was written, as two more files, and
  it took them unchanged. Its tests are beside it and run with `npm test`.
- **The dev server's inbox** (`vite.config.ts`) reads a report the same way and writes it to
  `feedback-inbox/`, which git ignores, so the page can be played and its end-to-end tests can send
  before any of the AWS side exists, and nothing a session tries reaches the real inbox.
- **`infra/`** is the function's AWS side as code, an [AWS CDK](https://docs.aws.amazon.com/cdk/)
  app: the function, its address, its log, and the secret it reads. It is a package of its own, so
  that nothing else installs the CDK (about 250 MB): not the game's `npm ci`, CI's other jobs, a
  cloud session, or the hosted game's build. CI typechecks it, the handler with it, and synthesizes
  the stack in its tests; nothing in CI deploys, and a cloud session, having no AWS credentials,
  can change and test it but not deploy it.

A game that wants none of it deletes `feedback/`, `infra/`, the `devInbox` plugin in
`vite.config.ts`, and the lines naming them in `vitest.config.ts`, `eslint.config.js`,
`package.json` and `.gitignore`; CI skips its checks of each once its folder is gone.

**Putting it in a game.** The game makes one page, hands it the frame and what it knows at the
pause, and opens it from a menu that offers FEEDBACK only where `available` says it can be sent:

```ts
import { FeedbackPage, Trace } from "../feedback/page/index.ts";

const feedback = new FeedbackPage({ build: __BUILD__, onClose: () => pauseMenu.focus() });
const trace = new Trace<Sample>(10, 0.1); // each step: trace.offer(time, () => sampleOf(world))

function pause(): void {
    // Before the menu covers the HUD. A WebGL canvas needs preserveDrawingBuffer: true for this.
    feedback.keep(canvas, {
        title: "The Bridge",
        subtitle: "4:12 into the run · the world is paused",
        parts: [
            {
                id: "where",
                label: "the bridge, 4:12 into the run, and the last ten seconds",
                lines: ["**Where:** the bridge, 4:12 into the run"],
                data: { player: { x, y }, seed },
                file: { name: "trace.json", data: trace.all() },
            },
        ],
    }, hud);
    pauseMenu.open({ feedback: feedback.available });
}
// FEEDBACK in the pause menu: feedback.open("pad"), or "keys", whichever chose it, so the page
// names that device's buttons from the start. While feedback.isOpen, the menu takes no input.
```

Each part is a line on the page the player can untick, its `lines` go into `report.md`, its `data`
into `state.json` under its `id`, and its `file` beside them; a part saying which build and which
browser is added unless `browser: false`. What the parts hold is the game's to choose: Extra
Sapien sent the place and the run, the world as its tests read it, the settings and the frame rate,
and the last ten seconds ten times a second. The kinds a player picks from, the words in the empty
box, and how the frame is kept are options too (`FeedbackOptions`). The key is kept under
`storageKey`, which games that share an origin should each set.

**What the page sends,** for a game that would rather make its own. One `POST` with a JSON body,
sent as `text/plain` so that the browser asks no preflight: `{ "key": "…", "stamp":
"2026-10-06_213105", "files": { "report.md": "<base64>", … } }`. `report.md` is required; up to six
files, each a plain name such as `frame.jpg` or `state.json` (`LIMITS` in the handler), five
megabytes in all. The answer is `{ "ok": true, "folder": "…" }`, or `{ "ok": false, "error": "…" }`
with what was wrong in words, worth showing the player as it is. A page sends to `/__feedback` when
`import.meta.env.DEV` is true, and otherwise to `import.meta.env.VITE_FEEDBACK_URL`, offering
feedback only when that is set and it holds a key. The key reaches it in the player's link, `?key=`;
the page keeps it in `localStorage` and takes it out of the address bar, so a bookmark of the open
game holds none, and the player keeps the link itself. `stamp` is the sender's clock, which names
the folder; a missing one takes the function's.

**Setting it up** is two things made by hand in GitHub, and the rest is code:

1. **The inbox.** A new private repository, made with a README (*Add a README*), so that it has a
   `main` branch for the first report to be committed on top of.
2. **A token for it.** GitHub's *Settings*, *Developer settings*, *Fine-grained tokens*: access to
   the inbox repository only, and one permission, *Contents: Read and write*. An organization may
   ask an owner to approve it. Read the token's page once it is made: it should list *Contents:
   Read and write* and not be waiting for approval. In an earlier game, a token that could read the
   inbox but not write to it failed at the first write, and the send said *GitHub answered 403 to
   /git/blobs: Resource not accessible by personal access token*. A token expires on the date it is
   given; after that a send fails and says so.
3. **The function.** `infra/config.ts` is the only file a project fills in: the stack's name, the
   region, the inbox repository, and `origins`, the hosted game's address, which the function's
   CORS lets read its answers (`https://main.<app id>.amplifyapp.com`, say, with no slash at the
   end). A synth refuses the placeholders, and an origin with a path or a slash at the end. Then,
   with Node 22.18 or later and AWS credentials for the account (`aws configure`, or
   `aws sso login`):

   ```bash
   cd infra
   npm ci               # the CDK, for this folder alone
   npx cdk bootstrap    # once per account and region: where CDK keeps the function's zip
   npm run diff         # what a deploy would change, before it does
   npm run deploy       # asks before it changes any permission, then makes or updates it all
   ```

   The deploy makes `feedback/handler.mjs` alone the function's code, on Node 22, with 30 seconds
   and 256 MB; a function URL with auth type NONE, and CORS allowing the game's address and POST;
   and its log, kept 90 days. Each of those was a console default in an earlier game that broke its
   first live send or nearly did: Lambda's 3-second timeout cut the send off partway, being ten
   calls to GitHub one after another, and a 1.1 MB report used 112 MB of the default 128. The
   address is open to anyone who has it, and the key is the lock: the function turns away a report
   whose key it does not know before it asks GitHub for anything. Last, the deploy writes the
   function's address into `.env.production` at the root, as `VITE_FEEDBACK_URL`.
4. **The token and the keys,** into the secret the function reads. From `infra/`:

   ```bash
   npm run secret -- token          # paste the token from step 2; it is not shown
   npm run secret -- key <name>     # makes <name>'s key, and prints their link
   npm run secret -- list           # whether the token is set, who holds a key, and their links
   npm run secret -- remove <name>  # takes <name>'s key away
   ```

   The function reads the secret again within five minutes of a change, so none of these needs a
   deploy. A key is 32 letters and digits, which a link carries whole, and the name it is given is
   the end of the folder each of their reports lands in. `key` again for the same name retires the
   old key. To try it first, make a key for yourself and send a report from your own link.
5. **The game.** Commit `.env.production`: Vite reads it when it builds the hosted game, and the
   dev server does not, so `npm run dev` keeps its own inbox. An environment variable of the same
   name where the game is built would win over the file.

A change to `feedback/handler.mjs` or to `infra/` goes live with `npm run deploy` again. The
handler still reads `GITHUB_TOKEN` and `KEYS` from its environment when no secret is named, so a
function made by hand in the console works too; `npm run secret -- keys` takes such a function's
`KEYS` all at once, so that links already given out keep working after a move to the stack.

What a report is for is the project's to settle with the person: who triages the inbox, and what
the game does about a report. One earlier game triaged its first reports with its designer before
writing down how, and only then let a scheduled agent sort what arrives.

## Where things live

*Empty until there is code. When a session settles a layout, record it here in a paragraph or two
(what lives where, and what may read or write what), and log why in the design log. Whatever the
layout, one property is worth choosing on purpose: a way to step the game's state without drawing
it, so that tests and traces can run the game in Node with no browser. In an earlier game, its
traces and most of its tests depended on that.*

## Four inherited rules

*These came out of a previous project that reached a thousand commits and fifty thousand lines of
production code, with as much again in tests, before anyone had checked whether it was fun. The
build at the end booted into two zones and one quest that was already complete when it loaded.
Every automated check passed throughout.*

*They are inherited defaults, not this project's findings. Keep them, argue with them, or delete
this section — but do it deliberately, and log the decision.*

**Done means wired in, not written.** A feature is finished when a booted game lets a player do the
thing. A system with a passing test and no caller is not delivered, and neither the test suite nor
the type-checker can tell you so: unit tests import modules directly, so a module keeps a green test
long after nothing in the running game reaches it. The audit that produced this rule found forty
unreachable modules under six thousand lines of passing tests, a combat HUD with zero importers, and
an enemy damage event nothing subscribed to — which had left the player invulnerable in every green
build for weeks.

**Play it.** While you are still finding out how a system should feel, it needs playing, not tests
or documents. A
throwaway prototype of under nine hundred lines, written in one pass and judged on nothing but
whether it was fun, was a better game than the fifty thousand lines it was prototyping — it had no
tickets, no tests, and no design docs to conform to. When you write down a playtest, write down
what *worked*. Defect lists are the easy half, and they are not the half that tells you what to
protect.

**Ask whether every criterion could pass and the thing still be wrong.** If yes, the criteria are a
stand-in for a judgment, and it takes a person playing it to make that judgment. A question about
how something feels, split into tasks and handed out, comes back as pieces that each pass their
check and do not add up to the thing you were asking about.

**Test what has stopped changing.** Every test written against a system you are still tuning is a
bet you will pay to unwind. About six thousand lines of that bet came due at once.

The games built from this template since kept all four, and learned more. The lessons that apply to
any game are in [`docs/CHARTER.md`](./docs/CHARTER.md) §5, under *Inherited*, each with its reason.
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
npm run feedback:check [-- <out-dir>]  # the feedback page, driven in a browser
npm run template:link    # once: record which template commit this project began from
npm run template:update  # bring in what the template has gained since
cd infra && npm ci && npm run typecheck && npm test  # the feedback function's AWS side, as code
```

`npm run verify` is the gate: every check a change passes before it goes into a pull request. With
`src/` and `tests/` empty it does not pass yet: most steps have nothing to act on, and several tools
treat "no input files" as an error. The unit tests pass from the start, because the merge driver's
tests are there. Adding the first source file and the first test is what makes the rest of it
meaningful.

The end-to-end tests are the ones that say a player can do a thing: they boot the real game in
headless Chromium and drive it. Headless Chromium ran WebGL 2, drawing in software, in an earlier
game's cloud sessions and its CI, and again in a cloud session when these files were written, so a
3D game can boot there. Check it where you work before planning on it, as that game did: the whole
test strategy turned on it, the check took two minutes, and it would have cost a day the other way.
The first test to write is `tests/e2e/boot.spec.ts`, which boots the game, fails on any page or
console error, draws one frame with everything that has a shader in it, and reads the GL error flag,
since GL errors reach the console late and as warnings. `npm run verify:play` is the typecheck and
that test, and a build pushed for a person to play waits only on that, not on the whole gate: one
game's gate took five minutes even after it had been cut from fifteen, and every time someone sat
down to play, they used to wait for it. The full gate runs while they play; anything it finds is
reported and fixed rather than left for the next push, and once there is code, nothing goes into a
pull request without it.

Every end-to-end run starts its own Vite server, on a port taken from the checkout's path and off
the dev server's 3000, so worktrees can each run the suite at once and a run never tests another
checkout's server. `E2E_PORT` chooses the port; two runs in one checkout need one each. That server
watches nothing (`E2E_SERVER`, in `vite.config.ts`), so a file saved while the suite runs does not
reload the page under whichever test is running: a run tests the code as it stood when it began.
`playwright.config.ts` says why each of these is so.

CI's runner draws more slowly than a development machine, so a time limit that is comfortable
locally can be too tight on CI. In one game built from this template, two tests
passed every run in a four-core cloud session and failed on CI, whose runner drew 2.8 times slower.
`npm run test:e2e:slow` runs the suite on two workers sharing one core, about 1.3 times slower than
CI, and failed the same two tests the same way. With their limits raised, it found a third that CI
was passing with almost no margin: 1.5 minutes against a limit of 90 seconds. Run it before
setting a time limit, and before a pull request.

Screenshots are part of verification, and `npm run shots` takes them. A script the game provides
puts the game into each state worth seeing and names the frame. The tool serves the game on its own
port, reports anything that breaks in the page, and lays the frames out side by side on one image,
the sheet. With `--tree before=@<commit>`, it puts an older commit's frames beside this checkout's,
one row per shot, for a before-and-after. `scripts/shots.mjs` says what the game's script exports;
what hooks the game offers it is the game's choice. The `frame-check` skill is how an agent uses it
on a report of something that looks wrong. Two games built one of these for themselves before it
shipped here, and in one of them a tour of the whole game in frames found 22 defects with every test
green.

An agent cannot hear, so the sound gets the same treatment, from `npm run takes`. A script the game
provides renders each sound worth hearing into an `OfflineAudioContext`, through the game's own
audio code, and names the recording, the take. The tool serves the game as `shots.mjs` does (the two
share `scripts/lib/trees.mjs`), writes each take as a WAV, measures it (loudness by ITU-R BS.1770,
peak and clipping, when it starts and how long it rings, its energy by octave, its stereo width:
`scripts/lib/listen.mjs`), and lays the takes out on a sheet of waveforms and spectrograms. With
`--tree before=@<commit>` it prints the numbers side by side, and `--match -20` writes copies of
equal loudness for the person to compare by ear. The `sound-check` skill is how to use it on a
report of something that sounds wrong. Four games built from this template each built a
renderer and a measurer of their own before this one; it was tried on two of them before it shipped.

A husky `pre-commit` hook runs `tsc --noEmit` and `lint-staged`. Before the first source file
exists, tsc has nothing to check and reports that as an error; the hook lets a commit through when
that is all tsc has to say, so a new project can commit its documents from the first day. CI
(`.github/workflows/ci.yml`) runs typecheck, a Prettier check, ESLint, the unit tests, and the
end-to-end suite on pull requests, and keeps what a failed end-to-end run left in `test-results/`
for a week. It runs on pull requests only, since every push in a session is already checked with
`npm run verify`; on GitHub it is the check before a merge. CI makes the same allowance as the hook,
and shows it: until the repository has TypeScript besides its root config files, its
typecheck-and-lint job and its end-to-end job are skipped, and show as skipped rather than passed.
TypeScript in any folder counts, so a project that moves its code out of `src/` is checked rather
than skipped. Once there is source they run, and the end-to-end job fails until the boot test
exists.

The three documents merge themselves where both sides only added to them. Every branch appends to
the design log, so in one game every merge of main into a branch conflicted there, seven of seven,
and often in the Charter's §5 as well. `scripts/merge-docs.mjs` keeps both sides' additions, the
log's entries in date order, and leaves anything else as an ordinary conflict: a passage both sides
changed is still there to be read. `npm ci` registers it, through `prepare`. Where it is not
registered, GitHub's merge button included, the documents merge as they always did.

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
three documents get their merge driver here too, so a rule the template added beside one the
project added keeps both. `package-lock.json` is never merged: `npm install` rebuilds it from the
merged `package.json`. The update needs [uv](https://docs.astral.sh/uv/) or pipx to run Copier,
and nothing else installed; it prints what came in, by the template's commit messages, and what is
left to resolve.

`.copier-answers.yml` records the template commit the project was last brought up to. A project
made with GitHub's "Use this template" button, or before the template could be updated from, has
none: `npm run template:link` writes it, once, by finding the template commit the project's first
commit was made from. Commit it, and every update after that is one command.

`.github/workflows/template-update.yml` runs the update once a week and opens a pull request with
what came in, conflicts listed in its description, so a project hears of a finding without anyone
remembering to look. It needs a repository setting and, for CI to run on that pull request, a
token; the workflow's header says which.

**From a project to the template.** A lesson goes back as a pull request to the template, written
the way the rules already there are: only what applies to any game, under the name of the game that
learned it, with what it cost there, and without that game's own engine or libraries. Once merged,
every other project receives it at its next update. The `template-sync` skill has both directions in
detail, including what to do when the update brings a project's own rule back to it.

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
