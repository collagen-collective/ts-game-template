---
name: design-log
description: Append an entry to docs/DESIGN-LOG.md. Use when a design question was settled, a thing was tried and something was learned from it, a person played the game, a collision was decided, or main was merged in — and whenever the person you're working with says "log this" or "write it up". Not for recording that code was written.
---

# Appending to the design log

The log is past tense: what was tried and what happened. It is **append only** — never edit an old
entry to agree with current thinking, because an entry is a historical account and a historical
account cannot go stale. If today contradicts an old entry, that is a new entry.

Entries are chronological, not grouped by system. Grouping is what a search recovers for free; the
chronology is the part that is hard to reconstruct.

This skill came from dragon, a game built from this template, whose log reached four hundred
entries in its first two weeks. What it says was paid for there, and the examples are dragon's.

## The heading

```
### YYYY-MM-DD · A title that says what happened `[tag]` `[tag]`
```

Get the date with `date +%F` rather than guessing it.

**If the entry is a playtest, say so in the title, and date the heading to when it was played.**
Begin the title with *Playtest:*. The tag alone is not enough: the headings are how this file is
skimmed, and a playtest titled by the conclusion it reached disappears into the index. Paid for
once already — eleven `[play]` entries in two days, and a reader came away thinking the game had
gone unplayed for three.

The title is a sentence, not a label — "The ban was on telling, and the signs stay", not "Sign
placement". Two clauses is the house rhythm, and the second usually carries the surprise.

## Tags

Tags exist to be searched, so the rule is **reuse one rather than coining a synonym**. Before
inventing a tag, grep the file for what is already in use:

```bash
grep -o '`\[[a-z-]*\]`' docs/DESIGN-LOG.md | sort | uniq -c | sort -rn
```

Four tags transfer to any project and are worth using from the first entry: `[process]` for how the
work itself is done, `[build]` for tooling and pipeline, `[play]` for anything a person playing it
told you, and `[feel]` for the texture of a system rather than its rules. The rest of the vocabulary
is this project's own and accumulates one system at a time — coin a tag when a second entry wants
it, not in advance. Dragon's log grew `[playtest]` beside `[play]` in its first week, and a search
for its sittings has had to ask for both ever since.

## Two status tags, and they describe the new entry

Those are subject tags. Two more sit on a different axis and say what an entry *does* to the queue:

- **`[later]`** — this entry parks a question. `OPEN-QUESTIONS.md` is for questions about what
  exists, whether to play, decide or defer, so a real question about something that does not exist
  yet lands here instead. It must carry **the tell** — what good and bad look like — and
  **what has to exist first**, because that second thing is the trigger that makes it findable at
  the right moment. A parked question with no tell is a note to self, and the tell was the whole
  reason it was worth writing down. (Before anything is built, the premise's own open questions are
  the exception: `/gettingstarted` files them in `OPEN-QUESTIONS.md`, because answering them is
  what the first build is for.)
- **`[resolved]`** — this entry closes a question an earlier entry left open, and it names which.
  Not only `[later]` ones: an entry that ends by naming what it did not settle, or that writes a
  cost down as a deferred bill, has left a question open just as squarely.

  **What does not earn it: a citation.** A log like this references its own past constantly — *the
  same shape as the finding on the 18th*, *predicted at the rig*, *one entry earlier without being
  the same mistake* — and almost none of that is resolution. If a `resolves` would mean *mentions*,
  leave it off. The test is whether the earlier entry named something as open and this one closes
  it.

**Both tags go on the new entry. Neither is ever added to an old one.** That is the append-only rule
and it has no exception: a tag added to a prior entry is still an edit to a historical account, and
the fact that it is only an index does not make it not an edit.

## `Resolves`, and why entries need no ids

A closing entry carries one more run-in label, first, before **Problem**:

```
**Resolves.** `2026-09-25 · The animals' instruments become a skill, and the gulls it passed as
healthy were spinning on the spot` — *what they picture a flock doing once it is up*.
```

**The id is the heading**, and that is the whole scheme. Date plus title is unique across every entry
in the file and always has been, so it identifies one entry exactly, a human can read it, and `grep`
finds it in one hop. Anything shorter — a uuid, a slug, an ordinal — would have to be **written into**
the entry it names, and retrofitting an id onto entries that already exist is the same append-only
violation as tagging them, spread over hundreds of edits instead of one. A derived id costs nothing
and cannot be inconsistent with what it names.

Quote enough of the title to be unique and cite the date; a distinctive fragment is fine. An entry
that closes only part of a question says **Partly resolves.** and names the part.

**And because the id is the heading, granularity is free.** There is no rule of one entry per day
or per session: a date can carry as many entries as it needs and each is still addressable. Split
when a session did things on different axes — a shape and the instrument that made the shape
arguable are two subjects, not one — and keep it together when the parts only make sense in
sequence. The only question worth asking is which one a reader would rather find. Do not pad a
session into several entries, and do not make one entry keep changing subject to avoid a second.

## The beats

Most entries move through **Problem**, **Attempt**, **Outcome**, **Learned**, and **Changed
elsewhere**, as bold run-in labels — the form block at the bottom of `docs/DESIGN-LOG.md` states
each one's job, until a real first entry replaces it. It is a voice, not a form: expect roughly half
of entries to drop a beat they do not need, and many to carry an extra bold label of their own where
the entry has a second half worth naming. **Found and left** is one worth having: something noticed
on the way and out of this entry's scope, written down so that nobody chases it again unawares.
Follow the shape of what happened rather than filling the boxes.

