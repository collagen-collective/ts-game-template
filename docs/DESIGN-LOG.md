# Design Log

> **What we tried, and what happened.** Past tense, oldest first.
>
> Companions: [`CHARTER.md`](./CHARTER.md) is what is settled.
> [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md) is what we still have to find out.

**Why this file exists.** A charter states conclusions. It cannot hold the reasoning that produced
them, or the dead ends, or the places where solving one problem quietly changed the answer to
another one upstream. Read end to end, this is the story of how the design got where it is. It is
also where you see one decision quietly changing another, which is what the **Changed elsewhere**
line on each entry is for — that line is the one people skip and the one that is worth most later.

**Rules for this file.** Append only. Never edit an old entry to make it agree with current
thinking, because an entry is a historical account and a historical account cannot go stale. Order
is chronological rather than by system, deliberately: the chronology is the part that is hard to
reconstruct, and grouping is the part a search recovers for free. Tags in brackets are for
searching. Dates before the first commit are approximate.

**What earns an entry.** A decision that was reversed. A decision that cost something. A thing that
was built and then deleted. A playtest. And any moment where solving one problem changed an answer
somewhere else. Not routine implementation, and not decisions nobody has ever questioned — those
are the Charter's business.

**A playtest's entry says so in its title, and carries the date it was played.** Not because a tag
is not enough, but because the headings are the index, and a playtest titled by the conclusion it
reached disappears into it. In one game built from this template, eleven entries in two days
carried `[play]`, every one titled by what that stretch of play concluded, and a reader of the
headings came away thinking the game had gone unplayed for three days. It had been played
repeatedly. The data was there and the index was not, and the index is what a person reads.

The `design-log` skill has the rest: the tags, the shape a playtest's entry has grown into, and how
an entry that closes an earlier question says so.

*This file arrived as a template with no entries, which is correct: a design log cannot be
inherited. The block below is the entry form. Delete it once there is a real first entry. A good
first entry is the project's founding commitments, written down the day they are chosen, while the
reasoning is still obvious enough that nobody thinks it is worth recording.*

---

### `<YYYY-MM-DD>` · `<What this entry is about, in a short phrase>` `[tag]` `[tag]`

**Problem.** *`<What was actually wrong or unanswered. Written as it looked at the time, not as it
looks now that you know the answer.>`*

**Attempt.** *`<What was built or decided, specifically enough to picture.>`*

**Outcome.** *`<Held, removed on a date, reversed, or still in progress. Say which. Be willing to
write down that it failed — a log that only records successes is advertising, and nobody consults
advertising.>`*

**Learned.** *`<The transferable part, stated so it can be applied to something else. If there is a
rule in here, state it as a rule.>`*

**Changed elsewhere.** *`<What this forced, allowed, or invalidated somewhere else in the design.
If the honest answer is "nothing", write nothing — but check twice, because this is where the
expensive couplings hide.>`*
