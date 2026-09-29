# CLAUDE.md

This file exists for agent platforms that read `CLAUDE.md`.

## The project

*`<One paragraph: what the game is, what the player does, and what the loop is. Replace this
prompt.>`*

## The three documents

They divide by tense, and that is the filing rule. Anything new either fits one or replaces one.

- **[`docs/CHARTER.md`](./docs/CHARTER.md)**: present tense, what is settled. Read this first.
- **[`docs/OPEN-QUESTIONS.md`](./docs/OPEN-QUESTIONS.md)**: future tense, what is unresolved.
  Entries tagged PLAY cannot be settled by argument; do not decompose them into tasks.
- **[`docs/DESIGN-LOG.md`](./docs/DESIGN-LOG.md)**: past tense, what was tried and what happened.
  Append only. Never edit an old entry to agree with current thinking.

The Charter states *what* and *why*, never *how*. That is deliberate. Read the Charter's final
section, and the last three log entries, before proposing a plan.

## How to work in this repo

**There is no implementation to read.** `src/`, `tests/`, and `scripts/` are empty on purpose. Do
not assume a missing module was deleted by mistake, and do not go looking for prior art in the tree.

**Architecture is yours to choose.** There are no file-layout rules, module conventions, or
state-management patterns recorded anywhere here, and that is intentional. `index.html` names
`/src/runtime/main.ts` as the entry point; that is a line to change, not a convention to obey.
Don't invent a convention and then cite it as if it were established. If you settle one, say so
plainly.

**There is no issue tracker.** No tickets, no ticket IDs, no backlog tool. Plans live in the Charter
and in the session you are working in. Don't reference or fabricate ticket identifiers.

**This repo was scaffolded from a template.** Prompts in *italics*, and placeholders in angle
brackets, are unanswered template text rather than design decisions. Don't treat them as settled
and don't quietly write around them — if a plan depends on one, resolving it is the first step of
the plan. ``rg '`<' README.md CLAUDE.md docs/`` lists what is still unfilled. The `/gettingstarted`
skill walks the user through resolving them; suggest it if a session opens against an unfilled
template, and don't answer the prompts on the user's behalf in the meantime.

**Don't rewrite the Charter to match the code you just wrote.** It is upstream of the
implementation. If the implementation forces a design change, raise it.

## Four rules carried in

Inherited from the template, out of a previous project that reached a thousand commits and fifty
thousand lines before anyone had established whether it was fun. They are defaults rather than this
project's own findings, and the README states the evidence behind each. Argue with them
deliberately or keep them, but don't ignore them silently.

**Done is the wire, not the module.** A feature is finished when a booted game lets a player do the
thing. A system with a passing test and no caller is not delivered, and neither the test suite nor
the type-checker can tell you so: unit tests import modules directly, so a module keeps a green
test long after nothing in the running game reaches it. This is the specific way the previous
attempt failed, repeatedly.

**Play it.** A system whose feel is still being found has earned nothing but being played. When you
write down a playtest, write down what *worked* — the defect list is the easy half, and it is not
the half that tells you what to protect.

**Ask whether every criterion could pass and the thing still be wrong.** If yes, the criteria are a
proxy for a judgment, and a person has to play it and render the verdict. Feel-shaped questions
routed through a queue come back as correct fragments that do not compose.

**Test what has stopped changing.** Every test written against a system whose feel is still being
found is a bet you will pay to unwind.

## Verification

Node 22+. `npm ci` first.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src tests
npm run format      # prettier --write src tests
npm test            # vitest run
npm run test:e2e    # playwright test
npm run verify      # typecheck + lint + unit + e2e
```

With `src/` and `tests/` empty these have nothing to act on and several exit non-zero on "no input
files". That resolves as soon as real source and tests exist; a Playwright config still needs to be
added before `test:e2e` can run. A husky `pre-commit` hook runs `tsc --noEmit` and `lint-staged`;
CI runs typecheck, Prettier, ESLint and the unit tests on pull requests.
