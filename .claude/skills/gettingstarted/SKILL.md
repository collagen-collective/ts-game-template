---
name: gettingstarted
description: Walk someone new from this template to a project seed — name the game, fill in the parts of the Charter that are actually settled, file everything unsettled as an open question, and write the first design-log entry. Use when someone has just created a repo from this template, asks how to get started, asks what to do first, or asks how to fill in the placeholders — including when they arrive with a written brief instead of answers.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - AskUserQuestion
  - Bash(rg *)
  - Bash(grep *)
  - Bash(git remote *)
  - Bash(git log *)
  - Bash(npm run template:link*)
  - Bash(date *)
---

# /gettingstarted — from template to project seed

This walks the person you're working with through turning the scaffold into their project. The
output is documents: a named repo, a Charter holding only what is genuinely settled, an
OPEN-QUESTIONS file holding everything that is not, and a first design-log entry. No code.

## The guideline behind everything below

**You are interviewing, not designing.** Every noun in the finished Charter should be traceable to
something they said out loud. You may tighten their prose, cut a hedge, or ask them to say it again
shorter. You may not introduce design content they did not give you — not a mechanic, not a genre
convention, not a "games like this usually…" suggestion offered as a fill-in.

When they do not know the answer, that is a real and expected outcome, not a gap to paper over.
**File it in `docs/OPEN-QUESTIONS.md` under the right tag and move on.** A Charter that is three
sentences long and entirely true is a better seed than a full one that is half invented. Nobody
will remember which half you made up, and by the time it matters everyone will be treating all of
it as settled.

If they ask you to make something up anyway, say once that it will read as settled later, and then
do what they asked — and log in `docs/DESIGN-LOG.md` that the entry was agent-drafted rather than
decided.

**Say it back before you write it.** Before a section goes into the Charter, tell them what you are
about to write, in the words you will use, and let them correct it. Their answer leaves open exactly
what the written version has to choose, and a read-back finds those places while they cost nothing.
In one game built from this template, seven readings of one description were said back before
anything was built from it, and the build needed no changes the first time the person played it.

## Before you start

1. Read `README.md`, `CLAUDE.md`, `docs/CHARTER.md`, `docs/OPEN-QUESTIONS.md`, and
   `docs/DESIGN-LOG.md`. The Charter's framing notes explain why it says *what* and *why* but never
   *how*; you have to hold that line while transcribing. `CLAUDE.md`'s principles came in from
   earlier games, and you will ask about them as a block at the end. Two of them, *The person
   judges; you measure* and *Find out what they picture before you build*, are how to conduct the
   interview itself, and the README's *Words we use* defines the shorthand these documents use.
2. Take inventory: ``rg '`<' README.md CLAUDE.md docs/``. That lists every unfilled placeholder.
3. **Check whether this has been run before.** If placeholders are already gone or
   `docs/DESIGN-LOG.md` has real entries, this is a resume. Do not re-ask what is answered — say
   what you found already filled, and pick up at the first thing that is not.

Ask open design questions **one at a time, in conversation**, and let them answer in prose. Save
`AskUserQuestion` for genuinely discrete choices — the tier checkpoints and the housekeeping
decisions at the end. When you do offer choices, leave room for an answer on neither list: an
either/or claims the design space has two points in it, at the moment you know least.

### If a written brief arrives instead of answers

This is how one earlier game started: a working title, a ranked list of inspirations, a handful of
words for the feeling, a list of things the player does, and a grant of creative freedom to decide
anything the brief left unclear.

**Treat the brief as the interview.** Every noun in the Charter traces to a line of it, the same as
it would to something said aloud. Ask about what it leaves open as you would in conversation, one
thing at a time, and file what stays open. Where they have granted you freedom and you use it, the
decision is yours, not theirs, and it has to stay visible as yours: **list every call you made in
the first log entry, each with its reason, apart from what the brief said.** In a week nobody can
tell which sentence in the Charter the brief said and which one an agent invented, and both read as
settled; the Charter's authority depends on the difference. One earlier game's first entry listed
seven such calls, under a title that said why: *so they stay distinguishable*.

---

## Tier 1 — required. This is the seed.

### 1. The name

Ask what the game is called. A working title is fine; say so, and note it in the log entry at the
end so nobody later mistakes a placeholder for a decision.

