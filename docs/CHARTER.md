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
template's, stated in [`../CLAUDE.md`](../CLAUDE.md) and in the [README](../README.md). The rest
are below, grouped by the moment each one is for. How agents work with the person in every session
is in `CLAUDE.md` under *Working together*; the rules here are for particular moments.

A few words recur below. *The person* is the human designing this game, and *a designer* the person
on another game, in an example. A *sitting* is one stretch of the person playing a build. An
*instrument* is anything built to show or measure what the game is doing, such as a debug readout, a
count or a screenshot. A *builder* is a sub-agent building one piece of the work alongside others.
The README's *Words we use* has the rest.

They are defaults, not findings. Keep them, prune them or argue with them, deliberately, and log it
when you do. As this project learns rules of its own, write them under *This project's own*, in the
same shape. A rule this project learned outranks one it was handed, and an inherited rule this
project learns again for itself moves to *This project's own*, with its own *Why* and its
design-log entry.

Every rule has the same shape:

- **The reason first**, in plain text: the failure the rule prevents, stated so that it holds in a
  game nobody has built yet. A rule without its reason gets argued with the first time it is
  inconvenient.
- **Then the rule, in bold**: a trigger and an action, so that a reader skimming for what to do at
  this moment reads only the bold. *After a scripted edit, grep for the new text* is something to
  act on; *the instrument was missing what the question needed* is not, because nothing in it says
  when, or what to do. A sentence or two on how may follow it.
- **Last, where one helps, an example**, marked *For example:*: one concrete scene, for a rule whose
  moment is hard to recognise from inside it. It shows what the moment looks like; it is not
  evidence, so it carries no tally of how often or how badly. Leave it out when the rule is plain
  without it.

A rule under *This project's own* ends with the design-log entry it came from.

### Inherited

From earlier games built from this template, where the lesson applies to any game rather than to
one game's design or technology.

#### When you are about to ask the person something

- Design choices are rarely a clean multiple choice: the answer may be a combination, an order, or
  something nobody listed, and a list of options claims to be complete at the moment you know least.
  **When putting a choice before them, leave room for several selections, for what orders them, and
  for an answer not on the list.**

  *For example:* Asked whether resistance to the player should read as antagonism or as
  inconvenience, a designer answered both, as a ladder from one to the other. A question that ended
  *or something else* got the reading nobody had offered.

- Whether something looks, moves or sounds right is hard to settle in words, which each reader
  pictures differently, and the eye and ear compare whatever differs most, not what you meant them
  to compare. **When the question is how something looks, moves or sounds, ask in that medium, vary
  one thing at a time, and match a compared pair on everything but the thing being compared.** Show
  each option at the same moments, so that the moment is not what differs.

  *For example:* Amber and violet were put side by side at different brightness, and the choice went
  by the brightness.

- A choice made from close-ups is a choice about the close-up. In play, the same setting is seen at
  every distance and adds up across the whole world. **When they choose from close-ups, show them
  what the choice adds up to in play before building on it.**

  *For example:* Settings for mountain ridges were chosen from close frames that compared well. Seen
  in play, they nearly doubled the high ground, and the designer chose again.

- Options played in separate sittings are compared against a memory, and memory is a poor judge of
  small differences. **When only play can judge between options, build them into the game behind a
  switch (a URL parameter, say), and let them compare in one sitting.** Send each option as a whole
  link to open, not a parameter to add to one, and show on the readout which option is running, so
  that a switch the game ignored is caught (*A null result is not a result…*, below). Once they have
  chosen, delete the others or keep the switch as a debugging tool, and say which.

- A tell is something a player does that was agreed in advance to be a signal to re-examine the
  design. But the person is both a designer and a player, and switches between the two while
  playing, so the same act can have another reason than the one agreed. **When a tell fires, ask
  what they were trying to do before acting on it.**

  *For example:* A world map was built as a debug tool, and opening it often was agreed to mean the
  world was hard to read. The designer did open it often: not to find their way, but to check
  whether the rest of the world had been built yet. Half the land turned out to be empty.

- When something a player expected to find, hear or feel is not there, the cause can be anywhere
  along the way: the directions they were given, where they went, what they did, as well as the
  thing itself. Only the last is a design question, and the others are easy to mistake for it.
  **When they report not finding, hearing or feeling something, walk back through what they did with
  them before acting on it: rule out the route (could they get to it?) before asking about the thing
  (once there, could they perceive it?).** Talking it through finds the cause much as explaining
  code aloud does.

  *For example:* While ravens were being added to a game, a designer was asked to judge how hard
  they were to spot from above, and was given coordinates for three places they spawned. They went
  looking and found none, and the natural next question was whether to make ravens easier to see.
  Talking it through showed that the coordinates were for something related but separate, and had
  sent them to the wrong places. Given the right ones, they found the ravens, and said a raven is
  something you come across by chance. *Easier to see* would have solved a problem that did not
  exist.

