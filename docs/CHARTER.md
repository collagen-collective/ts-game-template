# `<project>` Charter

> **What we have figured out so far.** Present tense: the things that are settled, and the
> constraints that settled them. Sections 1 to 4 say what the game is, and a contested proposal is
> checked against section 2 first. Section 5 says how we work.
>
> Companion documents: [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md) is what we still have to find
> out. [`DESIGN-LOG.md`](./DESIGN-LOG.md) is what we tried and what happened.
>
> **Before proposing a plan,** read the opening of section 5, its guidelines for *When you are about
> to plan, merge or hand over*, its *This project's own*, and the last three entries of
> [`DESIGN-LOG.md`](./DESIGN-LOG.md); then check the plan against sections 2 and 3. Read the rest of
> section 5 a moment at a time: when you come to that moment, or when a plan does.
>
> Nothing here describes the game's code, and that is deliberate. A charter that describes the code
> goes out of date the first time the code changes, and once readers know one section is out of
> date, they stop trusting the important ones along with it.

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

## 3. Guidelines for the whole game

A guideline here serves the game that sections 1 and 2 describe. When one pulls against a criterion
in section 2, neither outranks the other: talk it through, case by case. Sometimes the vision is
what matters, and the guideline gives way. Sometimes the pull points at a gap in the outline or the
goals, and that goes to [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md) as a collision, to be worked on.

*Only guidelines that hold across the whole game go here: the criteria above are about what the
game is, and a guideline that governs one system lives with that system, down in section 4.*

*Each guideline states its why, so that when it is inconvenient, the argument starts from its reason
instead of from scratch. Where a guideline has an operational test — some question that is easier
to apply than the guideline itself — write that down too. The test is the part that actually gets
used.*

**`<Guideline, stated as an imperative or a flat assertion.>`**
*`<What it asks for or rules out, in one or two sentences.>`*

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

*None of them describes the code. Keep it that way — see the note at the top of this file.*

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

## 5. How we work

These are the guidelines for particular moments in the work. The guidelines for every moment are in
[`../CLAUDE.md`](../CLAUDE.md): the template's four, which the [README](../README.md) gives with the
evidence behind each, and *Working together*. `CLAUDE.md` also names each moment below, so that an
agent has them in mind all session. Find the moment you are in, and read its bold lines. In short:

- **Planning, merging or handing over:** a note is a snapshot of its day. Read old ones against
  what is true now, write for whoever picks the work up cold, and end on what is left, for the
  person to choose from.
- **Asking the person something:** ask them only what only they can answer, make their answer easy
  to give, and find out what it meant before acting on it.
- **Building something:** ask how they picture it and say it back before you build; start from what
  the player will see, hear or do; keep one way of doing each thing; and let the code answer to the
  Charter, not the Charter to the code.
- **Running several builders at once:** builders tangle over what they share (the machine, the
  container, the files, the commit they start from), so name each shared thing and give each
  builder its share.
- **Measuring, testing or trusting a result:** the scientific method, applied to a game. Measure
  the question, not a proxy for it; calibrate the instrument; observe before guessing again; and
  test beyond what you checked.
- **Handing them a build, or writing up what they played:** their time at the game is the rarest
  thing the project has, so make it easy to give, and keep what it found.

The guidelines under *Inherited* come from earlier games: defaults, not this project's findings, and
a guideline this project learned outranks one it was handed. The person and an agent change this
section together. Either may propose adding, rewording or pruning a guideline; the change is made
once both have worked it through, and the design log records it. *Writing a guideline*, at the end
of this section, says how a guideline is written and where it goes.

A few words recur below. *The person* is the human designing this game, and *a designer* the person
on another game, in an example. A *sitting* is one stretch of the person playing a build. An
*instrument* is anything built to show or measure what the game is doing, such as a debug readout, a
count or a screenshot. A *builder* is a sub-agent building one piece of the work alongside others.
The README's *Words we use* has the rest.

### Inherited

From earlier games built from this template, where the lesson applies to any game rather than to
one game's design or technology.

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

