# Feedback from inside the game

A player at the hosted game, away from any session, can send a report from inside it: their words,
the frame they were looking at, and whatever of the world's state the game chooses to send. Each
report lands as one folder, `inbox/<when>_<who>/`, in a private repository you create, where a
session can read it. None of it knows any game: the game hands the page its canvas and whatever
state it wants to send.

## The parts

- **`feedback/page/`** is the page. At the pause it keeps the frame the player is looking at, HUD
  and all; from the game's menu it opens over the game, first to mark the frame (a ring, a stroke,
  undo) and then to say what kind of thing it is, write as much or as little as they like, and
  untick anything they would rather not send. Nothing on it is required. It reads a gamepad (the
  browser's standard mapping) and the keys and mouse itself while it is open, keeps the keys from
  the game, and closes only once every press made on it is let go. It looks neutral, and a game
  restyles it from its own stylesheet (`style.ts` lists the custom properties).
  `feedback/demo/` is a stand-in game that uses it, to try on `npm run dev` at `/feedback/demo/`,
  and `npm run feedback:check` drives the demo in a browser, on both devices and through a refusal.
- **`feedback/handler.mjs`** is an AWS Lambda function, reached at its function URL. It holds the
  GitHub token, which a page must never hold, takes a report only with a key it knows, and commits
  it to the inbox as one commit. It needs no packages, and a game that adds a file to its reports
  needs no change to it, so it seldom changes. Its tests are beside it and run with `npm test`.
- **The dev server's inbox** (`vite.config.ts`) reads a report the same way and writes it to
  `feedback-inbox/`, which git ignores. The page can be played and its end-to-end tests can send
  before any of the AWS side exists, and nothing a session tries reaches the real inbox.
- **`infra/`** is the function's AWS side as code, an [AWS CDK](https://docs.aws.amazon.com/cdk/)
  app: the function, its address, its log, and the secret it reads. It is a package of its own, so
  that only it installs the CDK (about 250 MB). CI typechecks it and the handler, and synthesizes
  the stack in its tests; nothing in CI deploys, and a cloud session, having no AWS credentials, can
  change and test it but not deploy it.

A game that wants none of it deletes `feedback/`, `infra/`, the `devInbox` plugin in
`vite.config.ts`, and the lines naming them in `vitest.config.ts`, `eslint.config.js`,
`package.json` and `.gitignore`; CI skips its checks of each once its folder is gone.

## Putting it in a game

The game makes one page, hands it the frame and what it knows at the pause, and opens it from a menu
that offers FEEDBACK only where `available` says it can be sent:

```ts
import { FeedbackPage, Trace } from "../feedback/page/index.ts";

const feedback = new FeedbackPage({ build: __BUILD__, onClose: () => pauseMenu.focus() });
const trace = new Trace<Sample>(10, 0.1); // each step: trace.offer(time, () => sampleOf(world))

function pause(): void {
    // Before the menu covers the HUD. A WebGL canvas needs preserveDrawingBuffer: true for this.
    feedback.keep(canvas, {
        title: "The Bridge",
        subtitle: "4:12 into the run · the world is paused",
        parts: [
            {
                id: "where",
                label: "the bridge, 4:12 into the run, and the last ten seconds",
                lines: ["**Where:** the bridge, 4:12 into the run"],
                data: { player: { x, y }, seed },
                file: { name: "trace.json", data: trace.all() },
            },
        ],
    }, hud);
    pauseMenu.open({ feedback: feedback.available });
}
// FEEDBACK in the pause menu: feedback.open("pad"), or "keys", whichever chose it, so the page
// names that device's buttons from the start. While feedback.isOpen, the menu takes no input.
```

Each part is a line on the page the player can untick, its `lines` go into `report.md`, its `data`
into `state.json` under its `id`, and its `file` beside them; a part saying which build and which
browser is added unless `browser: false`. What the parts hold is the game's to choose: Extra
Sapien sent the place and the run, the world as its tests read it, the settings and the frame rate,
and the last ten seconds ten times a second. The kinds a player picks from, the words in the empty
box, and how the frame is kept are options too (`FeedbackOptions`). The key is kept under
`storageKey`, which games that share an origin should each set.

## What the page sends

For a game that would rather make its own page. One `POST` with a JSON body, sent as `text/plain`
so that the browser asks no preflight:

```json
{ "key": "…", "stamp": "2026-10-06_213105", "files": { "report.md": "<base64>", … } }
```

`report.md` is required; up to six files, each a plain name such as `frame.jpg` or `state.json`
(`LIMITS` in the handler), five megabytes in all. `stamp` is the sender's clock and names the
folder; without one, the function uses its own. The answer is `{ "ok": true, "folder": "…" }`, or
`{ "ok": false, "error": "…" }` with what was wrong in words, worth showing the player as it is.

The page sends to `/__feedback` when `import.meta.env.DEV` is true, and otherwise to
`import.meta.env.VITE_FEEDBACK_URL`, offering feedback only when that is set and it holds a key. The
key reaches it in the player's link, `?key=`; the page keeps it in `localStorage` and takes it out
of the address bar, so a bookmark of the open game holds none, and the player keeps the link itself.

## Setting it up

The first two steps are done by hand in GitHub; the rest is code.

1. **The inbox.** A new private repository, made with a README (*Add a README*), so that it has a
   `main` branch for the first report to be committed on top of.
2. **A token for it.** GitHub's *Settings*, *Developer settings*, *Fine-grained tokens*: access to
   the inbox repository only, and one permission, *Contents: Read and write*. An organization may
   ask an owner to approve it. Once it is made, check the token's page: it should list *Contents:
   Read and write* and not be waiting for approval, or the first send fails with a 403. A token
   expires on the date it is given; after that a send fails and says so.
3. **The function.** `infra/config.ts` is the only file a project fills in: the stack's name, the
   region, the inbox repository, and `origins`, the hosted game's address, which the function's
   CORS lets read its answers (`https://main.<app id>.amplifyapp.com`, say, with no slash at the
   end). A synth refuses the placeholders, and an origin with a path or a slash at the end. Then,
   with Node 22.18 or later and AWS credentials for the account (`aws configure`, or
   `aws sso login`):

   ```bash
   cd infra
   npm ci               # the CDK, for this folder alone
   npx cdk bootstrap    # once per account and region: where CDK keeps the function's zip
   npm run diff         # what a deploy would change, before it does
   npm run deploy       # asks before it changes any permission, then makes or updates it all
   ```

   The deploy makes `feedback/handler.mjs` alone the function's code, on Node 22, with 30 seconds
   and 256 MB; a function URL with auth type NONE, and CORS allowing the game's address and POST;
   and its log, kept 90 days. Lambda's console defaults are too small: a send is ten calls to GitHub
   one after another, longer than the default 3-second timeout, and a 1.1 MB report used 112 MB of
   the default 128. The address is open to anyone who has it, and the key is the lock: the function
   turns away a report whose key it does not know before it asks GitHub for anything. Last, the
   deploy writes the function's address into `.env.production` at the root, as
   `VITE_FEEDBACK_URL`.
4. **The token and the keys,** into the secret the function reads. From `infra/`:

   ```bash
   npm run secret -- token          # paste the token from step 2; it is not shown
   npm run secret -- key <name>     # makes <name>'s key, and prints their link
   npm run secret -- list           # whether the token is set, who holds a key, and their links
   npm run secret -- remove <name>  # takes <name>'s key away
   ```

   The function reads the secret again within five minutes of a change, so none of these needs a
   deploy. A key is 32 letters and digits, which a link carries whole, and the name it is given is
   the end of the folder each of their reports lands in. `key` again for the same name retires the
   old key. To try it first, make a key for yourself and send a report from your own link.
5. **The game.** Commit `.env.production`: Vite reads it when it builds the hosted game, and the
   dev server does not, so `npm run dev` keeps its own inbox. An environment variable of the same
   name where the game is built would win over the file.

A change to `feedback/handler.mjs` or to `infra/` goes live with `npm run deploy` again. The
handler still reads `GITHUB_TOKEN` and `KEYS` from its environment when no secret is named, so a
function made by hand in the console works too; `npm run secret -- keys` takes such a function's
`KEYS` all at once, so that links already given out keep working after a move to the stack.

## What reports are for

That is the project's to settle with the person: who triages the inbox, and what the game does
about a report. One earlier game triaged its first reports with its designer before writing down
how, and only then let a scheduled agent sort what arrives.