- A suggestion comes with a purpose, and a change can succeed at one purpose and fail at another.
  **When you measure the effect of their suggestion, measure it against the purpose they gave, not
  one you supplied.**

  *For example:* A designer asked for denser forest so that a player flying overhead would lose
  sight of fleeing villagers. A script ranked candidate changes by whether villagers had a covered
  escape route, an agent's idea of what forest was for, and put denser forest last. It had measured
  a purpose the designer never had.

- Every option has costs, there is usually more than one way to pay them, and what something costs
  changes as the game does. **When you set an option aside for what it costs, ask first what else
  could pay that cost.**

  *For example:* While a tutorial was being designed, an agent set aside the strongest option
  because of what it cost. The designer chose it anyway, and both halves of its price turned out to
  be payable once framed differently.

- Questions the person answers from memory, or after a sitting, do not depend on each other, and
  asked one by one they cost a message each. **When there are several questions only the person can
  answer, send them together: ranked by how much each answer changes the game, each with your guess,
  and each naming the value it sets.** A guess lets them answer with a yes, and a named value means
  each answer changes something straight away. One at a time is right for the founding interview
  (`gettingstarted`), where each answer shapes the next question.

  *For example:* Eight questions, ranked from the many that research and builders had raised, went
  to a designer at once. They answered all eight in one message after a sitting, with more than was
  asked, and every answer had set its value within the hour.

#### When you are about to build something

- A model of the world built first sets the terms the player's experience then has to fit, and the
  player ends up bolted on top of it. **Build from the player outward: a system earns its place by
  what the player will see, hear or have to do differently because of it, and is modelled that far
  and no further.** Simulating a fair bit is fine; starting from the world's model and hanging the
  player on it is not.

  *For example:* A designer, on what *not a simulation* meant for their game: *"we specifically
  should not put that first, then figure out how to bolt being a dragon on top of that."*

- Old code gives confident answers in places nothing reached before, and nobody has checked them.
  And an action that holds the player still changes what every other action can do there. **When a
  new action or motion reaches where nothing went before, trace the old systems there, and decide
  what every other action does while one holds the player still.**

  *For example:* A dragon's new backward wingbeat was right the first time it was written, and wrong
  in two old places, its lift and its thrust, neither of them in the new code. An action that held
  the dragon at a cave's mouth was built around breathing fire; in the first sitting there, the
  designer roared instead, and watched the dragon's head go up.

- Two copies of one thing have to be kept in step for ever, and the seam between them keeps
  producing defects. With one copy, what the game shows is what the code says, and a change has one
  place to go. **When two copies of one thing disagree, delete one rather than keep them in step.**
  Ask it of a library before adopting one, too: a library that brings its own copy of something adds
  a pair.

  *For example:* A designer's reason for it: *"you keep the game WYSIWYG and honest. And if we
  needed that to change, we would know exactly where to go."*

- Tuning a rule of thumb moves its failures around rather than removing them, and a problem that has
  resisted three tunings often has a known algorithm that needs none. **When a third tuning of a
  rule of thumb has failed, look for an algorithm that can be shown to be correct.**

  *For example:* A session that read one game's whole log found that every tuned rule that gave way
  to a textbook algorithm had worked, and wrote that *the tuning that went nowhere was the agent's*.

#### When you are about to tune how something plays

- Every beat of a game waits on some condition, and a wait that can never come true is invisible
  until something reaches it. A bot reaches them all in seconds; a screenshot shows one moment.
  **Before looking at screenshots of a game, play the whole of it with a bot in Node.** A game that
  cannot be lost, or has no end, traces a whole sitting instead.

  *For example:* A bot's first full run found a shut door that could be walked round, in under a
  second. Another's found enemies standing still on a crate, and a path that could not climb a
  stair; later, the same bot, run with each of two rule changes undone in turn, said which of them
  had made it lose sooner.

#### When you are about to change how something looks or sounds

- One value often feeds both the part the person called right and the part they did not, so a fix to
  the wrong part can quietly break the right one, and nobody is watching the part that was right.
  **When the person says one part is right and another is not, keep the right part in the same run
  as the control, and measure both before and after.**

  *For example:* A designer found the house *"pretty much spot on"* and the yard *"a little brighter
  than the original"*. The fog's colour also greys a room's far end, so lowering it for the yard
  darkened every room; the rooms were measured in the same run, and the numbers showed it before the
  change went back to the designer.

#### When you are about to trust a measurement