- A skill can make an agent faster, or make it trust a wrong answer sooner, and only a trial with
  and without it shows which. What the trial runs build for themselves is what the skill was
  missing. **When the same tool has been built twice, make it a skill (an agent workflow in
  `.claude/skills/`), and test the skill against a planted defect, with it and without it.** Plant
  the defect as a parentless commit so no history gives it away, and compare time as well as
  verdicts. A skill's *nothing wrong* is a claim to check like any other.

  *For example:* One skill found a planted defect in about half the time; on a case it was blind to,
  it was slower than no skill at all, because the agent believed it first. The gulls it passed as
  healthy were spinning on the spot.

- What the work turns to next is the person's to choose: what this session takes on, what goes to
  another, and when to stop. **When you finish a piece of work, end on what is left, measured, and
  let them choose.** If they run sessions in parallel, as one designer did, something they mention
  may already exist on another branch: build what won't collide, and borrow the rest at the merge.

- A session you start is a colleague picking the work up cold, and an agent takes the register of
  what it reads (a brief, a skill, a log label) into its work and to the person. **When you write
  anything another agent will read before it works with someone, write it the way you would want to
  be briefed: who asked and why it matters, what is known and how it was found, where the ideas in
  it came from, and which parts are guesses.** In a brief, leave the how to them where you can, with
  options rather than steps, ask them to say where it is wrong, and write it as a request, please
  and thank you included. When you are the one briefed, rebuild its measurements before building on
  them, and say where it was wrong.

  *For example:* Notes handed on in one game from reading code were right about where things were,
  and wrong one step past that.

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

  *For example:* Two rounds of words, *bat*, *pterosaur*, *Smaug*, had not settled what a creature
  should look like; one drawing settled it in a look. Separately, two colours were shown side by side
  at different brightness, and the choice followed the brightness rather than the colour.

- A question about a difference the screen does not show cannot be answered, however it is put.
  **Before asking them how something feels, check that the screen shows the difference you are
  asking about.**

  *For example:* In a game about a dragon, a village braced for it and a village abandoned were the
  same picture, so nobody could have answered.

- A choice made from close-ups is a choice about the close-up. In play, the same setting is seen at
  every distance and adds up across the whole world. **When they choose from close-ups, show them
  what the choice adds up to in play before building on it.**

  *For example:* Settings for mountain ridges were chosen from close frames that compared well. Seen
  in play, they nearly doubled the high ground, and the designer chose again.

- Options played in separate sittings are compared against a memory, and memory is a poor judge of
  small differences. **When only play can judge between options, build them into the game behind a
  switch (a URL parameter, say), and let them compare in one sitting.** Send each option as a whole
  link to open, not a parameter to add to one, and show on the readout which option is running, so
  that a switch the game ignored is caught (*A null observation is not a finding…*, below). Once
  they have chosen, delete the others or keep the switch as a debugging tool, and say which.

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

- Rates, ranges, coverage and how something holds up across seeds are where an agent is
  strongest, and asking the person for them would cost a session each. Theirs are the numbers only
  they can take: how the game runs on their machine, how they play, how much of what they expected
  they got. **When the answer is a number you could measure, measure it, and ask them only for the
  numbers only they can take.**

  *For example:* *"I feel like I'm affecting about 40% of the trees I was expecting"* was a
  measurement, and a reach went from 45 m to 70 m on it alone.

#### When you are about to build something

- A model of the world built first sets the terms the player's experience then has to fit, and the
  player ends up bolted on top of it. **Build from the player outward: a system earns its place by
  what the player will see, hear or have to do differently because of it, and is modelled that far
  and no further.** Simulating a fair bit is fine; starting from the world's model and hanging the
  player on it is not.

  *For example:* A designer, on what *not a simulation* meant for their game: *"we specifically
  should not put that first, then figure out how to bolt being a dragon on top of that."*

- Two sources of truth, or two ways of doing one thing, are a maintenance burden, extra to hold in
  mind, and more surface for defects, which collect at the seam between them. **When two tools,
  features or implementations overlap, keep one, and extend it to cover what only the other did.**
  Ask it of a library before adopting one, too: one that brings its own copy of something adds a
  pair.

  *For example:* A designer's reason for it: *"you keep the game WYSIWYG and honest. And if we
  needed that to change, we would know exactly where to go."*

