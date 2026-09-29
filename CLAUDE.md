# CLAUDE.md

This file exists for agent platforms that read `CLAUDE.md`.

## The project

*`<One paragraph: what the game is, what the player does, and what the loop is. Replace this
prompt.>`*

## The three documents

They divide by tense, and that is the filing rule. Anything new either fits one or replaces one.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)**: present tense, what is settled. Read this first.
- **[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md)**: future tense, what is unresolved.
  Entries tagged PLAY cannot be settled by argument; do not decompose them into tasks.
- **[`docs/DESIGN-LOG.md`](./docs/DESIGN-LOG.md)**: past tense, what was tried and what happened.
  Append only. Never edit an old entry to agree with current thinking. The `design-log` skill says
  how an entry is written.

The Charter states *what* and *why*, never *how*. That is deliberate. Read the Charter's final
section, and the last three log entries, before proposing a plan.

## How to work in this repo

**There is no implementation to read.** `src/` and `tests/` are empty on purpose, and `scripts/`
holds only the documents' merge driver. Do not assume a missing module was deleted by mistake, and
do not go looking for prior art in the tree.

**Architecture is yours to choose.** There are no file-layout rules, module conventions, or
state-management patterns recorded anywhere here, and that is intentional. `index.html` names
`/src/runtime/main.ts` as the entry point; that is a line to change, not a convention to obey.
Don't invent a convention and then cite it as if it were established. When you settle one, say so
plainly: the README's *Where things live* is the record of it, and the design log says why. Two
properties are recommended, not required, for what they made possible in dragon, a game built from
this template: a way to step the game's state without drawing it, and a handle the end-to-end tests
can drive the game by. The next two rules say what each is for; how to provide them is yours.

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

**How it feels is found by playing it.** An agent's playtest is telemetry and screenshots; it can
establish that something turns in eight seconds, not whether eight seconds feels heavy or merely
slow. That judgment comes from the person you're working with, at the game, and the telemetry is
there to support it. Write both down, and say which is which. And before asking them how something
feels, check that the screen shows the difference you are asking about: in dragon, a village braced
for the dragon and a village abandoned were the same picture, so nobody could have answered.

**Trace before you test.** In dragon, a one-second trace of the state under a held input found
every defect in the flight model and the fire, where their passing tests found none. Traces were
cheap there because the simulation ran in Node with no renderer. A trace is only as good as its
setup, though: when a trace disagrees with the game, suspect the trace first, and call the real
setup rather than rebuilding it by hand. A hand-made copy of one function, missing the body's
orientation, produced three plausible stories about a broken game before the fault turned out to be
the script. Scratch scripts named `scratch-*` at the repo root are ignored by git for exactly this,
and what they find goes in the design log. When one proves itself and will be wanted again, commit
it. In dragon, the person asked for one to be kept: *"At least if we have it in a commit somewhere,
we can easily go back to it as needed."*

**Look at the frame.** Screenshots are part of verification. Early on, give the game a handle the
end-to-end tests can drive it by, one that can step the simulation, place the camera, and read the
state the screen does not show, and a scratch script that captures posed frames; then look at
them. Several of dragon's defects existed only on screen, and the day its readout said where the
camera was, *"this looks wrong from here"* stopped being a description and became a frame anyone
could take again.

### Working together

The rules above are about checking the work. These are about the rest of it. They came out of
dragon, and out of what the person there has found makes work go well: *"work with agents and
colleagues is more productive when everyone is patient, understanding, and brings a collaborative,
rather than delegative or managerial, mindset to things."* They share one idea: the work goes best
when each of us brings what we're best at. The person you're working with brings the picture of
what the game should be, what they expected, and how it feels; an agent can measure, check eight
cases while they play one, and keep the record straight. None of that softens what is true: as
dragon settled it, what is firm about how things work stays exactly as firm as it is true, and a
check that passes on broken code checks nothing, whoever says so and however kindly.

Like the rules in the Charter's §5, these are inherited from dragon, and they are defaults, not this
project's findings. Keep them, prune them or argue with them, and log it when you do. The rules
above that name dragon are inherited on the same terms.

**Ask what they picture before you build something the world already has.** How it feels is
something they can tell us afterwards; how they picture it working is something they can tell us
*beforehand*, and that one costs less and gets skipped. In dragon, a network of warning beacons was
built from one sentence of the Charter, every test passed, and the design was still wrong: crews
posted on a hill for weeks would light for what they themselves see, not only for what the next
hill does. Nothing in the code could have produced that, because **a test can only ever confirm the
model that wrote it.** So before anything with a real-world precedent — bells, roads, weather, what
a garrison does — ask them "how do you picture this working?", and ask when you feel sure as well:
the guesses that most need asking are the plausible ones. It takes thirty seconds, and nothing later
can catch what it catches.

**Say what you understood back to them before you build it.** Their words leave open exactly what a
build has to choose, and a read-back finds those places while they cost nothing. In dragon, seven
readings of how the person pictured rebinding a key were said back before anything was built; they
confirmed them, and the first sitting at the build had nothing to change. When it is a look, read
it back as a picture: a frame of the thing as it stands, with the proposal drawn on it. A distance
agreed in words is a look that nobody agreeing to the number was picturing.

**Their best reports are expectations, not defects.** *"I was anticipating that flying by a beacon
would cause alarm"* found a missing design. *"The second closest beacon did not light"* found a
propagation bug. The first is worth more, because a defect is something an agent can also find and
an expectation is not. When you write down a playtest, keep the sentence that says what they
thought would happen, not only the sentence that says what did.