- A measurement cannot tell you it is blind, and a false *nothing happened* reads as *not enough*,
  which pushes the design the wrong way. **A null result is not a result until something in the same
  run has come back non-null.** Set the effect absurdly high, confirm the instrument sees it, then
  dial back and read the real number. When the nothing comes from the person rather than an
  instrument, walk it back with them (*When they report not finding, hearing or feeling something*,
  above).

  *For example:* Two options sent to a designer to compare came back as identical. The switch
  between them had been added to an address the game did not read, so both had loaded the default,
  and the readout's line naming the option that was running was all that caught it.

- A third guess made without seeing the thing comes from the same blind spot as the first two, and a
  way to see it usually answers in one run. **After two wrong guesses, build a way to see the thing,
  a readout, a count, a distance, before a third fix.** Two right guesses that turn out not to be
  the cause mean the same. When a stage produces too few of something, count what exists before
  tuning what rejects it. And after two wrong guesses at a design, ask for their picture, or for how
  other games, old or new, have done it.

  *For example:* Three approaches to one problem, tried in turn, all missed; a readout built
  afterwards answered it in one run.

- A summary number is a projection, and the defect is usually in the dimension it threw away. A
  frame that differs is not evidence until you know what else in it could have made the difference.
  **Draw anything with a shape before you tune it, and reduce the scene before you read the frame.**
  Take the frame from the camera the player has, reach a posed state by a second route before
  trusting it, and judge anything with a front while it moves.

  *For example:* A river 12.5 km long and a river going round in circles are the same number. Every
  animal in one game ran tail first from the day it was drawn, through a sequence of stills that
  never showed it.

- A state says what a thing means to do; the distance says whether it is getting there. Something
  stuck reports the right state for ever. **When a thing has a destination, measure the distance
  left to it, not the state it is in.**

  *For example:* A count by state said every fleeing villager was correctly *leaving*; the distance
  left said two of them had dithered 350 m short of shelter for eleven minutes.

- No test waits twenty minutes, and nobody spends a sitting staying away, so what happens while the
  player is idle is the part nothing checks. **When the design promises what happens if the player
  does nothing, trace the nothing, for longer than anything else waits.**

  *For example:* A world left alone for twenty minutes broke two of the promises its design made
  about it.

- The cases a change is traced on become the cases it is right about. **Try a change on cases it was
  not developed against.**

  *For example:* Routes fixed and checked on four seeds left, on a fifth that nobody had checked, a
  whole town standing at a wall 85 m from home.

#### When you are about to trust a test or a check

- A test that has never failed has not shown that it can, and one that fails only by timing out is
  slow to go red and says nothing about why. A test named for a motion but asserted on an end state
  passes every motion that ends there. **Show that each new test fails with the fix taken out, on an
  assertion rather than a timeout.** Assert the relationship that has stopped changing, not the
  number still being tuned, and a motion by its course as well as by where it ends.

  *For example:* A game that crashed before its test hook was installed failed the boot test only at
  its timeout, a minute and a half later; the whole suite would have taken about half an hour to go
  red.

- The tests written beside a new state all ask whether the new thing works. None of them asks
  whether the old things still do. **After adding a state to something other features already read,
  run their tests, not only yours.**

  *For example:* Villagers given a new sheltering state walked calmly indoors past the dragon, with
  every new test green. An older test of the villagers caught it.

- How the picture looks is judged at the game, and a test checks state. Tests that draw are the
  slowest in a suite and the likeliest to time out on CI, and they check what a person sees in a
  second of play. **Before a test draws a frame, ask whether it could fail with nothing wrong on the
  screen.** Draw only for what a playtest cannot see: a shader that fails to compile, a GL error.

  *For example:* A designer put it this way: *"we only need a test to draw something when we need to
  check 'does this look correct?' … that's what our playtest sessions are for."*

- A test that asks for a particular thing relies, silently, on that thing having the property it
  needs. When the world changes, it fails on an assertion about something else, and looks like a
  real defect. **When a test needs a thing from the world, ask for it by the property it needs, and
  fail with that property's name when there is none.**

  *For example:* *The first village* stood in for people in their yards, on level ground. When the
  world changed, the test failed on an assertion about something else.

- Running a check again untouched turns it green and leaves the trap for the next run, and a check
  that borrows a server already running can end up testing someone else's code. **When a failure has
  been put down to whoever ran the check, change the check so that it cannot happen, and make a
  check that could borrow something already running start its own.** Nor is a timeout a flake until
  it has been timed on both commits.

  *For example:* A suite lost runs to a dev server reloading pages under it, and passed a checkout
  with a bug in it because another checkout's server answered on the port; the end-to-end setup that
  ships here carries both fixes. A timeout put down as a flake ran 48 s before a fix and 66 s after
  it.

