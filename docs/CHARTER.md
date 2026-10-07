# `<project>` Charter

> **What we have figured out so far.** Present tense: the things that are settled, and the
> constraints that settled them.
>
> Companion documents: [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md) is what we still have to find
> out. [`DESIGN-LOG.md`](./DESIGN-LOG.md) is what we tried and what happened.
>
> Almost nothing here says *how* to build anything, and that is deliberate. A charter that
> describes the code goes out of date the first time the code changes, and once readers know one
> section is out of date, they stop trusting the important ones along with it.

*This file arrived as a template. Italic text is a prompt to you; anything in angle brackets is a
placeholder. Answer a prompt and delete it. A section you cannot fill in is not a blank to leave
sitting here — it is an entry for [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md).*

---

## 1. What `<project>` is

*One paragraph. The premise, the genre, and how faithful it is to anything it recreates or draws on.
Concrete enough that a stranger could picture a minute of play. If it needs a second paragraph, it
is not settled yet — write down the part that is and file the rest as an open question.*

*Then the founding commitments: the one, two, or three things that were true before anything else
was decided, and that everything downstream is an attempt to satisfy at once. Name them. Most of
the interesting design work on a game is the tension between its commitments, and you cannot
recognize that work while it is happening unless the commitments are written down.*

**`<Commitment>`.** *`<What it means, and what feeling it is chasing. A commitment that cannot be
contradicted is not one — say what it costs you.>`*

### What a play session is

*The loop, in the second person, in five or six sentences: what the player does, in what order, and
what they come back with. Then the shape of time — how long one play session runs, and what many of
them add up to.*

---

## 2. What it has to be

*Three to five criteria, concrete enough to reject a proposal. When something is contested, it
settles here first.*

*The useful half of each is what it rules out. A criterion that rejects nothing is a mood, and a
mood cannot settle an argument. Write the "rules out" line first if it helps: if you cannot name
anything it kills, the criterion is not real yet.*

**`<Criterion>`.** *`<What it means for the player, in one or two sentences.>`*

*Rules out:* *`<The specific proposals this criterion kills, named. Include the expensive ones —
the cost is what makes it a criterion rather than a preference.>`*

---

## 3. The laws

*Rules that bind everywhere. The criteria above are about what the game is; a rule that governs one
system lives with that system, down in section 4. This section is only for the ones with no
exceptions anywhere.*

*Each law states its why. A law without one gets argued with the first time it is inconvenient, and
then the argument has to be re-won from scratch every time it comes up. Where a law has an
operational test — some question that is easier to apply than the law itself — write that down too.
The test is the part that actually gets used.*

**`<Law, stated as an imperative or a flat assertion.>`**
*`<What it forbids or requires, in one or two sentences.>`*

*Why:* *`<The failure it exists to prevent, and the operational test if there is one.>`*

---

## 4. The building blocks

*One block per system large enough that a decision about it constrains other systems (movement, say,
or combat, or the economy). Expect somewhere between four and eight. More than that and some of them
are features rather than blocks.*

*Each block states the problem it exists to solve before it states the answer, under these
headings, in this order. The problem statement is the part that gets skipped and the part worth the
most later: it is how a reader six months from now can tell whether a proposed change is a better
answer or a different question.*

*None of them says how to build it. Keep it that way — see the note at the top of this file.*

### 4.1 `<Block name>`

**The problem.** *`<What this exists to solve, and the constraints sections 2 and 3 have already
placed on the answer.>`*

**The shape.** *`<The answer, in terms of what the player encounters and why that satisfies the
problem. Behaviour and consequence, never mechanism.>`*

**What we learned.** *`<What playing or building it taught, once there is anything to say. Leave
this heading out until then rather than filling it with intentions.>`*

### 4.2 `<Block name>`

*`<Same three headings. Add blocks as systems earn them; a block with nothing under "The problem"
is a feature that wandered in.>`*

---

## 5. How to build anything here

*The rules this project has learned about how to build it.*