- How it feels they can tell us afterwards; how they picture it working they can tell us
  beforehand, which costs less and gets skipped. A test can only confirm the model that wrote it,
  and the guesses that most need asking are the plausible ones. **Before you build anything with a
  real-world precedent (bells, roads, weather, what a garrison does), ask them how they picture it
  working, even when you feel sure.** It takes thirty seconds, and nothing later can catch what it
  catches.

  *For example:* One game's warning beacons were built from one sentence of the Charter and passed
  every test, but crews posted on a hill for weeks would light for what they see themselves, not
  only for the next hill.

- Their words leave open exactly what a build has to choose, and a read-back finds those places
  while they cost nothing; a distance agreed in words is a look nobody was picturing. **Before you
  build what they described, say back what you understood, and when it is a look, read it back as
  a picture: a frame with the proposal drawn on it.**

  *For example:* In one game, seven readings of how the designer pictured rebinding a key were said
  back and confirmed, and the build needed nothing changed at its first sitting.

- The Charter is upstream of the implementation, so the code answers to it, not the other way
  round. **When the code you have just written disagrees with the Charter, don't rewrite the
  Charter to match it; if the implementation forces a design change, raise it with the person.**

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

#### When you are about to measure, test or trust a result

These guidelines are the scientific method, applied to a game, and each is an instance of one of the
four principles below.

##### Measure the question, not a proxy for it

Every observation stands in for a question. Before trusting one, say what the question is, and check
that the observation answers it rather than an easier question beside it: the purpose someone had in
mind, whether a thing gets where it is going, the property a test depends on, the shape a summary
flattens, and what only the screen or the speakers can show.

- A suggestion comes with a purpose, and a change can succeed at one purpose and fail at another.
  **When you measure the effect of their suggestion, measure it against the purpose they gave, not
  one you supplied.**

  *For example:* A designer asked for denser forest so that a player flying overhead would lose
  sight of fleeing villagers. A script ranked candidate changes by whether villagers had a covered
  escape route, an agent's idea of what forest was for, and put denser forest last. It had measured
  a purpose the designer never had.

- A state says what a thing means to do; the distance says whether it is getting there. Something
  stuck reports the right state for ever. **When a thing has a destination, measure the distance
  left to it, not the state it is in.**

  *For example:* A count by state said every fleeing villager was correctly *leaving*; the distance
  left said two of them had dithered 350 m short of shelter for eleven minutes.

- A test that asks for a particular thing relies, silently, on that thing having the property it
  needs. When the world changes, it fails on an assertion about something else, and looks like a
  real defect. **When a test needs a thing from the world, ask for it by the property it needs, and
  fail with that property's name when there is none.**

  *For example:* *The first village* stood in for people in their yards, on level ground. When the
  world changed, the test failed on an assertion about something else.

- A summary number is a projection, and the defect is usually in the dimension it threw away. A
  frame that differs is not evidence until you know what else in it could have made the difference.
  **Draw anything with a shape before you tune it, and reduce the scene before you read the frame.**
  Take the frame from the camera the player has, reach a posed state by a second route before
  trusting it, and judge anything with a front while it moves.

  *For example:* A river 12.5 km long and a river going round in circles are the same number. Every
  animal in one game ran tail first from the day it was drawn, through a sequence of stills that
  never showed it.

- Some defects exist only on screen, where a test that checks state cannot see them. **When you
  check anything a player sees, look at the frame: pose each state worth seeing with a shots
  script, run `npm run shots`, and look at the sheet it lays the frames out on.** Early on, give the
  game a handle the end-to-end tests can drive it by, one that can step the simulation, place the
  camera, and read the state the screen does not show; `scripts/shots.mjs` says what the script
  exports. With `--tree before=@<commit>`, the same script puts an older commit's frames beside
  this checkout's: the before and after of anything that is looked at rather than measured. The
  `frame-check` skill has the rest: what to ask, what to pose, how to read a sheet, and the
  control.

  *For example:* The day one game's debug readout said where the camera was, *"this looks wrong
  from here"* stopped being a description and became a frame anyone could take again.

