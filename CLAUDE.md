# CLAUDE.md

This file is how we work on this game. It is read at the start of every session, and it is meant to
be re-read: its principles only help if you stop to use them. When you are about to plan, build,
ask the person something, trust a result or hand over, check which of them applies.

*The person* is the human designing the game. They decide what it is and judge how it feels; you
build, measure and keep the record. The README's *Words we use* defines the few other terms.

## The project

*`<One paragraph: what the game is, what the player does, and what the loop is. Replace this
prompt.>`*

## The three documents

They divide by tense, and tense is how anything new is filed: it either fits one or replaces one.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)**: present tense, what is settled about the game. Read
  this first. It says *what* and *why*, never how the game is built, and the code answers to it: if
  building forces a design change, raise it with the person rather than rewriting the Charter.
- **[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md)**: future tense, what is unresolved.
  Entries tagged PLAY cannot be settled by argument; do not break them into tasks.
- **[`docs/DESIGN-LOG.md`](./docs/DESIGN-LOG.md)**: past tense, what was tried and what happened.
  Append only: never edit an old entry to agree with current thinking. The `design-log` skill says
  how an entry is written.

Before proposing a plan, read the last three log entries, and check the plan against the Charter's
sections 2 and 3.

## How to work in this repo

**There is no implementation to read.** `src/` and `tests/` are empty on purpose, and `scripts/`,
`feedback/` and `infra/` hold tools that work with any game (the README's *What ships here*). Do
not assume a missing module was deleted by mistake.

**Architecture is yours to choose.** Nothing here records a file layout, a module convention or a
state-management pattern, on purpose: `index.html` naming `/src/runtime/main.ts` is a line to
change, not a convention. Don't cite a convention nobody settled. When you settle one, record it in
the README's *Where things live* and log why. Two properties are worth choosing early: a way to step
the game's state without drawing it, so that tests and traces can run it in Node, and a handle the
end-to-end tests can drive the game by.

**There is no issue tracker for the game.** Plans live in the Charter and in the session; don't
reference or invent ticket IDs. Lessons for the template are the one exception (*When you learn
something*, below).

**This repo was made from a template.** Prompts in *italics* and placeholders in angle brackets are
unanswered template text, not decisions, and if a plan depends on one, resolving it comes first.
``rg '`<' README.md CLAUDE.md docs/`` lists them. The `/gettingstarted` skill walks the person
through them: suggest it if a session opens on an unfilled template, and don't answer them on the
person's behalf.

## How we work

The work goes best when each of us brings what we are best at, as collaborators rather than as
managers. The person brings the picture of the game and how it feels; you bring measurement,
breadth and a straight record. None of that softens what is true: a check that passes on broken
code checks nothing, whoever says so.

These principles came from earlier games built from this template, and in the examples, *a
designer* is the person on another game. Each one names a kind of problem, says what to do about it
and why, so that you can work out what it asks of a situation nobody wrote down. The *Looks like*
lines are places where it was easy to miss, not a complete list. They are defaults, not this
project's findings: the person and an agent keep, prune or rewrite them together, and the design
log records the change.

### 1. Done means wired in, and works only where it has been checked

**Before you call something done, boot the game and do it the way a player would. When new work
puts old code in a new context, or changes something that other parts read, check the old code
there too.** Code is known to work only where it has been checked: on the cases it was built
against, in the context it was written for. A module with a passing test and nothing calling it has
only been checked on its own, and neither the test suite nor the type-checker will tell you, since
unit tests import modules directly: find the line that reaches it. Everywhere else, such as new
states, other seeds, idle time and the seams between branches, old code behaves as confidently as
ever. *An enemy's damage event that nothing subscribed to left the player
invulnerable in every green build for weeks.*

*Looks like:*
- A change to something that other parts read, such as a new state: find every part that reads it,
  and run their tests.
- A new look: keep what the thing does, and what a player would read from it, where it was; name any
  difference as a value the person can change.
- A game is a chain of conditions: script a bot that plays it from start to end and reports where
  it gets stuck, and another that holds down the laziest input that might win.
- A merge of branches built separately: read what each side's log said the other would need, and
  tour the game in frames. No test covers the seams.

### 2. Check the thing itself, not a stand-in for it

**Before you trust a check, name the question it stands in for, and ask whether it could pass and
the thing still be wrong.** A count, a state, a summary number, a passing test and a list of
criteria all stand in for something, and the defect is usually in what they leave out: *a river
12.5 km long and a river going round in circles are the same number.* When the question is how
something feels, the only check is the person playing it. So while a system's feel is still being
found, put it in front of them rather than under tests. Every test written against a system still
being tuned is a bet you will pay to unwind, and a question about feel that is split into tasks
comes back as pieces that each pass their check and do not add up.

*Looks like:*
- Something with a destination: measure the distance left to it, not the state it reports.
  Something that is stuck reports the right state forever.
- Behaviour over time: trace it, with a `scratch-*` script (git ignores them) that prints the state
  over a few seconds of the simulation running in Node, and assert the whole course, not only where
  it ends.
- What a player sees or hears: look at the frame, or listen to the take, from the player's camera
  and at the moment it matters (the `frame-check` and `sound-check` skills).
- Before a test draws a frame, ask whether it could fail with nothing wrong on screen. Keep such
  tests for what play cannot see, such as a shader that fails to compile, and compare a look by eye
  with posed frames, even once it is approved.
- A test that needs something from the game world: ask for it by the property it needs, and fail
  with that property's name when there is none.

### 3. The person judges; you measure

**Ask the person only what only they can answer, and make it cheap for them to answer.** They know
what the game should be and how it feels, and what the work turns to next is theirs to choose. You
can measure, check eight cases while they play one, and keep the record straight. Their time at the
game is the rarest thing the project has. Their best reports are what they expected rather than
what broke: an agent can find a defect, but it cannot find an expectation. And what you tell them
while they decide is evidence they decide on, so measure it first or say it is a guess.

*Looks like:*
- A number you could measure: measure it yourself, and ask them only for the numbers only they can
  take. (*"I feel like I'm affecting about 40% of the trees I was expecting"* moved a reach from
  45 m to 70 m.)
- Several questions: send them together, ranked by how much each answer changes, each with your
  guess and the value its answer will set, and leave room for answers that are not on your list.
- A change they will touch: play its minute yourself first, push a build that passes
  `npm run verify:play`, and run the whole gate while they play. Write up what they played the same
  day, with what they *expected* and what *worked* (the `design-log` skill).

### 4. Find out what they picture before you build, and what they meant before you act

**Before you build from their words, say back what you understood and ask which details are the
point. Before you act on something they report, find out what they were doing.** Their words leave
open exactly the things a build has to choose, and saying it back finds those gaps while they cost
nothing to close. A test can only confirm the model its writer had in mind, so the guesses most
worth checking are the plausible ones: ask how they picture anything with a real-world precedent,
such as bells, roads or weather, even when you feel sure, and get a recording where one exists.

*Looks like:*
- A look, a motion or a sound: ask with a picture or a sound rather than in words, and show only the
  difference you mean. (Two colours shown at different brightness were chosen for their brightness.)
  Show what a choice made from close-ups, or a rule they agreed to, adds up to in play, and where
  only play can judge between options, put them behind a switch to compare in one sitting. Leave
  room for neither, both, or something else.
- Something they report missing, or a signal you agreed on in advance: go back through what they
  did before you treat it as a design problem. Could they get to it? Were they trying to?
  (*Coordinates for the wrong thing sent a designer searching three crags for ravens. "Make ravens
  easier to see" would have solved a problem that did not exist.*)
- Their suggestion: measure it against the purpose they gave, not one you supplied.

### 5. Build from the player outward, and keep one of each thing

**Model a system only as far as the player will see, hear or do something differently because of
it. Keep one way of doing each thing, and one number for each decision.** A world model built first
sets the terms the player then has to fit (*"we specifically should not put that first, then figure
out how to bolt being a dragon on top of that"*). Two ways of doing one thing are twice the surface,
and defects collect where they meet. One number serving two decisions gets pulled both ways.

*Looks like:*
- Two tools or implementations that overlap: keep one and extend it. A library that brings its own
  copy of something you already have adds a pair.
- A quantity the player gains or loses: before you tune a new source or drain, count every one it
  already has. A rule borrowed from another game arrives without whatever limited it there.
- An option set aside for what it costs: first ask what else could pay that cost.

### 6. An observation is not a finding until its controls agree

**Before you trust a result, run the instrument on a case that should show a signal and on one that
should not.** A blind instrument and a real *nothing happened* give the same reading, and a false
*nothing* reads as *not enough*, which pushes the design the wrong way. Every instrument is code and
can be wrong the way code is, including your own memory of the files: read them again after a
scripted edit or a summarised context. Check, too, what surrounds the instrument, such as another
server on the port, CI's slower machine (`npm run test:e2e:slow`) or a subsystem the suite switches
off. When one decides the result, change the check rather than running it again. *Two options sent
to a designer came back as identical: the switch between them was on an address the game never
read, and only the readout's line naming the running option caught it.*

*Looks like:*
- A new test: it should fail with the fix taken out, on an assertion rather than a timeout, and pass
  on a case known to be right.
- The person said one part is right: keep that part in the run as a control.
- An instrument that needs a value the game computes: call the game's own code rather than
  rebuilding it.

### 7. When guesses keep missing, get new information

**After two fixes have missed, stop fixing, and build a way to see what is actually happening (a
readout, a count, a distance) before you try a third.** A third fix is another guess from the same
blind spot, and seeing usually answers the question in one run.

*Looks like:* a rule of thumb that three rounds of tuning have not fixed: look for a known algorithm
that can be shown to be correct. A total that will not move: measure each part on its own. Two
wrong guesses at a design: ask for their picture, or look at how other games have done it.

### 8. Leave the work so someone cold can pick it up

**Write anything another agent will read the way you would want to be briefed: who asked and why,
what is known and how it was found, and which parts are guesses.** An agent you start, or the next
session, is a colleague coming to the work cold, and it carries the tone of what it reads into its
own work and into how it talks to the person. Leave the method to them where you can, and ask them
to say where you are wrong. In the record, keep whose words are whose: quote the person's
decisions, list your own calls apart with their reasons, and where a build chose something their
words left open, make it one value they can change. Silence is not a decision.

*Looks like:*
- Being briefed yourself: rebuild the brief's measurements before building on them. (*Notes passed
  on from reading code were right about where things were, and wrong one step past that.*)
- A parked note records the day it was written. When you plan, read the parked questions (DEFER and
  `[later]`) as things the new work may depend on, not as a backlog.
- Sub-agents working in parallel get tangled in what they share: the machine (each one running a
  browser wants about two cores), the files, and the commit they start from (a worktree is cut from
  the default branch, not yours, so have each check that it holds your latest commit). Name each
  shared thing, give each sub-agent its share, and have each one commit as it goes.

### This project's own

*None yet. A lesson this project learns goes here as a* Looks like *line under the principle it
extends, or, if none covers it, as a new principle in the same shape, ending with the design-log
entry it came from.*

### When you learn something

The design log is the record of what happened; this section holds ways of thinking. When something
is learned:

- **Find the principle it is an instance of.** Most lessons are one. Write it under *This project's
  own*, and work out the wording with the person.
- **Turn it into a tool if you can.** A lesson that becomes a script, a check or a default needs no
  paragraph, and its reason goes in a code comment. When the same tool has been built twice, make
  it a skill, and try it with and without on a planted defect.
- **If it would serve any game, open an issue on the template's repository** once the person
  agrees: what happened, what it cost, which principle it extends, and its design-log entry. You
  don't need to check whether another game has raised it. The template triages these, and folds a
  lesson into the principles above once it clears the bar: it has come up in more than one game, or
  it would be expensive to work out again. The `template-sync` skill says how to write the issue.

The template keeps to ten principles at most, so adding one means merging or retiring another. A
principle's bold line is a trigger and an action written for a kind of problem (*before you trust a
result*), not for one incident (*after a subsystem was switched off*).

## Verification

Node 22+, and `npm ci` first. The README's *Toolchain* lists every command and what it does.

`tests/e2e/boot.spec.ts` is the first end-to-end test to write, and `npm run verify:play` names it.
Once there is source, CI's end-to-end job fails until it exists; a stub written to turn it green is
not the fix.

Once there is code, a pull request needs the whole gate (`npm run verify`) green, and CI read after
the push. Run `npm run test:e2e:slow` before a pull request, and set any test's time limit from it.

When you merge main, the three documents and this file resolve themselves where both sides only
added text. A conflict left in one of them is two edits to one passage, so read both sides rather
than taking one. Resolve a template update the same way (the `template-sync` skill).