Then make the mechanical edits — these are the only find-and-replace steps in the whole process:

- `README.md` — the `# <project>` heading
- `docs/CHARTER.md` — the `# <project> Charter` heading and the `## 1. What <project> is` heading
- `package.json` — the `name` field. Must be npm-valid: lowercase, no spaces, no leading dot or
  underscore. Derive a slug and show it to them before writing it.
- `index.html` — the `<title>` tag

The last two carry no backticks, so the `rg` inventory will never remind you about them. Do them
now or they get missed.

### 2. The premise

One paragraph: what the player does, where they do it, and what the loop is. It goes in two places
— `README.md` under the title, and `CLAUDE.md` under `## The project`. Same content; the CLAUDE.md
one can be tighter.

**The test the README states:** concrete enough that a stranger could picture a minute of play. If
the answer needs a second paragraph, the premise is not settled — write down the part that is, and
file the rest. Do not accept genre labels as a premise. "A roguelike deckbuilder" describes a shelf,
not a minute.

### 3. The founding commitments

One to three. These are the things that were true before anything else was decided, and that
everything downstream is an attempt to satisfy at once. They go in `docs/CHARTER.md` §1.

For each, ask what it means and what feeling it is chasing — then ask **what it costs**. The Charter
states the test plainly: a commitment that cannot be contradicted is not one. If they cannot name
anything it rules out or anything it makes harder, you have a mood rather than a commitment. Push
back once, in a sentence. If it still will not sharpen, file it under DECIDE and leave §1 shorter.

Most of the interesting design work on a game is the tension between its commitments. If two of
them already pull against each other, that is a good sign — note the tension in the log entry at the
end rather than smoothing it away.

### 4. What a play session is

The loop, in the second person, in five or six sentences: what the player does, in what order, and
what they come back with. Then the shape of time — how long one play session runs, and what many
of them add up to. Goes under the `### What a play session is` heading in §1.

"What they come back with" is the part that gets skipped and the part that constrains everything
downstream. If they cannot answer it, that is a PLAY question, not a blank.

### Checkpoint

Stop here and tell them plainly: **they now have a valid seed.** A named repo, a premise, the
commitments, and the loop is enough to start playing with. The tiers below are worth doing only if
the answers already exist.

Then ask whether to continue to Tier 2, jump to the housekeeping and first log entry, or stop for
now and resume later.

---

## Tier 2 — recommended. What it has to be.

Three to five criteria in `docs/CHARTER.md` §2, each concrete enough to reject a proposal.

The useful half of each is the **`*Rules out:*`** line, and it is the half that gets skipped.
Suggest writing that line first: ask what proposals this criterion kills, by name, including the
expensive ones — the cost is what makes it a criterion rather than a preference. If they cannot name
anything it kills, do not write it down. Either sharpen it with them or drop it.

Before moving on, read the criteria back against the commitments from Tier 1. If one contradicts
another, that is a COLLISIONS entry, not something to reconcile quietly on their behalf.

---

## Tier 3 — only if the answers already exist.

**Do not run this tier speculatively.** On a young project the honest answer to both sections is
usually "nothing yet," and an empty section is correct. Ask whether they already have these; if they
hesitate, skip the tier and move on.