- How the picture looks is judged at the game, and a test checks state. Tests that draw are the
  slowest in a suite and the likeliest to time out on CI, and they check what a person sees in a
  second of play. **Before a test draws a frame, ask whether it could fail with nothing wrong on the
  screen.** Draw only for what a playtest cannot see: a shader that fails to compile, a GL error.

  *For example:* A designer put it this way: *"we only need a test to draw something when we need to
  check 'does this look correct?' … that's what our playtest sessions are for."*

- A test checks the end state it was written for; a trace, the game's state printed over a few
  seconds of the simulation running in Node, shows the whole course. Traces are cheap where the
  simulation runs in Node with no renderer. **Before you write or trust a test of how the game's
  state behaves, trace it.** A trace is only as good as its setup, though: when a trace disagrees
  with the game, suspect the trace first, and call the real setup rather than rebuilding it by
  hand. Scratch scripts named `scratch-*` at the repo root are ignored by git for exactly this, and
  what they find goes in the design log. When one proves itself and will be wanted again, commit
  it; as a designer put it, *"At least if we have it in a commit somewhere, we can easily go back
  to it as needed."*

  *For example:* In one game, a one-second trace of the state while a key was held found every
  defect in the flight model and the fire, where their passing tests found none. In another, a
  hand-made copy of one function, missing the body's orientation, produced three plausible stories
  about a broken game before the fault turned out to be the script.

- An agent cannot hear: what a session knows of its game's sound it knows from numbers and
  pictures of the samples. **When you change a sound, or one is reported wrong, render it with
  `npm run takes`, measure each take, and give the person copies matched in loudness to judge, so
  that the louder one does not win for being louder.** It renders the game's own sound offline,
  through a script of the game's own, and lays the takes out beside any older commit's. The
  `sound-check` skill has the rest.

##### Calibrate the instrument

An observation (a number, a pass or a fail, a count, a frame) is not yet a finding. It becomes one
when it is read against its controls and the conditions it was taken under. Any instrument, whether
a test, a check, a count or a readout, can be blind, or can report a signal that is not there, and
its observation looks the same either way. So before trusting one, run the instrument on two cases
whose answers you already know: a *negative control*, which should give no signal, and a
*positive control*, which should give a clear one. Choose them on purpose, from what you know of
the problem and of the instrument. A null observation means something only beside a positive control
that came back non-null; a pass means something only beside a negative control that failed. And
check that nothing around the instrument, its server, its machine or its timing, is deciding what it
reports.

- A blind instrument and a true *nothing happened* give the same observation, and a false *nothing
  happened* reads as *not enough*, which pushes the design the wrong way. **A null observation is
  not a finding until a positive control in the same run has come back non-null.** Set the effect
  absurdly high and confirm the instrument sees it, and run the baseline with no effect and confirm
  it reads zero; then dial back and read the real number. When the nothing comes from the person
  rather than an instrument, walk it back with them (*When they report not finding, hearing or
  feeling something*, above).

  *For example:* Two options sent to a designer to compare came back as identical. The switch
  between them had been added to an address the game did not read, so both had loaded the default,
  and the readout's line naming the option that was running was all that caught it.

- A passing test is an observation; *the bug is fixed* is a finding. A test that has never failed
  has not shown that it can, one that has never passed on known-good behaviour has not shown that it
  passes for the right reason, and one that fails only by timing out is slow to go red and says
  nothing about why. A test named for a motion but asserted on an end state passes every motion that
  ends there. **Before trusting a new test, run it on both controls: with the fix taken out it
  should fail, on an assertion rather than a timeout (the negative control); on a case already known
  to be correct it should pass (the positive control).** Assert the relationship that has stopped
  changing, not the number still being tuned, and a motion by its course as well as by where it
  ends.

  *For example:* A game that crashed before its test hook was installed failed the boot test only at
  its timeout, a minute and a half later; the whole suite would have taken about half an hour to go
  red.