It starts with inherited rules, and none of them is this project's own finding yet. Four are the
template's, stated in [`../CLAUDE.md`](../CLAUDE.md) and in the [README](../README.md) with the
evidence behind each. The rest are below, grouped by the moment each one is for. Each rule keeps a
line of what it cost, because a rule without its reason gets argued with the first time it is
inconvenient. How
agents work with the person in every session is in `CLAUDE.md` under *Working together*; the rules
here are for particular moments.

A few words recur below. *The person* is the human designing the game. A *sitting* is one stretch
of them playing a build. An *instrument* is anything built to show or measure what the game is
doing, such as a debug readout, a count or a screenshot. A *builder* is a sub-agent building one
piece of the work alongside others. The README's *Words we use* has the rest.

They are defaults, not findings. Keep them, prune them or argue with them, deliberately, and log it
when you do. As this project learns rules of its own, write them under *This project's own*, in the
same shape, and say plainly which is which. A rule this project learned outranks one it was handed,
and an inherited rule this project has to learn again for itself moves to *This project's own*,
with its own story.

The shape matters: a trigger (*when you are about to…*) and an action, then what it cost. In
dragon, a session that checked found its rules in that shape followed without reminding, and a
lesson written three times as a retrospective never once acted on. *After a scripted edit, grep for
the new text* is something to follow; *the instrument was missing what the question needed* is
not.

### Inherited

From earlier games built from this template, wherever the lesson applies to any game rather than
to one game's design or technology.

#### When you are about to ask the person something

- **Before putting a choice to them, ask whether both are wanted and what orders them, and leave
  room for an answer on neither list.** An either/or claims the design space has two points in it,
  at the moment you know least, and a list of three makes the same claim with one more point. Asked
  in dragon whether resistance should read as antagonism or as inconvenience, the person answered
  both, as a ladder; a question that ended *or something else* got the reading nobody had offered.
- **When the question is how something looks, moves or sounds, ask in that medium, and vary one
  thing at a time.** A drawing settled in one look what two rounds of *bat*, *pterosaur* and
  *Smaug* had not. Frame every option at the same moments, and match a compared pair on everything
  but the thing compared: amber and violet were put side by side at different brightness, and the
  person's eye went by the brightness. When they choose from close-ups, show what they would notice
  in play as well: a ridge chosen from frames of summits close to doubled the high ground once
  built, and shown that, they chose again.
- **When only play can judge between options, build them into the game behind a switch (a URL
  parameter, say), and let them compare in one sitting.** Give them the whole URL to open, not a
  parameter to add to one, and put what the game actually read on the readout: one comparison dragon
  sent came back as two identical loads, because the switch had been added to an address that did
  not read it, and the readout's line was all that caught it. Once they have chosen, delete the
  others or keep the switch as a debugging tool, and say which.
- **When a tell fires, ask what they were trying to do before acting on the answer filed with it.**
  A tell is something a player does that was agreed beforehand to mean something when it happens in
  play. Reaching for dragon's debug map was filed as a sign that the island was not legible. The
  person was reaching for it to find out whether the far side had been built at all, and a count
  found four villages of seven on the seed they played, with half its land empty. Same act, two
  defects.
- **When they cannot find something, find out whether they could not get there or could not see it
  there, and fix the first before asking about the second.** The first is ours to fix, a wrong
  direction or a missing readout; the second may be the design. In dragon the person looked for
  ravens at three crags and found none, and a measurement of how hard a raven is to see went to them
  as a question. They had never reached the crags: the numbers they had been given were for
  something else. Given the right ones, they found the ravens, and said a raven is something you
  come across by chance. *Easier to see* would have been a change nobody wanted.
- **When you measure their suggestion, check that the quantity you measured is the one they proposed
  it for.** In dragon, the person asked for denser forest so that a player would lose track of
  fleeing villagers; a script that counted the island measured whether a covered route existed, and
  ranked the forest last. A borrowed reason on your own metric tests neither, and it arrives with a
  table.
