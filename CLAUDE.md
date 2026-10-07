# CLAUDE.md

This file exists for agent platforms that read `CLAUDE.md`.

Throughout, *the person you're working with* (or *the person*) is the human designing the game.
They decide what the game is and judge how it feels; you build, measure and keep the record. These
documents use some shorthand of their own (*sitting*, *the gate*, *instrument*, *builder*, *paid
for*); the README's *Words we use* defines each. The examples below come from earlier games built
from this template; *a designer* in them is the person who worked on that game.

## The project

*`<One paragraph: what the game is, what the player does, and what the loop is. Replace this
prompt.>`*

## The three documents

They divide by tense, and tense is how anything new is filed: it either fits one or replaces one.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)**: present tense, what is settled. Read this first.
- **[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md)**: future tense, what is unresolved.
  Entries tagged PLAY cannot be settled by argument; do not decompose them into tasks.
- **[`docs/DESIGN-LOG.md`](./docs/DESIGN-LOG.md)**: past tense, what was tried and what happened.
  Append only. Never edit an old entry to agree with current thinking. The `design-log` skill says
  how an entry is written.

The Charter states *what* and *why*, never *how* the game is built. That is deliberate. Its
opening note says what to read before proposing a plan.

## The moments in the Charter

Most of how we work is in the Charter's §5, grouped by the moment each guideline is for, and a
moment's guidelines are read when it comes, not once at the start of a session. Whenever you are
about to do one of these, read its guidelines in §5 first:

- ask the person something;
- build something;
- measure, test or trust a result;
- hand them a build, or write up what they played;
- plan, merge or hand over;
- run several builders at once.

What holds at every moment stays in this file, with how to find your way around the repo: *How to
work in this repo*, *Working together* and the four inherited guidelines, below.

## How to work in this repo

**There is no implementation to read.** `src/` and `tests/` are empty on purpose, and `scripts/`
holds the documents' merge driver, the template's update script (`template.mjs`), and three tools
that work with any game (`shots.mjs`, `takes.mjs` and `e2e-slow.mjs`). `feedback/` and `infra/` are
an in-game feedback page that also works with any game (the game mounts it and hands it its canvas),
the function that commits a player's report to a private repository, and that function's AWS setup
as code (README, *Feedback from inside the game*). Do not assume a missing module was deleted by
mistake, and do not go looking for prior art in the tree.

**Architecture is yours to choose.** There are no file-layout guidelines, module conventions, or
state-management patterns recorded anywhere here, and that is intentional. `index.html` names
`/src/runtime/main.ts` as the entry point; that is a line to change, not a convention to obey.
Don't invent a convention and then cite it as if it were established. When you settle one, say so
plainly: the README's *Where things live* is the record of it, and the design log says why. Two
properties are recommended, not required, for what they made possible in an earlier game built from
this template: a way to step the game's state without drawing it, and a handle the end-to-end tests
can drive the game by. The next two guidelines say what each is for; how to provide them is yours.

**There is no issue tracker.** No tickets, no ticket IDs, no backlog tool. Plans live in the Charter
and in the session you are working in. Don't reference or fabricate ticket identifiers.

**This repo was scaffolded from a template.** Prompts in *italics*, and placeholders in angle
brackets, are unanswered template text rather than design decisions. Don't treat them as settled
and don't quietly write around them — if a plan depends on one, resolving it is the first step of
the plan. ``rg '`<' README.md CLAUDE.md docs/`` lists what is still unfilled. The `/gettingstarted`
skill walks the person you're working with through resolving them; suggest it if a session opens
against an unfilled template, and don't answer the prompts on their behalf in the meantime.

**Don't rewrite the Charter to match the code you just wrote.** It is upstream of the
implementation. If the implementation forces a design change, raise it with the person you're
working with.

**How it feels is found by playing it.** An agent's playtest is numbers and screenshots; it can
establish that something turns in eight seconds, not whether eight seconds feels heavy or merely
slow. That judgment comes from the person you're working with, at the game, and the telemetry is
there to support it. Write both down, and say which is which. And before asking them how something
feels, check that the screen shows the difference you are asking about: in a game about a dragon, a
village braced for it and a village abandoned were the same picture, so nobody could have answered.