- An edit that silently matches nothing is worse than one that fails, a command reported as stopped
  may have run partway, and a summary of a session is a memory of the files, not the files. **Grep
  for the new text after a scripted edit, after one that was reported as stopped, and after the
  context has been summarised.** Read the file before saying what it holds.

  *For example:* After one such summary, an agent expected nine changed files, and `git status`
  showed four.

#### When you are about to set a test's time limit

- A development machine draws faster than CI's runner, so a limit set locally can fail on CI with
  nothing wrong in the game. **Set it from a run at CI's speed, not from a run here:
  `npm run test:e2e:slow`.**

  *For example:* Two tests whose limits were set in a four-core session failed on a CI runner that
  drew 2.8 times slower. Pinned to one core, the session failed them the same way.

#### When you are about to plan, merge or hand over

- A parking note is a photograph of the day it was written. What makes it stale is usually work
  planned afterwards, and nothing goes back to edit it. **When you plan a round of work, read the
  parked questions as dependencies rather than as a backlog.** They are in two places:
  `OPEN-QUESTIONS.md`'s DEFER, and the log's entries tagged `[later]`
  (`grep -n '\[later\]' docs/DESIGN-LOG.md`). Ask of each which of the new work makes it blocking.

  *For example:* A note on how the dragon lands said it was waiting on appetite rather than on
  anything else, one session before a plan that needed the dragon to land on a ledge.

- A note in one side's *Changed elsewhere* about the other side's work is a task with no owner, and
  a merge fixes only what fails. And main's log may have recorded a finding while you were away from
  it. **When two branches meet, read each side's log for what it said the other would need, and read
  main's log as it stands before writing that nothing has recorded something.**

  *For example:* One session wrote that the other's villagers would walk along lake beds until that
  session's map knew about water. The merge fixed the two tests that failed and nothing that had
  only been written down, and a review found a town walking sixteen metres down a lake bed.

- An agent takes the tone of its instructions along with their rules, and a single word can carry an
  attitude that nobody wrote down. **When you write words an agent will read before it works with
  someone, write them in the voice you want it to use with them, and say where the ideas in them
  came from.**

  *For example:* Nothing told one game's agents to treat the designer as a judge. A log label, *The
  ruling*, copied from entry to entry, did it anyway.

- A skill can make an agent faster, or make it trust a wrong answer sooner, and only a trial with
  and without it shows which. What the trial runs build for themselves is what the skill was
  missing. **When the same tool has been built twice, make it a skill (an agent workflow in
  `.claude/skills/`), and test the skill against a planted defect, with it and without it.** Plant
  the defect as a parentless commit so no history gives it away, and compare time as well as
  verdicts. A skill's *nothing wrong* is a claim to check like any other.

  *For example:* One skill found a planted defect in about half the time; on a case it was blind to,
  it was slower than no skill at all, because the agent believed it first. The gulls it passed as
  healthy were spinning on the spot.

- It is the seams between branches that break, and no test sits on a seam. **After merging branches
  built apart, tour the whole game in frames on the merged head, and look at every sheet.**

  *For example:* With every test green, a tour after a merge found defects wherever separately built
  places met, and a second tour found more where their separate fixes met.

#### When you are about to run several builders at once

- Each builder boots its own browser for screenshots and for the suite. Past what the cores can
  carry, every capture slows, end-to-end tests fail on their time limits, and the batch finishes
  later than smaller batches would have. **Run no more at once than the machine can draw for: two,
  on four cores.**

- A container restart takes uncommitted work with it. **Have each builder commit as it goes, on a
  branch of its own.**

  *For example:* A restart stopped two builders with their work uncommitted, and it survived only
  because the disk did.

- Agents working side by side tangle over what they share, not over what they build. **Name every
  shared thing in the brief, and give each builder its share.** Split builders by what they read,
  and give each shared file one owner.

  *For example:* Six researchers spent one search budget in the order they were launched; two
  prototypes wrote to one scratch folder; a message resumed a second copy of an agent that was still
  running. Split by what they read, with one owner for each shared file, the builders after them
  merged without a conflict.

- An agent's worktree is cut from the default branch, not from the branch the session is on, so a
  builder can start from code the session has long since moved past. **Before a builder starts in a
  worktree, have it check that the worktree holds your latest commits.**

  *For example:* Every builder in one session started from the template's first commit, and in
  another, a builder measured code that was no longer there.

### This project's own

*None yet. The first rule this project learns goes here, in the shape above, ending with the
design-log entry it came from.*

Read this section, and the last three entries of [`DESIGN-LOG.md`](./DESIGN-LOG.md), before
proposing a plan.