- **When you set an option aside for what it costs, ask first what else could pay that cost.** An
  objection is a price, not a verdict. The opening an agent set aside for dragon's tutorial was the
  one the person chose, and both halves of its price turned out to be payable.

- **When there are several questions only the person can answer, send them together: ranked by how
  much each answer changes the game, each with your guess, and each naming the value it sets.**
  Kyle on Duty put eight to the person at once, ranked out of the eighty-odd its research and its
  builders had asked. They answered all eight in one message after a sitting, with more than was
  asked, and every answer had set its value within the hour. Dragon sends three to six at a time
  with a guess beside each (*"they took all four guesses"*), and Extra Sapien sends them with
  options. One at a time is right for the founding interview (`gettingstarted`), where each answer
  shapes the next question; questions the person answers from memory or from a sitting do not wait
  on each other that way, and asked one by one they cost a message each.

#### When you are about to build something

- **Build from the player outward: a system earns its place by what the player will see, hear or
  have to do differently because of it, and it is modelled that far and no further.** Simulating a
  fair bit is fine; starting from the world's model and hanging the player on it is not. In dragon,
  the person said of what *not a simulation* meant: *"we specifically should not put that first,
  then figure out how to bolt being a dragon on top of that."*
- **When a new action or motion reaches where nothing went before, trace the old systems there, and
  decide what every other action does wherever one holds the player still.** (A *verb*, below, is an
  action the player can take.) Old code gives confident answers in corners nothing had reached
  before. Dragon's backward wingbeat was right the first time it was written and wrong in two old
  places, its lift and its thrust, neither of them in the new code. And a verb that held the dragon
  at a cave's mouth was built around the breath; in the first sitting there, the person roared
  instead, and watched the dragon's head go up.
- **When two copies of one thing disagree, delete one rather than keep them in step.** A pair kept
  in step is a rule to learn again for the next pair, and twenty-five of dragon's log entries were
  seams between two copies of one thing on its island. The person's reason, there: *"you keep the
  game WYSIWYG and honest. And if we needed that to change, we would know exactly where to go."*
  Ask it of a library before adopting one, too: a library that brings its own copy adds a pair.
- **When a third tuning of a rule of thumb has failed, look for an algorithm that can be shown to be
  correct.** A second session that read dragon's whole log found that every tuned rule which gave
  way to a textbook algorithm had worked, and wrote that *the tuning that went nowhere was the
  agent's*.

#### When you are about to tune how something plays