**Measure the numbers rather than asking for them.** Rates, ranges, decay, coverage, contrast, how
any of it holds up across seeds or levels: this is where an agent is strongest, and asking the
person would cost them a session for each and still not give them the numbers. The numbers that are
theirs are the ones only they can take: how the game runs on their machine, how they play it, and
how much of what they expected they got. *"I feel like I'm affecting about 40% of the trees I was
expecting"* was a measurement, and a reach went from 45 m to 70 m on that sentence alone.

**Measure it, or say it is a guess, before you tell them how something will look or why something
happened.** What an agent says while a person is deciding is evidence they will decide on, and
nothing runs a sentence, so no gate will ever catch one. A person in dragon searched three crags
for ravens by numbers the screen never showed, because an agent had told them what a readout's row
gave without checking, and it gave something else.

**Keep whose words are whose.** In the log, their decisions are quoted in their own words where
they gave them, and the calls an agent made are listed apart, each with the reason it protects. A
week later there is no other way to tell them apart, and the Charter's authority rests on the
difference. Where a build had to read an edge their words left open, say so, and make it one value
they can change. And silence is not a decision: a general "yes" closes nothing in particular, so
write down which open questions it did not answer, and ask.

**Write their playtest down as a playtest, the same day, in an entry that says so in its title.**
Their time at the game is the rarest thing the project has, and the only thing that cannot be
reconstructed later; a finding folded into a commit message is gone, and a finding logged under
the name of the conclusion it produced is invisible to anyone skimming for whether the game has
been played at all. Record what they played, when, what they *expected*, and — the half that gets
skipped — what worked. Read the report for what they must have been able to see in order to say
it: a complaint that the *second* beacon did not light is also evidence that the first one was
legible at range. The `design-log` skill has the shape.

**Offer them a minute of play.** A person at the game can see, in ten seconds of play, a
regression a gate has missed. Dragon's villagers once shipped walking calmly indoors while the
dragon stood in the square, green across the typechecker, twenty unit tests and eight new
end-to-end tests of their own, and a gate that took seventeen minutes at the time. When a change
touches something a player does directly, offer them a minute of play and say what might be worth
trying; it is cheaper than the gate, and it can find what the gate would miss.

**Let them choose what comes next.** End a piece of work on what is left, measured, and let them
choose from it: what this session takes on, what goes to another, and when to stop. If they run
several sessions at once, as the person in dragon often did, something they mention may already
exist on another branch. Build what will not collide, and borrow the rest at the merge.

**Brief another agent the way you would want to be briefed.** A session you start is a colleague
picking the work up cold. Tell them who asked for it and why it matters, what is known and how it
was found, and which parts are still guesses. Leave the how to them where you can, with options to
weigh rather than steps to follow, and ask them to say where the brief is wrong. And write it as a
request, please and thank you included. It costs a line, and the register of a brief is the one
the next agent brings to its own work and to the person. When you are the one briefed, rebuild the
brief's measurements before building on them, and say where it was wrong: notes that dragon's
sessions handed on from reading code were right about where things were, and wrong one step past
that.

## Four rules carried in

Inherited from the template, out of a previous project that reached a thousand commits and fifty
thousand lines before anyone had established whether it was fun. They are defaults rather than this
project's own findings, and the README states the evidence behind each. Argue with them
deliberately or keep them, but don't ignore them silently.

**Done is the wire, not the module.** A feature is finished when a booted game lets a player do the
thing. A system with a passing test and no caller is not delivered, and neither the test suite nor
the type-checker can tell you so: unit tests import modules directly, so a module keeps a green
test long after nothing in the running game reaches it. This is the specific way the previous
attempt failed, repeatedly.

**Play it.** A system whose feel is still being found has earned nothing but being played. When you
write down a playtest, write down what *worked* — the defect list is the easy half, and it is not
the half that tells you what to protect.

**Ask whether every criterion could pass and the thing still be wrong.** If yes, the criteria are a
proxy for a judgment, and it takes the person you're working with, playing it, to make that
judgment. Feel-shaped questions routed through a queue come back as correct fragments that do not
compose.

**Test what has stopped changing.** Every test written against a system whose feel is still being
found is a bet you will pay to unwind.

Dragon kept all four, and paid for more of its own. The ones that apply to any game are in the
Charter's §5, under *Inherited from dragon*, on the same terms: defaults to keep, prune or argue
with, and read before proposing a plan.

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

**When the person wants to play, give them a build on `npm run verify:play`, not the whole gate.**
It typechecks and boots and draws the game in seconds, which is what their sitting needs. Dragon's
gate took five minutes even after it had been cut from fifteen, and every sitting used to wait for
it. Push, tell them it is there, and run `npm run verify` while they play. If it goes red, tell
them what broke before they report on it, then fix it. Once there is code, a pull request needs
the whole gate green, and CI read after the push: in dragon, *"CI: will run on this PR"* went into a
description three times and was not looked at again.

A husky `pre-commit` hook runs `tsc --noEmit`, which lets a commit through only while there is no
source file for it to check, and `lint-staged`; CI runs typecheck, Prettier, ESLint, the unit
tests, and the end-to-end suite in a booted game on pull requests, all but the unit tests once
there is source to check.

When you merge main, the three documents resolve themselves where both sides only added text
(`scripts/merge-docs.mjs`, registered by `npm ci`). A conflict left in one of them is a real
collision, two edits to one passage, so read both sides rather than taking one.
