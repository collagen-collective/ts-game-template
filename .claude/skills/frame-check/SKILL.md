---
name: frame-check
description: Look at what the game actually shows on screen, find what is wrong in it, and show that a change looks right, with posed frames laid out on a sheet — from the player's camera, from where something went wrong, and beside any older commit. Use it whenever someone reports something that looks wrong ("looks wrong from here", "can't see him", "clipping", "inside the wall", "floating", "under the floor", "drawn behind", "missing", "black screen", "text over", "the camera"), after changing how anything looks, where the camera goes or what the HUD shows, after merging branches built apart, and before telling anyone a thing looks right, including when you are only asked to confirm that it looks fine. It starts from what the person you're working with saw, and brings `npm run shots`, which serves the game on its own, says what breaks in the page, takes the frames a script of the game's own poses, and puts an older commit's beside them.
---

# Checking what the screen shows

**Tests read the state, and the screen can disagree with it.** In Extra Sapien, a game built from
this template, a tour of the whole game in frames found six defects with every test green, three of
them in the page's HTML drawn over the picture: the prologue and the ending under the black of the
fade, a troll frozen under the floor through its own reveal, a lintel across half the screen. After
four places built apart were merged, a later tour found 22 more where they met, and the next found
10 where their fixes met. Nothing that reads the simulation could have seen any of them.

So this compares two things, and assumes neither: **what the state says** (where things are, what
is showing, where the camera is) and **what the frame shows**. The instrument is
`scripts/shots.mjs`; its header has every option and the reason for each choice. Outputs go to
`scratch-*` paths, which git ignores.

It was tried before it shipped. Two agents were given one report, *"Riding the lift up out of the
galleries, it looked like Baldur wasn't standing on anything"*, on copies of Extra Sapien in which
a lift's deck had been drawn 1.1 m under him while it moved, with every test green. With this skill
the defect was found, fixed and shown fixed in 16 minutes; without it, in 21. Both were right, and
what both built for themselves is in it now.

## 1. Start with what they saw

Before the code, the report. Ask the person you're working with what they saw, where they were,
through which camera, at what moment, and what they expected to see instead. Their words are
usually more exact than they sound: *"this looks wrong from here"* is a place and a camera, and the
frame you need is taken from there. What they expected is worth more than what they saw. A defect
is something an agent can also find, and an expectation is not.

If a frame disagrees with what they saw, suspect the frame: the pose, the camera, the moment, or
the build it was taken from. If nobody is around to ask, write down the questions you would have
asked, and bring them back with what you found.

**Then rule the state in or out.** If the game's state runs without a browser, a trace of it in
Node says in a minute whether the fault is in the state or in the drawing (`CLAUDE.md`, *Trace
before you test*). The agent without this skill did that first, and knew within a minute that the
game had Baldur on the deck and only the picture did not.

## 2. Give the game a handle, once

A shots script drives the game through a handle the game offers to tests. Its shape is the game's
choice, and the README's *Where things live* records it. What a script needs from it:

- **Booted:** a way to know the game can be driven. Usually the handle existing on `window`.
- **A frame:** a way to draw one on demand, if the game under test draws only when asked.
- **A moment:** a way to reach a named place or beat by the game's own route, and to step time
  with an input held.
- **A camera:** a way to place the camera for a frame, and to say where it is. The day dragon's
  readout said where the camera was, *"this looks wrong from here"* became a frame anyone could
  take again.
- **The state:** a way to read what the screen does not show, so each frame can be checked
  against it.
- **What was drawn:** where the renderer put a thing, not only where the state has it. The gap
  between the two is the measurement a report like *"he wasn't standing on anything"* asks for:
  1.10 m on every frame of the ride, and 0 at rest. Both agents in the trial had to read
  it out of the renderer's private fields.

If the handle cannot do one of these, add it to the handle, once, rather than reaching into the
game's state or the renderer from a script: the next script will need it too. The first agent to
try this skill, on Extra Sapien, found no way to place the camera, wrote one into the game's state
from its script, and read the camera back out of the renderer's internals.

Watch for two drawing calls that undo each other. In dragon, placing the camera draws its own
frame, and the call that draws the play camera would have drawn over it: a script there leaves
`draw` out and draws where it needs to.

## 3. Write the script

```js
// scratch-shots-<thing>.mjs, at the repo root, where git ignores it
export const path = "/?test=1"; // what to open
export async function ready(page) {
    await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 120_000 });
}
export async function draw(page) {
    await page.evaluate(() => window.__game.render()); // left out if posing draws its own frame
}
export default async function (shoot, page) {
    await page.evaluate(() => window.__game.start("the place")); // by the game's own route
    await page.evaluate(() => window.__game.step(120));
    await shoot("arrival-play-camera");
    const state = await page.evaluate(() => window.__game.where()); // what the frame should agree with
    console.log(JSON.stringify(state));
    await page.evaluate(() => window.__game.lookFrom(-12, 4, 0)); // the same moment, from the side
    await shoot("arrival-side");
}
```

The handle's names above are placeholders; use the game's. Then:

- **Reach the moment by the game's own route** where you can: start the level and play or step
  to it. A state set by hand can show a defect the game never has, and hide one it does, so reach
  a posed state by a second route before trusting it (Charter §5).