- **Play the whole game with a bot in Node before looking at a screenshot of it.** Every beat of the
  game is a wait on a condition, and a wait that can never come true is invisible until something
  reaches it. Extra Sapien's first full run found a shut door that could be walked round, in under a
  second. Kyle on Duty's first whole game found zombies standing still on a crate and on sandbags,
  and a path field that could not climb a stair; later the same bot, run with each of two rule
  changes undone in turn, said which of them had cost it three rounds. A game that cannot be lost
  (sandworm's is one encounter) traces a whole sitting instead.

#### When you are about to change how something looks or sounds

- **When the person says one part is right and another is not, take the right part beside the wrong
  one as the control, and measure both before and after.** One value often feeds both. Playing Kyle
  on Duty, the person found the house *"pretty much spot on"* and the yard *"a little brighter than
  the original"*; the fog's colour also greys a room's far end, and lowering it for the yard took 4
  to 6 points off every room. The rooms were in the same run, so the numbers caught it before the
  person was asked to approve the change. Dragon keeps *"the half that already reads as reasonable:
  it is the part a fix can break"*, and Extra Sapien compared its great hall pixel by pixel while
  changing what stood beside it; neither had written it down.

#### When you are about to trust a measurement

- **A null result is not a result until something in the same run has come back non-null.** A
  measurement cannot tell you it is blind. Set the effect absurdly high, confirm the instrument sees
  that, then dial back and read the real number. Dragon paid for it six times in one round, and a
  bad null pushes the design as well as costing the time, because *nothing happened* always reads
  as *not enough*.
- **Two wrong guesses mean the instrument is missing, not the answer.** Build a way to see the
  thing, a readout, a count, a distance, before a third fix; two right guesses that are not the
  cause mean the same. When a stage produces too few of something, count what exists before tuning
  what rejects it. And after two wrong guesses at a design, ask for their picture, or for how other
  games, old or new, have done it. Dragon paid for it three times in three rounds before it became
  a rule: the last time, three staged approaches missed, and a readout answered in one run.
- **Draw anything with a shape before you tune it, and reduce the scene before you read the
  frame.** A summary statistic is a projection, and the defect is usually in the dimension it threw
  away: a river of 12.5 km and a river going round in circles are the same number. A frame that
  differs is not evidence until you know what else in it could have. Take the frame from the camera
  the player has, reach a posed state by a second route before trusting it, and judge anything with
  a front while it moves: every animal on dragon's island ran tail first from the day it was drawn,
  through a sequence of stills.
- **When a thing has a destination, measure the distance left to it, not the state it is in.** A
  count by state said every fleeing villager was correctly *leaving*; metres still to go said two of
  them had dithered 350 m short of a cave for eleven minutes.
- **When the design promises what happens if the player does nothing, trace the nothing, for longer
  than anything else waits.** No test waits twenty minutes, and nobody spends a sitting staying
  away. Twenty minutes of dragon's island left alone broke two of its promises.
- **Try a change on cases it was not developed against.** The cases a change is traced on become
  the cases it is right about. Dragon's routes were fixed and counted on four seeds, and on a fifth
  that nobody had counted, a whole township stood at a wall 85 m from home.

#### When you are about to trust a test or a check

- **A test earns trust by failing: show that each new one fails with the fix taken out, on an
  assertion rather than a timeout.** Assert the relationship that has stopped changing, not the
  number still being tuned, and a motion by its course as well as by where it ends: a test named
  for a motion and asserted on an end state passes every motion that ends there. A game in dragon
  that threw before its test hook was installed failed the boot test only at its timeout, 97 s
  later, and would have taken the whole suite about half an hour to go red.
- **After adding a state to something other features already read, run their tests, not only
  yours.** The tests written beside a new state all ask whether the new thing works. Dragon's
  sheltering villagers walked calmly indoors past the dragon, green across twenty unit tests and
  eight new end-to-end ones, and a round-one test of the villagers caught it.
- **Booted is not drawn: before a test draws a frame, ask whether it could fail with nothing wrong
  on the screen.** How the picture looks is found at the game; a test checks state. Draw only for
  what a playtest cannot see, a shader that fails to compile, a GL error. Dragon's eight tests that
  drew were 7% of its suite, a third of its time and every one of CI's timeouts. The person put it
  this way: *"we only need a test to draw something when we need to check 'does this look
  correct?' … that's what our playtest sessions are for."*
- **When a test needs a thing from the world, ask for it by the property it needs, and fail with
  that property's name when there is none.** *The first village* stood for people in their yards,
  on level ground; when the world moved, the test failed on an assertion about something else.
  Dragon counted about twenty-five such failures against eight real defects caught.
- **When a failure has been put down to whoever ran the check, change the check so that it cannot
  happen, and make a check that could borrow something already running start its own.** Running it
  again untouched turns the checks green and leaves the trap. Dragon's suite lost runs five times to
  a dev server reloading pages under it, and passed a checkout with a bug in it because another
  checkout's server answered on the port; the end-to-end setup that ships here carries both fixes.
  Nor is a timeout a flake until it has been timed on both commits: one ran 48 s before a fix and
  66 s after.
- **Grep for the new text after a scripted edit, after one that was reported as stopped, and after
  the context has been summarised.** An edit that silently matches nothing is worse than one that
  fails, and a command reported as stopped may have run partway, so read the file before saying what
  it holds. After one such summary of an agent's context, it expected nine changed files and
  `git status` showed four.

#### When you are about to set a test's time limit

- **Set it from a run at CI's speed, not from a run here: `npm run test:e2e:slow`.** A development
  machine draws faster than CI's runner. Extra Sapien's CI first ran 112 commits into a branch. Two
  tests whose limits had been set in a four-core session failed there, on a runner that drew 2.8
  times slower, with nothing wrong in the game. Pinned to one core, the session failed them the same
  way.

#### When you are about to plan, merge or hand over

- **When you plan a round of work, read the parked questions as dependencies rather than as a
  backlog.** They are in two places: `OPEN-QUESTIONS.md`'s DEFER, and the log's entries tagged
  `[later]` (`grep -n '\[later\]' docs/DESIGN-LOG.md`). A parking note is a photograph of the day it
  was written, and what makes it stale is usually work scheduled afterwards, so nothing edits it.
  Ask of each parked entry which of the new work makes it blocking. Dragon's note on how the dragon
  comes down said it was waiting on appetite rather than on a dependency, one session before a plan
  that needed the dragon to land on a ledge.
- **When two branches meet, read each side's log for what it said the other would need, and read
  main's log as it stands before writing that nothing has recorded something.** A note in *Changed
  elsewhere* about another session's work is a task with no owner. In dragon, one session wrote
  that the other's villagers would walk the floors of lochs until that session's map asked about
  water; the merge fixed the two tests that failed and nothing that had only been written down, and
  a review found a township walking sixteen metres down a loch's bed. And an afternoon of measuring
  reported as unrecorded a finding that had reached main's log four hours before.
- **When you write words an agent will read before it works with someone, write them in the voice
  you want it to use with them, and say where the ideas in them came from.** An agent takes the
  register of its instructions along with their rules, and a word travels by itself: nothing told
  dragon's agents to treat the person as a judge, and a log label, *The ruling*, copied from entry
  to entry, did it anyway.
- **When the same tool has been built twice, make it a skill (an agent workflow in
  `.claude/skills/`), and test the skill against a planted defect, with it and without it.** Plant
  the defect as a parentless commit so no history gives it away, and compare time as well as
  verdicts: dragon's animation skill found a planted defect in 37 minutes against 64 without it, and
  on a case it was blind to took 71 against 61, because the run believed it first. What the test
  runs built for themselves is what the skill should have shipped with, and a true negative is a
  claim like any other: the gulls it passed as healthy were spinning on the spot.
- **Tour the whole game in frames on the merged head, and look at every sheet.** It is the seams
  between branches that break, and no test sits on a seam. With every test green, Extra Sapien's
  first tour after a merge found 22 defects where four places built apart had met. A second tour
  found 10 more where their separate fixes met.

#### When you are about to run several builders at once

- **Run no more at once than the machine can draw for: two, on four cores.** Each builder boots
  its own browser for frames and for the suite. Four at once on a four-core session put the load at
  16 to 23 and made every frame capture three to ten times slower. End-to-end tests failed on their
  time limits, and the four took longer than two rounds of two would have.
- **Have each builder commit as it goes, on a branch of its own.** A container restart stopped two
  of Extra Sapien's builders with their work uncommitted. It survived only because the disk did,
  and two more agents finished it from the files and the transcripts.
- **Name every shared thing in the brief, and give each builder its share.** All of Extra Sapien's
  tangles between agents were about sharing:
  - six researchers spent one search budget in the order they were launched;
  - two prototypes wrote to one scratch folder;
  - a message resumed a second copy of an agent that was still running.

  Builders split by what they read, each shared file with one owner, merged without a conflict.

- **Before a builder starts in a worktree, have it check that the worktree holds your latest
  commits.** An agent's worktree is cut from the default branch, not from the branch the session is
  on. Every one of Kyle on Duty's builders started from the template's first commit, and had to
  move itself onto the session's branch; one move was refused by a permission check. Sandworm paid
  for it too and made it a rule of its own, and Extra Sapien's worktrees were cut from main twice in
  one day, so that one builder measured code that was no longer there.

### This project's own

*None yet. The first rule this project learns goes here, in the shape above, with the design-log
entry it came from.*

Read this section, and the last three entries of [`DESIGN-LOG.md`](./DESIGN-LOG.md), before
proposing a plan.