- One value often feeds both the part the person called right and the part they did not, so a fix to
  the wrong part can quietly break the right one, and nobody is watching the part that was right.
  **When the person says one part is right and another is not, keep the right part in the same run
  as a positive control, and measure both before and after.**

  *For example:* A designer found the house *"pretty much spot on"* and the yard *"a little brighter
  than the original"*. The fog's colour also greys a room's far end, so lowering it for the yard
  darkened every room; the rooms were measured in the same run, and the numbers showed it before the
  change went back to the designer.

- A check that depends on its surroundings can fail because of them, or pass because of them, and
  running it again leaves that in place. **When a check fails for a reason outside the code under
  test, change the check so that reason cannot affect it, rather than running it again.** And before
  calling a timeout a flake, time it on both commits: a slowdown your change caused looks exactly
  like one.

  *For example:* A suite lost runs to a dev server reloading pages under it, and passed a checkout
  with a bug in it because another checkout's server answered on the port; the end-to-end setup that
  ships here carries both fixes. A timeout put down as a flake ran 48 s before a fix and 66 s after
  it.

- A development machine draws faster than CI's runner, so a limit set locally can fail on CI with
  nothing wrong in the game. **When you set a test's time limit, set it from a run at CI's speed,
  not from a run here:** `npm run test:e2e:slow`.

  *For example:* Two tests whose limits were set in a four-core session failed on a CI runner that
  drew 2.8 times slower. Pinned to one core, the session failed them the same way.

- An edit that silently matches nothing is worse than one that fails, a command reported as stopped
  may have run partway, and a summary of a session is a memory of the files, not the files. **Grep
  for the new text after a scripted edit, after one that was reported as stopped, and after the
  context has been summarised.** Read the file before saying what it holds.

  *For example:* After one such summary, an agent expected nine changed files, and `git status`
  showed four.

##### Observe before guessing again

When an approach keeps missing, the next attempt should come from new information, not from another
guess or another turn of the same dial.

- When two fixes in a row have missed, the cause is somewhere nobody can see yet, and a third fix
  would be one more guess from the same blind spot. A way to watch what is actually happening
  usually answers in one run. **After two fixes have missed, stop fixing, and build a way to see
  what the code is actually doing at the failure, such as a readout, a count or a distance, before
  trying a third.** Two plausible causes that both turn out not to be it mean the same. When a stage
  produces too few of something, count what exists before tuning what rejects it. And after two
  wrong guesses at a design, ask for their picture, or for how other games, old or new, have done
  it.

  *For example:* Three approaches to one problem, tried in turn, all missed; a readout built
  afterwards answered it in one run.

- Tuning a rule of thumb moves its failures around rather than removing them, and a problem that has
  resisted three tunings often has a known algorithm that needs none. **When a third tuning of a
  rule of thumb has failed, look for an algorithm that can be shown to be correct.**

  *For example:* A session that read one game's whole log found that every tuned rule of thumb that
  gave way to a textbook algorithm had worked, and wrote that *the tuning that went nowhere was the
  agent's*.

##### Test beyond what you checked

Code is known to work only where it has been checked: on the cases it was developed against, in the
context it was written for, in the states and moments someone reached. New contexts, new states,
untried cases, idle time, the parts of the game nobody has reached, and the seams between branches
are all outside that.

- Old code was built against the design and constraints of its day, and even forward-looking code
  can only account for so much. Building on top of it, or running it in a context it was never
  written for, produces interactions nobody planned for, and it answers there as confidently as
  ever. **When new work puts old code in a new context (a new action, a new place, a new state of
  the player), put the old code through its paces again there, and treat it as open to tuning
  along with the new.** Where the new work holds the player still, decide what every other action
  does meanwhile.

  *For example:* A dragon's new backward wingbeat was right the first time it was written, and wrong
  in two old places, its lift and its thrust, neither of them in the new code. An action that held
  the dragon at a cave's mouth was built around breathing fire; in the first sitting there, the
  designer roared instead, and watched the dragon's head go up.

- The tests written beside a new state all ask whether the new thing works. None of them asks
  whether the old things still do. **After adding a state to something other features already read,
  run their tests, not only yours.**

  *For example:* Villagers given a new sheltering state walked calmly indoors past the dragon, with
  every new test green. An older test of the villagers caught it.