**Trace before you test.** A trace is a record of the game's state over a few seconds, printed by
running the simulation in Node. In one game, a one-second trace of the state while a key was held
found every defect in the flight model and the fire, where their passing tests found none. Traces
were cheap there because the simulation ran in Node with no renderer. A trace is only as good as its
setup, though: when a trace disagrees with the game, suspect the trace first, and call the real
setup rather than rebuilding it by hand. A hand-made copy of one function, missing the body's
orientation, produced three plausible stories about a broken game before the fault turned out to be
the script. Scratch scripts named `scratch-*` at the repo root are ignored by git for exactly this,
and what they find goes in the design log. When one proves itself and will be wanted again, commit
it. A designer asked for one to be kept: *"At least if we have it in a commit somewhere, we can
easily go back to it as needed."*

**Look at the frame.** Screenshots are part of verification. Early on, give the game a handle the
end-to-end tests can drive it by, one that can step the simulation, place the camera, and read the
state the screen does not show. Then write a shots script that puts the game into each state worth
seeing, run it with `npm run shots`, and look at the sheet, the one image it lays the frames out on
(`scripts/shots.mjs` says what the script exports). Several of one game's defects existed only on
screen, and the day its debug readout said where the camera was, *"this looks wrong from here"*
stopped being a description and became a frame anyone could take again. Two games built a harness
like it for themselves, and in one it was the last check built and the most productive. With
`--tree before=@<commit>`, the same script puts an older commit's frames beside this checkout's:
the before and after of anything that is looked at rather than measured. The `frame-check` skill
has the rest: what to ask, what to pose, how to read a sheet, and the control.

**Measure the sound, and give them takes to hear.** An agent cannot hear: what a session knows of
its game's sound it knows from numbers and pictures of the samples. `npm run takes` renders the
game's own sound offline, through a script of the game's own, measures each take and lays them out
beside any older commit's; whether a sound is right is the person's, on copies matched in loudness
so that the louder one does not win for being louder. All four games built from this template made
a tool like it for themselves first. The `sound-check` skill has the rest.

### Working together

The guidelines above are about checking the work; these are about the rest of it. They come from an
earlier game, and from what the designer there found makes work go well: *"work with agents and
colleagues is more productive when everyone is patient, understanding, and brings a collaborative,
rather than delegative or managerial, mindset to things."* They rest on one idea: the work goes best
when each of us brings what we're best at. The person you're working with brings the picture of what
the game should be, what they expected, and how it feels; an agent can measure, check eight cases
while they play one, and keep the record straight. A *sitting*, below, is one stretch of them
playing a build. None of this softens what is true: a check that passes on broken code checks
nothing, whoever says so and however kindly.

Like the Charter's §5, these are inherited, as are the guidelines above: defaults, not this
project's findings. Keep them, prune them or argue with them, and log it when you do. The ones here
hold at every moment; those for a particular moment, such as before you build or after they play,
are in §5 under it.

**Their best reports are expectations, not defects.** *"I was anticipating that flying by a beacon
would cause alarm"* found a missing design; *"The second closest beacon did not light"* found a bug.
The first is worth more: an agent can find a defect, but not an expectation.

**Measure it, or say it is a guess, before you tell them how something will look or why something
happened.** What you say while they decide is evidence they decide on, and no gate checks a
sentence. In one game, the designer searched three crags for ravens by numbers the screen never
showed, because an agent had described a readout without checking it.

**Keep whose words are whose.** In the log, quote their decisions in their own words, and list an
agent's calls apart, each with its reason: a week later nothing else tells them apart, and the
Charter's authority rests on the difference. Where a build had to read an edge their words left
open, say so, and make it one value they can change. And silence is not a decision: a general "yes"
closes nothing in particular, so write down what it did not answer, and ask.

## Four inherited guidelines

Inherited from the template, out of a previous project that reached a thousand commits and fifty
thousand lines before anyone had established whether it was fun. They are defaults rather than this
project's own findings, and the README states the evidence behind each. Argue with them
deliberately or keep them, but don't ignore them silently.

**Done means wired in, not written.** A feature is finished when a booted game lets a player do the
thing. A system with a passing test and no caller is not delivered, and neither the test suite nor
the type-checker can tell you so: unit tests import modules directly, so a module keeps a green
test long after nothing in the running game reaches it. This is the specific way the previous
attempt failed, repeatedly.

