# `<project>` Charter

> **What we have figured out so far.** Present tense: the things that are settled, and the
> constraints that settled them.
>
> Companion documents: [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md) is what we still have to find
> out. [`DESIGN-LOG.md`](./DESIGN-LOG.md) is what we tried and what happened.
>
> Almost nothing here says *how* to build anything, and that omission is deliberate. A charter that
> specifies mechanism goes stale the first time the mechanism changes, and once one section is
> known to be stale, the load-bearing ones stop being trusted along with it.

*This file arrived as a template. Italic text is a prompt to you; anything in angle brackets is a
placeholder. Answer a prompt and delete it. A section you cannot fill in is not a blank to leave
sitting here — it is an entry for [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md).*

---

## 1. What `<project>` is

*One paragraph. The premise, the genre, the fidelity stance. Concrete enough that a stranger could
picture a minute of play. If it needs a second paragraph, it is not settled yet — write down the
part that is and file the rest as an open question.*

*Then the founding commitments: the one, two, or three things that were true before anything else
was decided, and that everything downstream is an attempt to satisfy at once. Name them. Most of
the interesting design work on a game is the tension between its commitments, and you cannot
recognize that work while it is happening unless the commitments are written down.*

**`<Commitment>`.** *`<What it means, and what feeling it is chasing. A commitment that cannot be
contradicted is not one — say what it costs you.>`*

### What a session actually is

*The loop, in the second person, in five or six sentences: what the player does, in what order, and
what they come back with. Then the shape of time — how long a session runs, and what a stack of
sessions adds up to.*

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

*One block per system large enough that a decision about it constrains other systems. Expect
somewhere between four and eight. More than that and some of them are features rather than blocks.*

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

*The rules this project has learned about its own construction.*

*It starts with four inherited from the template, stated in [`../CLAUDE.md`](../CLAUDE.md) and in
the [README](../README.md). Those are defaults rather than findings — they came out of a different
project. As this one earns rules of its own, write them here and say plainly which is which. A rule
you have paid for outranks one you were handed.*

*Read this section, and the last three entries of [`DESIGN-LOG.md`](./DESIGN-LOG.md), before
proposing a plan.*
