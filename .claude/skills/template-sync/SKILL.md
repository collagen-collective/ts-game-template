---
name: template-sync
description: Keep this project and the template it was made from in step, in both directions. Use when bringing in what the template has gained (`npm run template:update`, or the weekly "Bring in the template" pull request), when resolving the conflicts such an update leaves, when a project has no `.copier-answers.yml` yet, and when a finding here would serve any game and should go back to the template — including whenever someone says "update from the template", "pull from upstream", "carry this back" or "send this upstream".
user-invocable: true
---

# Staying in step with the template

Several games are built from one template, and a guideline one of them paid for is usually one the
others will pay for too, unless it reaches them first. The template is how it travels. This skill
is the two directions: bringing the template's findings in, and sending this project's out. The
README's *Staying in step with the template* is the overview; `scripts/template.mjs` is the
mechanism, and its header says exactly what it does. Wherever it has you add or reword a guideline
in the Charter's §5, do it with the person: §5 is changed by the person and an agent together.

## Bringing the template in

**If there is no `.copier-answers.yml`, link first.** `npm run template:link` finds the template
commit this project's first commit was made from and writes it down. Say what it reports: an exact
match, or only the closest commit, in which case the first update will show differences that were
never the template's. If the person knows which commit it was, `npm run template:link -- <commit>`
takes it. Commit the file on its own before updating, so the update's diff is only the update.

**Then update, on a branch, with a clean tree.** `npm run template:update`. It prints the template
commits that came in, the documents its driver merged, and the files left with conflict markers.
The weekly workflow does the same and opens a pull request on the `template-update` branch; on that
branch the work is the same as here, except that the markers are already committed.

**Read what came in before resolving anything.** The template's commit messages say what each
change is and where it came from. An update that brings a guideline into the Charter's §5, a
paragraph into `CLAUDE.md`, or a skill, changes how sessions here work from now on, so read those as
you would a colleague's proposal, not as a dependency bump.

**Resolve conflicts as after a merge of main: read both sides.** In each conflicted file, the
project's version is under `<<<<<<< before updating`, the template's under `>>>>>>> after
updating`. `git checkout -m <file>` puts the markers back if a resolution goes wrong. The common
cases:

- **The project filled in a prompt the template has since reworded.** Keep the project's answer.
  If the new wording asks something the old one did not, say so to the person; do not answer it
  for them.
- **The project changed an inherited guideline, and the template changed it too.** The project's
  version is a decision someone made here; the template's is what another game learned since. Show
  the person both, and log which way it went.
- **Code, config or a script both changed.** Merge them as code, and run what the file is for:
  the gate, the merge driver's tests, the workflow's own syntax.
- **`package.json`.** Resolve it, then `npm install`, which is what keeps the lockfile honest. The
  update ran it already if the file merged cleanly.

Things the update will not do, on purpose: it does not bring back a file or a passage the project
deleted, and it does not touch `package-lock.json` except through `npm install`. If the project
dropped something it now wants back, take it from the template by hand.

**Then the gate, and a log entry if anything changed how the project works.** `npm run verify`
once there is code. In the design log, an update is a merge from upstream, written in the shape
the `design-log` skill gives a merge of main: what came in, what it made untrue here, and every
conflict decided, with whose decision it was. An update that brought only tooling fixes needs no
entry.

**When a finding this project sent comes home.** The update brings back, under *Inherited*,
guidelines this project already has under *This project's own*. The template's §5 is a shared
dependency that every game contributes to, so keep the inherited copy and delete the project's own,
as you would delete your own copy of code once a package provides it. Before deleting, compare the
two, and show the person the comparison: if the project's copy says something the inherited one
lost, that goes back to the template as a pull request or an issue (*Sending a finding to the
template*, below). A tally or a name dropped from an example does not count; the template leaves
those out on purpose. Otherwise the overlap is looked at again when the inherited guideline next
changes. The design-log entry that paid for the guideline stays in the log, and the update's entry
says which copies were deleted. The same holds for a guideline of this project's own that turns out
to overlap one another game sent: the inherited copy is kept.

## Sending a finding to the template

**What goes back.** A guideline, a check, a script or a way of working that would have saved any
game built from the template the same cost. Not what is about this game's design, and not what is
about this game's technology: one game's guidelines came back to the template, and its guidelines
about three.js, terrain and sound stayed behind. A guideline that has been paid for once here is
worth sending; one this project only suspects is not yet.

**Where it goes in the template.**

- Guidelines for particular moments: the Charter's §5, under *Inherited*, in the list for the moment
  the guideline is for (for a guideline about measuring or testing, under the principle it is an
  instance of), or a new *When you are about to…* heading if none fits, with a line of its own in
  §5's opening. In the shape §5's *Writing a guideline* gives: its reason, then the guideline in
  bold, and a *For example* only if the moment is hard to recognise. Written for a game that is not
  this one: the example names no game, and *the person* in it becomes *a designer*.
- How sessions work with the person, every session: `CLAUDE.md`, *Working together*.
- How to do a recurring piece of work: a skill under `.claude/skills/`, or a change to one.
- Tools: `scripts/`, with the reason each exists written beside it, and the README's *What ships
  here* and *Toolchain* told about it.
- A fix to the template's own tooling, found in use here: the same file, fixed in place.

Which game a guideline came from belongs in the pull request and its commits, not in the documents.

**Write it into the project first.** Before a guideline goes to the template, put it under *This
project's own* in the project's Charter, with its reason and its design-log entry, and send that
without the entry. The project needs the guideline while the pull request is open, and one left
only in the design log is filed where nobody looks before acting. When the template's copy comes
home, it replaces the project's.

**How it goes.** As a pull request on the template's repository (the README links it; in a cloud
session, add that repository to the session first). Brief it the way `CLAUDE.md` says to brief
another agent: which game it came from, what it cost there, what is measured and what is a guess.
Write it for a game that is not this one: names of this game's systems, files and people come out,
or become the example. Ask the person before sending anything: what leaves this project is theirs
to decide, and a guideline they decided here may not be one they want stated for every game.

**Then bring it home.** Once the template has merged it, `npm run template:update` here, and handle
it as *When a finding this project sent comes home* says above.
