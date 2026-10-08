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

- plan, merge or hand over;
- ask the person something;
- build something;
- run several builders at once;
- measure, test or trust a result;
- hand them a build, or write up what they played.

What holds at every moment stays in this file, with how to find your way around the repo: *How to
work in this repo*, *Working together* and the three inherited guidelines, below.

## How to work in this repo

**There is no implementation to read.** `src/` and `tests/` are empty on purpose, and `scripts/`
holds the documents' merge driver, the template's update script (`template.mjs`), and three tools
that work with any game (`shots.mjs`, `takes.mjs` and `e2e-slow.mjs`). `feedback/` and `infra/` are
an in-game feedback page that also works with any game (the game mounts it and hands it its canvas),
the function that commits a player's report to a private repository, and that function's AWS setup
as code (`feedback/README.md`). Do not assume a missing module was deleted by
mistake, and do not go looking for prior art in the tree.

**Architecture is yours to choose.** There are no file-layout guidelines, module conventions, or
state-management patterns recorded anywhere here, and that is intentional. `index.html` names
`/src/runtime/main.ts` as the entry point; that is a line to change, not a convention to obey.
Don't invent a convention and then cite it as if it were established. When you settle one, say so
plainly: the README's *Where things live* is the record of it, and the design log says why. Two
properties are recommended, not required, for what they made possible in an earlier game built from
this template: a way to step the game's state without drawing it, and a handle the end-to-end tests
can drive the game by. The Charter's §5 says what each is for, among its guidelines for measuring;
how to provide them is yours.

**There is no issue tracker.** No tickets, no ticket IDs, no backlog tool. Plans live in the Charter
and in the session you are working in. Don't reference or fabricate ticket identifiers.

**This repo was scaffolded from a template.** Prompts in *italics*, and placeholders in angle
brackets, are unanswered template text rather than design decisions. Don't treat them as settled
and don't quietly write around them — if a plan depends on one, resolving it is the first step of
the plan. ``rg '`<' README.md CLAUDE.md docs/`` lists what is still unfilled. The `/gettingstarted`
skill walks the person you're working with through resolving them; suggest it if a session opens
against an unfilled template, and don't answer the prompts on their behalf in the meantime.

### Working together

The guidelines above are about finding your way around the repo; these are about working with the
person. They come from an earlier game, and from what the designer there found makes work go well:
*"work with agents and colleagues is more productive when everyone is patient, understanding, and
brings a collaborative, rather than delegative or managerial, mindset to things."* They rest on one
idea: the work goes best when each of us brings what we're best at. The person you're working with
brings the picture of what the game should be, what they expected, and how it feels; an agent can
measure, check eight cases while they play one, and keep the record straight. None of this softens
what is true: a check that passes on broken code checks nothing, whoever says so and however
kindly.

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
Charter's authority rests on the difference. Keep your numbers apart from their judgment the same
way: write both down, and say which is which. Where a build had to read an edge their words left
open, say so, and make it one value they can change. And silence is not a decision: a general "yes"
closes nothing in particular, so write down what it did not answer, and ask.

## Three inherited guidelines

Inherited from the template, out of a previous project that reached a thousand commits and fifty
thousand lines before anyone had established whether it was fun. They are defaults rather than this
project's own findings, and the README states the evidence behind each. Argue with them
deliberately or keep them, but don't ignore them silently.

**Done means wired in, not written.** A feature is finished when a booted game lets a player do the
thing. A system with a passing test and no caller is not delivered, and neither the test suite nor
the type-checker can tell you so: unit tests import modules directly, so a module keeps a green
test long after nothing in the running game reaches it. This is the specific way the previous
attempt failed, repeatedly. The same holds for anything drawn: a probe can show a thing alive that
was never added to the scene, so find the line that adds it.

**Play it, and test only what has stopped changing.** While a system's feel is still being found,
it needs playing, not tests or documents: every test written against it is a bet you will pay to
unwind. An agent's playtest is numbers and screenshots. It can establish that something turns in
eight seconds, not whether eight seconds feels heavy or merely slow; that judgment is the person's,
at the game, with the numbers there to support it.

**Ask whether every criterion could pass and the thing still be wrong.** If yes, the criteria are a
stand-in for a judgment, and it takes the person you're working with, playing it, to make that
judgment. A question about how something feels, split into tasks and handed out, comes back as
pieces that each pass their check and do not add up.

The games built from this template since kept all of these, and learned more. The ones that apply to
any game are in the Charter's §5, under *Inherited*, on the same terms: defaults to keep, prune or
argue with.

## Verification

Node 22+. `npm ci` first. The README's *Toolchain* lists every command and says what each one
does, what the boot test checks, and what the hook and CI let through while `src/` is empty.

`tests/e2e/boot.spec.ts` is the first end-to-end test to write, and `verify:play` names it. Once
there is source, CI's end-to-end job fails until it exists; a stub test written to turn it green is
not the fix.

Once there is code, a pull request needs the whole gate (`npm run verify`) green, and CI read after
the push: in one game, *"CI: will run on this PR"* went into a description three times and was not
looked at again. Run `npm run test:e2e:slow` before a pull request; setting a test's time limit
from it is in the Charter's §5.

When you merge main, the three documents resolve themselves where both sides only added text. A
conflict left in one of them is a real collision, two edits to one passage, so read both sides
rather than taking one. Resolve a template update (`npm run template:update`, or the weekly pull
request) the same way, and log what it changed about how this project works. A finding of this
project's that would serve any game goes back to the template as a pull request there. The
`template-sync` skill has both directions.