When that second half is a decision made with the person, label it **The decision**, and give it in
their own words where they gave them. A ruling is handed down by a judge; these are worked out
together. Dragon's log called them *the ruling* for its first ten days, and nothing in its rules
told an agent to treat the person as a judge: the label, copied from entry to entry, did it anyway.

Two beats are worth protecting:

- **Changed elsewhere** is why the file exists. It is where solving one problem quietly changed the
  answer to another one upstream, and it is the only place those loops are visible. If a decision
  edited the Charter or moved something in `OPEN-QUESTIONS.md`, say which section.
  **And if the decision *removed* something, grep all three documents for what cited it before
  closing the entry.** Most sentences in a charter are a conclusion and a reason; retire the reason
  and the conclusion reads perfectly well forever, so nothing will ever fail to tell you. The
  moment of the decision is the only cheap time to catch it, because it is the only time you still
  know the word to search for.
- **Learned** is the transferable sentence, and it should still be true about the next problem
  nobody has thought of yet. If it only restates the outcome, the entry has not finished.
  **And if it is really a rule, put it where rules are kept as well.** A Learned has a trigger and
  a verb or it has neither — "after a scripted edit, grep for the new text" fires on its own, "the
  instrument was missing what the question needed" cannot, because there is nothing in it to obey.
  When it fires, add it to the Charter's §5, under *This project's own*, in that list's shape, and
  say so under **Changed elsewhere**. Read §5 first: a rule already there, inherited or not, wants
  its new evidence rather than a second copy of itself. The log is append-only and read backwards; a
  rule left only here has been filed where nobody looks before acting, which is how the same lesson
  gets written three times.

## Whose words are whose

A week on, a log that mixes the person's decisions with an agent's calls reads as though every
sentence carried the same authority, and nothing in it says otherwise. So keep them apart where they
are written:

- **Their decisions, in their words.** Quote them. A paraphrase is your reading of what they said,
  and it is the reading that will be cited.
- **An agent's own calls, listed as the agent's**, each with the reason it protects. As one of
  dragon's entries learned, a call written down without its reason could only have been defended or
  thrown out whole. Dragon's first entry listed seven of them under its title's own promise, *so
  they stay distinguishable*.
- **The build's readings**, where their words left an edge open and the build had to choose one.
  Say so, and name the value that decided it, so they can move it.
- **What they did not say.** Silence is not a decision, and a general "yes" closes nothing in
  particular. Write down which open questions it did not answer, and ask.

## The shapes entries have grown into

These are a voice too, not forms. They are written here because a convention that lives only in
the entries spreads by imitation: an agent told to match the last few entries learns whatever they
happen to say, which is how *the ruling* travelled. Written down, a shape can be chosen rather than
caught.

**A playtest.** By its second week, dragon's playtests had settled into a shape worth starting from:

- **Played.** When, by whom, which build (the commit), and where in the game.
- **What worked, and it is the half to protect.** In their words, one thing at a time. It is the
  half that gets skipped, and the only half that tells the next change what not to break.
- **What they expected.** What they thought would happen, before what did. It is the sentence worth
  most, because an agent can find a defect and cannot find an expectation.
- **What they must have been able to see to say it.** A complaint that the *second* beacon did not
  light is evidence that the first one was legible at range, that they could tell two apart at a
  distance, and that they were reading the network rather than the scenery.
- **Not said.** What the sitting did not reach or did not answer, so that nobody reads silence as a
  decision.
- **What it asked for**, and **The decision**, where one was made.

If a person's notes do not say whether they were played or read off frames, ask before logging
them. A sitting logged as notes on frames drops out of the count of how often the game has been
played, and that count is the one thing the log cannot rebuild. When they agree to a look from
frames, say that it was from frames: it still wants playing.

**A build.** Ends on **What it needs from a person**: a few things worth trying in a minute of play,
with where to find them (a seed and a place, a key, a setting); what good and bad would look like;
and the number most likely to feel wrong, labelled as telemetry rather than as judgment. Offered,
not assigned.

**A merge of main.** What came in. What each side's log said the other would need, read from both
sides' **Changed elsewhere**, and done or handed on. What the merge made untrue. And any collision
that was behaviour rather than text, which no merge tool can see: two actions on one key, or a fix
that has to be made again in a file the other side rewrote.

**A brief picked up from another session.** Who handed it on, and what it asked. What its numbers
came to when rebuilt, and **Where the brief was wrong**, if it was: notes written from reading code
tend to be right about where things are and wrong one step past that.

**A plan.** Says that it is a plan, and that nothing is built yet. The entry that reports the round
built resolves it, and ends on what is left, measured, for the person to choose from.

## Before writing

Read the last two or three entries. The register is specific, argumentative and unhedged, and it is
easier to match than to describe. Match their register, and check their labels against this skill
before you copy them.

**If there are none yet**, the file still holds its template form block and the note above it. Read
both — the note says what the good first entry is, and that the form block gets deleted once a real
entry replaces it. The `/gettingstarted` skill writes that first entry as its closing step, so if
this project has not been through it, say so rather than quietly front-running it.