- The cases a change is traced on become the cases it is right about. **Try a change on cases it was
  not developed against.**

  *For example:* Routes fixed and checked on four seeds left, on a fifth that nobody had checked, a
  whole town standing at a wall 85 m from home.

- No test waits twenty minutes, and nobody spends a sitting staying away, so what happens while the
  player is idle is the part nothing checks. **When the design promises what happens if the player
  does nothing, trace the nothing, for longer than anything else waits.**

  *For example:* A world left alone for twenty minutes broke two of the promises its design made
  about it.

- A game is a chain of conditions: the door opens once the key is held, the next wave starts once
  this one is cleared. One that can never come true stalls the game silently, in a place nothing
  reaches until a full playthrough does; a test of one system will not see it, and neither will a
  screenshot. **Before tuning a game or posing frames of it, check that it can be finished: script a
  bot that plays it from start to end in Node, and have it report where it stalls.** Once the bot
  exists, run it with each of several changes undone in turn to learn which one made the difference.
  A game with no ending traces a whole sitting instead.

  *For example:* A bot's first full run found a shut door that could be walked round, in under a
  second. Another's found enemies standing still on a crate, and a path that could not climb a
  stair; later, the same bot, run with each of two rule changes undone in turn, said which of them
  had made it lose sooner.

- It is the seams between branches that break, and no test sits on a seam. **After merging branches
  built apart, tour the whole game in frames on the merged head, and look at every sheet.**

  *For example:* With every test green, a tour after a merge found defects wherever separately built
  places met, and a second tour found more where their separate fixes met.

#### When you are about to hand them a build, or write up what they played

- Ten seconds at the game can catch what a whole gate missed, and a sitting needs a build in
  seconds: `npm run verify:play` typechecks, boots and draws the game in that time, where the whole
  gate (`npm run verify`) takes minutes. **When a change touches something a player does, offer
  them a minute of play: push a build that passes `npm run verify:play`, tell them it is there and
  what might be worth trying, and run the whole gate while they play.** Do the same whenever they
  want to play. If the gate goes red, tell them what broke before they report on it, then fix it.

  *For example:* One game's villagers once walked calmly indoors past the dragon, green across
  twenty unit tests and eight new end-to-end tests. Another's gate took five minutes even after it
  had been cut from fifteen, and every sitting used to wait for it.

- Their time at the game is the rarest thing the project has: a finding folded into a commit
  message is lost, and one titled by its conclusion hides that the game was played at all. And a
  defect list is the easy half of what they found: it is not the half that tells you what to
  protect. **After they play, write it down as a playtest, the same day, in an entry that says so
  in its title: what they played, what they *expected*, and — the half that gets skipped — what
  worked.** Read the report for what they must have seen to say it. The `design-log` skill has the
  shape.

  *For example:* A complaint that the *second* beacon did not light said that the first was legible
  at range.

### This project's own

*None yet. The first guideline this project learns goes here, in the shape below, ending with the
design-log entry it came from.*

### Writing a guideline

Every guideline has the same shape:

- **The reason first**, in plain text: the failure the guideline prevents, stated so that it holds
  in a game nobody has built yet, and so that when the guideline is inconvenient, the argument
  starts from its reason instead of from scratch.
- **Then the guideline, in bold**: a trigger and an action, so that a reader skimming for what to do
  at this moment reads only the bold. *After a scripted edit, grep for the new text* is something to
  act on; *the instrument was missing what the question needed* is not, because nothing in it says
  when, or what to do. A sentence or two on how may follow it.
- **Last, where one helps, an example**, marked *For example:*: one concrete scene, for a guideline
  whose moment is hard to recognise from inside it. It shows what the moment looks like; it is not
  evidence, so it carries no tally of how often or how badly. Leave it out when the guideline is
  plain without it.

An inherited guideline goes under the moment it is for, and one about measuring or testing under the
principle it is an instance of. Keep each moment's line in this section's opening true of every
guideline under it, and give a new moment a line of its own and its name in `CLAUDE.md`'s list of
moments.

A guideline this project learns goes under *This project's own*, ending with the design-log entry it
came from. An inherited guideline this project learns again for itself moves there too, with its own
reason and its design-log entry.