- **Take the player's camera first.** It is the view a player has, and how legible anything is
  depends on the view. Then a second view that shows the relation the first one hides: from the
  side, or from above.
- **Take frames across the moment, not one.** Anything with a front, anything moving, and
  anything that pops or flickers is judged over time: every animal on dragon's island ran tail
  first through a sequence of stills.
- **Keep the HUD in at least one frame.** Half the defects in Extra Sapien's first tour were in the
  page's HTML over the picture, which a frame with the HUD hidden cannot show.
- **Print the state beside each frame,** and say where the camera was. Return it from
  `page.evaluate` and print it in the script, as above: the harness passes on the page's errors,
  not its `console.log`.

## 4. Run it, and read the sheet

```bash
npm run shots -- scratch-shots-<thing>.mjs scratch-frames-<thing> 2>&1 | tee scratch-frames-<thing>.log
```

- **Keep the whole output.** Page errors come first, and a `tail` drops them: the first agent to
  try this skill lost them that way on its first run.
- **Read the run's output before any frame.** A frame of a broken game looks like a frame. Page
  errors, console errors, and *THE PAGE RELOADED* are printed as they happen, and a reload means
  every frame after it is of a fresh game.
- **Look at the sheet, then at every frame you have any doubt about, full size.** A long run's
  sheet comes in pages of about 2,400 pixels, each short enough to read as one picture. Ask of
  each frame:
  - Is the subject in frame, and not behind a wall, the HUD or the camera's near plane?
  - Is everything where the state says it is? Look for things under the floor, inside walls,
    floating above their ground, or drawn twice.
  - Is anything of the page over the picture where it should not be: text across the subject, a
    box cut off at the edge, a fade left black?
  - Is the camera inside geometry, or looking at the back of something?
  - Is anything left over from before? In Extra Sapien, a second game in the same page drew the
    first game's cart, because a kept place read the objects it was built from.
- **Measure what you can before describing it.** If a thing looks out of place, read where it was
  drawn and where the state has it, and the camera's position, rather than guessing from the
  picture.
- **Then sweep for every other place the same code draws.** A report names the one moment the
  person saw. Both agents found the planted defect on four other rides besides the one reported,
  and one found it under the Wolves riding a lift down as well.

## 5. Before and after, and the control

```bash
npm run shots -- scratch-shots-<thing>.mjs scratch-frames-<thing> --tree before=@<commit> --tree now=.
```

The same script runs on an older commit, exported with its own `node_modules`, and the sheet puts
the two side by side, a row a shot. The first copy of a commit takes about a minute; later runs
reuse it. The copy goes under the system's temp directory: set `TMPDIR` to a `scratch-*` folder to
keep it inside the checkout.

- **The control comes first.** Before *gone in the after* means anything, the defect has to show
  in the before, or in this checkout with the fix taken out. A null result is not a result until
  something in the same run has come back non-null (Charter §5). If your frames do not show the
  defect where it is known to be, they cannot see it: change the pose, not the conclusion.
- **Match the pair on everything but the change.** Same seed, same moment, same camera. A pair
  that differs in anything else is not evidence until you know what that difference did.
- **A commit older than the handle a script uses fails,** says why, and its column reads *no
  frame*.

## 6. After merging branches built apart, tour the whole game

It is the seams between branches that break, and no test sits on a seam (Charter §5, *Inherited
from Extra Sapien*). A tour is a script that plays the game through, with a bot or a held input,
and shoots each arrival, each scene, and the middle of each fight, with any cutscenes played rather
than skipped. Look at every sheet. Commit the tour once it proves itself (`scripts/shots/`), so the
next merge can be toured the same way.

## 7. Show them, and write it down

- **Share the sheet,** before and after where there is a before, and say what it shows and what
  it cannot. Frames can settle where things are drawn. Whether it looks right, as the game should,
  is the person's to say.
- **Offer them a minute of play,** and say what might be worth a look: the place, the moment, the
  camera. A minute at the game can catch what a sheet missed.
- **Keep a script that proved itself,** under `scripts/shots/`, with a header that says what it
  shows and how it is run. In dragon, the person asked for one to be kept: *"At least if we have it
  in a commit somewhere, we can easily go back to it as needed."*
- **Log what the frames found** with the `design-log` skill, and say which of it was seen on a
  sheet and which was said by the person at the game.

## Things that have caught us out

- **A borrowed server.** A run that borrows a server photographs whatever that server serves. The
  harness starts its own on a port it asks the system for, and stops it however the run ends.
- **A reload under the run.** A watched file saved during a run reloads the page, and every frame
  after is of a fresh game. The harness's server watches nothing, and says when a page reloads
  anyway.
- **Every frame the same.** A game that draws only when asked, with no `draw` in the script, gives
  a sheet of the last frame it drew.
- **Every pose the play camera.** In dragon, placing the camera draws a frame, and a `draw` that
  draws the play camera puts it straight back.
- **Slow first loads.** The first load compiles every module, and a frame composited with bloom in
  software can take more than 30 s on a busy machine. The harness waits two minutes for each.
- **Too many at once.** Each run is a browser drawing in software. Two at once on four cores is
  the most that helps (Charter §5).
- **A still for a motion.** Direction, stepping, spinning and popping are judged over time, across
  frames taken a fraction of a second apart.
