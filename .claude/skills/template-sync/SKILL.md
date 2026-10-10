---
name: template-sync
description: Keep this project and the template it was made from in step, in both directions. Use when bringing in what the template has gained (`npm run template:update`, or the weekly "Bring in the template" pull request), when resolving the conflicts such an update leaves, when a project has no `.copier-answers.yml` yet, and when a lesson learned here would serve any game and should be raised with the template as an issue — including whenever someone says "update from the template", "pull from upstream", "carry this back", "send this upstream" or "raise this with the template".
user-invocable: true
---

# Staying in step with the template

Several games are built from one template, and a lesson one of them learned the hard way is usually
one the others will learn too, unless it reaches them first. The template is how it travels. This
skill is the two directions: bringing the template's changes in, and raising this project's lessons
with it. The README's *Staying in step with the template* is the overview; `scripts/template.mjs`
is the mechanism, and its header says exactly what it does. Wherever this has you add or reword a
principle in `CLAUDE.md`, do it with the person: the principles are changed by the person and an
agent together.

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
change is and where it came from. An update that changes a principle or a paragraph in `CLAUDE.md`,
or a skill, changes how sessions here work from now on, so read those as you would a colleague's
proposal, not as a dependency bump.

**Resolve conflicts as after a merge of main: read both sides.** In each conflicted file, the
project's version is under `<<<<<<< before updating`, the template's under `>>>>>>> after
updating`. `git checkout -m <file>` puts the markers back if a resolution goes wrong. The common
cases:

- **The project filled in a prompt the template has since reworded.** Keep the project's answer.
  If the new wording asks something the old one did not, say so to the person; do not answer it
  for them.
- **The project changed a principle, and the template changed it too.** The project's version is a
  decision someone made here; the template's is what another game learned since. Show the person
  both, and log which way it went.
- **The project's own guidelines in the Charter's §5.** The template once kept how we work in the
  Charter's §5, and now keeps it in `CLAUDE.md` as principles, so the update removes §5. Move the
  project's own guidelines under *This project's own* in `CLAUDE.md`, sorted against the
  principles: most become a *Looks like* line under one, and some are now said by one and go. Show
  the person the sorting, and log it.
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

**When the template takes in a lesson this project raised.** The update changes a principle in
`CLAUDE.md` to carry it. If this project's line under *This project's own* now says nothing the
principle does not, delete it; its design-log entry stays where it is. If it says more, and the
more is about this game alone, keep that part. Show the person which, and say so in the update's
log entry.

## Raising a lesson with the template

**What to raise.** A lesson, a check, a script or a way of working that would have saved any game
built from the template the same cost. Not what is about this game's design, and not what is about
this game's technology: one game's guidelines went to the template, and its guidelines about
three.js, terrain and sound stayed behind.

**Write it into the project first,** under *This project's own* in `CLAUDE.md`, with its design-log
entry, as *When you learn something* there says. The project needs it while the template decides,
and a lesson left only in the design log is filed where nobody looks before acting.

**Then open an issue on the template's repository** (the README links it). In a cloud session, add
that repository to the session so that the GitHub tools can reach it, and stop there: an issue
needs no clone. In one session, attaching, cloning and registering the template moved the session's
working directory out of the project, and from the next restart the project's hooks and settings
stopped loading, for the session and every agent it started, with nothing to say so. So afterwards,
and after any restart, check that the session's primary working directory is still the project.
Ask the person before sending anything: what leaves this project is theirs to decide, and a lesson
they decided here may not be one they want stated for every game. Give each lesson its own issue,
titled `Lesson:` and the lesson in a sentence, so that the template can find them all and see when
two games raise the same one. Brief it the way `CLAUDE.md` says to brief another agent: which game
it came from, what happened and what it cost there, which principle it extends or that none does,
what is measured and what is a guess, and the design-log entry. A bug found in the template's own
tooling goes the same way, with the fix if you have one. You don't need to check whether another
game has raised it first: matching issues is the template's job.

**What the template does with it.** It triages the issues, and takes a lesson in once it clears the
bar: it has come up in more than one game, or it would be expensive to work out again. Most become
a sharper reason, a *Looks like* line or a better example under a principle; some become a skill, a
script, or a fix to the template's tooling. Written into the template, a lesson names no game, and
*the person* in its example becomes *a designer*. Which game raised it stays in the issue and in the
commit that closes it. Every project receives it at its next update (*When the template takes in a
lesson this project raised*, above).