**§3, guidelines for the whole game.** Only guidelines that hold across the whole game; one that
governs a single system belongs with that system in §4, not here. They serve the vision in §1 and
§2, and when one pulls against a criterion, that is talked through case by case, not settled by
rank (§3's opening says how). Each guideline needs its *Why* — the failure it exists to prevent —
so that when it is inconvenient, the argument starts from its reason instead of from scratch. If
there is an operational test, some question easier to apply than the guideline itself, capture it;
that is the part that actually gets used.

**§4, the building blocks.** One block per system large enough that a decision about it constrains
other systems. **The problem** before **The shape**, always, because the problem statement is how a
reader six months out can tell a better answer from a different question. The shape is behaviour and
consequence, never mechanism — if they start describing implementation, that is not a Charter entry;
capture it as a design-log entry instead.

Leave the **What we learned** heading out entirely until something has actually been played.

---

## Always — run these regardless of how far the tiers got.

### The open-questions sweep

Everything deflected during the session becomes an entry in `docs/OPEN-QUESTIONS.md`. Delete the
template example entries as you go. Each entry is a bolded question and three or four sentences on
why it matters — nothing else. An entry that grows a plan has stopped being a question.

Tag each one by **how it gets resolved**, which is the whole point of the file:

- **PLAY** — only a person playing it can settle this. Do not decide it by argument, and **do not
  break it down into tasks.** Include the sub-question: the specific thing to watch for while
  playing, so the sitting produces an answer rather than an impression. Most load-bearing questions
  about a game land here. If this section is empty on a young project, you have miscategorized
  something as DECIDE — go back and check.
- **DECIDE** — can be settled by discussion, without playing, today. If you can write down the
  options and what each costs, you can usually settle it in the same sitting. Offer to: settle it,
  log it in `DESIGN-LOG.md`, delete the entry.
- **COLLISIONS** — not unknowns. Two things already decided that conflict. Say where each was
  decided and which one you expect to give.
- **DEFER** — real, not blocking, deliberately not being worked. Needs a condition for coming back
  or it is a deletion waiting to happen.

Keep the file to about a page. If it runs longer, say so — it means questions are being collected
instead of answered.

### Housekeeping

Use `AskUserQuestion` for these; they are discrete choices.

- **The template banners.** Delete the `> **Made from a shared TypeScript game-project
  template.**` block in `README.md`, and the `*This file arrived as a template…*` note in each of
  the three docs — each one as its file gets real content. In `CLAUDE.md`, delete the **This repo
  was made from a template** paragraph once the placeholders it refers to are gone. Leave the
  README's *Where things live* prompt where it is: it is for the first session that writes code.
- **The principles.** `CLAUDE.md`'s *How we work* came in from earlier games. The principles are
  defaults rather than this project's findings, and the decision about them should be made
  deliberately. Pruning them is expected over time, as this project learns which of them it needs;
  today, ask only whether any of them plainly does not fit this game. Whatever the answer, log it.
- **`.claude/settings.json`** sets `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Ask whether to keep it.
- **The remote.** `git remote -v` should point at their own repo. If it still points at the
  template, they cloned instead of using "Use this template" — tell them, and let them decide.
- **The link to the template.** If there is no `.copier-answers.yml`, run `npm run template:link`
  and commit what it writes: it records which template commit this project began from, so that
  `npm run template:update` and the weekly workflow can bring in what the template learns later.
  Say what it found. If it reports a commit only close to the first commit rather than exact,
  tell them, since the first update will then show differences that were never the template's.

### The first design-log entry

Get the real date with `date +%F` rather than guessing it.

`docs/DESIGN-LOG.md` says the good first entry is the founding commitments, written down the day
they are chosen, while the reasoning still seems too obvious to record. Write that entry using the
form already in the file, then delete the form block. The `design-log` skill has the conventions:
the heading, the tags, and how to keep whose words are whose.

Fill it honestly. **Outcome** for a founding entry is "still in progress" — say that. If there is
nothing transferable under **Learned** yet, write that there isn't, rather than manufacturing a
lesson. If any commitment was a working title, an agent-drafted line, or a tension they chose to
leave standing, this entry is where it gets recorded. If a brief stood in for the interview, this
is where every call you made under its grant of freedom is listed, as yours, with its reason. And
record what was decided about the principles.

### Verify

Re-run ``rg '`<' README.md CLAUDE.md docs/``. Report what is left and confirm each remaining
placeholder is deliberate rather than forgotten. Check `package.json` and `index.html` by eye — the
sweep cannot see them.

Close by telling them what the next step actually is: **playing something.** Not scaffolding. The
first session that writes code can make that cheap: its first end-to-end test is the boot test that
`npm run verify:play` names, and from then on a build they can sit down to is seconds away.

---

## Do not, in this skill

- Create `src/` or `tests/`, add to `scripts/`, or write any game code, or write any tests.
- Choose an architecture, a file layout, or a state-management pattern — and never record one as an
  established convention. `index.html` naming `/src/runtime/main.ts` is a line to change, not a
  convention to obey.
- Put mechanism into the Charter. It is upstream of the implementation and stays that way.
- Break a PLAY question down into tasks. That is the specific mistake the file exists to prevent.
- Invent ticket IDs or reference an issue tracker. There isn't one.
- Fill in **What we learned** on a block that has never been played.