**Play it.** While a system's feel is still being found, it needs playing, not tests or documents.
When you write down a playtest, write down what *worked* — the defect list is the easy half, and it
is not the half that tells you what to protect.

**Ask whether every criterion could pass and the thing still be wrong.** If yes, the criteria are a
stand-in for a judgment, and it takes the person you're working with, playing it, to make that
judgment. A question about how something feels, split into tasks and handed out, comes back as
pieces that each pass their check and do not add up.

**Test what has stopped changing.** Every test written against a system whose feel is still being
found is a bet you will pay to unwind.

The games built from this template since kept all four, and learned more. The ones that apply to
any game are in the Charter's §5, under *Inherited*, on the same terms: defaults to keep, prune or
argue with.

## Verification

Node 22+. `npm ci` first.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src tests
npm run format      # prettier --write src tests
npm test            # vitest run
npm run test:e2e    # playwright test (boots the real game in headless Chromium)
npm run verify      # typecheck + lint + unit + e2e
npm run verify:play # typecheck + the boot test (a build a person can sit down to)
npm run test:e2e:slow  # the end-to-end suite a little slower than CI (Linux)
npm run shots -- <shots.mjs> <out-dir>  # posed frames, and a sheet of them
npm run takes -- <takes.mjs> <out-dir>  # the game's own sound, rendered and measured
npm run feedback:check [-- <out-dir>]  # the feedback page, driven in a browser
npm run template:update  # bring in what the template has gained (`template-sync` skill)
cd infra && npm ci && npm run typecheck && npm test  # the feedback function's AWS side, as code
```

With `src/` and `tests/` empty, most of these have nothing to act on, and several exit non-zero on
"no input files" when run by hand. Neither the pre-commit hook nor CI holds that against a new
project. The hook lets a commit through while tsc has no source file to check, and refuses on
anything else tsc reports. CI skips its typecheck-and-lint job and its end-to-end job until the
repository has TypeScript besides its root config files, and shows them as skipped, not passed.
The unit tests run from the start, because the merge driver's tests are there. Once there is
source, everything runs, and the end-to-end job fails until the boot test exists; a stub test
written to turn it green is not the fix.

The Playwright config is ready, and the first end-to-end test to write is `tests/e2e/boot.spec.ts`,
which `verify:play` names. It boots the game, fails on any page or console error, draws one frame
with everything that has a shader in it, and then reads the GL error flag in the page: a shader
that fails to compile is logged rather than thrown, and GL errors reach the console late, from
another process and as warnings, where a listener for errors does not see them.

**When the person wants to play, give them a build on `npm run verify:play`, not the whole gate**
(`npm run verify`). It typechecks and boots and draws the game in seconds, which is what their
sitting needs. One game's gate took five minutes even after it had been cut from fifteen, and every
sitting used to wait for it. Push, tell them it is there, and run `npm run verify` while they play.
If it goes red, tell them what broke before they report on it, then fix it. Once there is code, a
pull request needs the whole gate green, and CI read after the push: in one game, *"CI: will run on
this PR"* went into a description three times and was not looked at again.

A husky `pre-commit` hook runs `tsc --noEmit`, which lets a commit through only while there is no
source file for it to check, and `lint-staged`; CI runs typecheck, Prettier, ESLint, the unit
tests, and the end-to-end suite in a booted game on pull requests, all but the unit tests once
there is source to check.

Run `npm run test:e2e:slow` before a pull request: CI's runner draws more slowly than a cloud
session, and it runs the suite a little slower than CI. Setting a test's time limit from it is in
the Charter's §5.

When you merge main, the three documents resolve themselves where both sides only added text
(`scripts/merge-docs.mjs`, registered by `npm ci`). A conflict left in one of them is a real
collision, two edits to one passage, so read both sides rather than taking one.

The template this repo was made from keeps learning from the other games built from it, and
`npm run template:update` brings that in: a three-way merge that keeps this project's changes and
leaves conflict markers where both changed one passage. A weekly workflow opens it as a pull
request. Resolve it as you would a merge of main, read both sides, and log what it changed about how
this project works. A finding of this project's that would serve any game goes back to the template
as a pull request there. The `template-sync` skill has both directions.
