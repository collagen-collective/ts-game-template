---
name: sound-check
description: Hear what the game actually plays, without a speaker — render its own sound offline, measure each take (loudness, peak, clipping, when it starts and how long it rings, where its energy sits, how wide it is), lay the takes out on a sheet beside any older commit's, and hand the person listening copies matched in level. Use it whenever someone reports a sound wrong ("too loud", "too quiet", "can't hear", "drowned out", "muddy", "boomy", "thin", "tinny", "harsh", "crackles", "distorted", "clipping", "cut off", "late", "rings too long", "silent", "missing", "all in one ear"), after adding or changing any sound or the mix, after merging branches that both touched sound, and before telling anyone a sound is right, including when you are only asked to confirm it. It starts from what the person heard, and brings `npm run takes`, which serves the game on its own, says what breaks in the page, renders what a script of the game's own asks for, and measures it.
---

# Checking what the game plays

**An agent cannot hear.** Everything a session knows about its game's sound it knows from numbers
and pictures of the samples, and the person is the only one in the loop with ears. So this does two
things, and assumes neither is enough alone: it **measures** what the game renders, so that a
session can find and show a defect in sound as it would one on screen, and it **hands the person
takes to listen to**, matched in level, because whether a sound is right, as the game should sound,
is theirs to say.

The instrument is `scripts/takes.mjs`; its header has every option, and `scripts/lib/listen.mjs`
says what each number is and how it is computed. Outputs go to `scratch-*` paths, which git
ignores.

Four games built from this template each built a renderer and a measurer of their own before this
one existed: dragon (a hook that renders half a second of the island to two levels, and an in-game
sound desk), Extra Sapien (its scores rendered in headless Chromium and measured for levels,
spectra and onsets), sandworm (its encounter rendered while the world steps, A-weighted by band)
and Kyle on Duty (its sound board's recipes rendered and measured against the original's sounds).
What they found, and what the four had in common, is what this is made of.

## 1. Start with what they heard

Ask what they heard, where in the game, at what moment, and what they expected to hear instead;
and on what: headphones, laptop speakers, a television. A laptop's speakers play almost nothing
under 150 Hz, so a sound that is *thin* there can be *boomy* on headphones. Their words are more
exact than they sound: *muddy* is usually too much between 125 and 500 Hz, *harsh* or *tinny* too
much between 2 and 6 kHz and little under it, *crackle* is clipping, *late* is a start time, and
*drowned out* is two levels and an overlap.

In a recreation, ask for a recording of the original before a description, and measure the two with
the same instrument (Extra Sapien's Charter §5: *Ask the person for a recording of it before a
description*).

## 2. Give the game a way to render, once

A take is the game's own sound rendered into an `OfflineAudioContext`: as fast as the machine
allows, the same on every machine, with no speaker and no real-time clock. It works because a Web
Audio graph builds into any `BaseAudioContext`. What that needs from the game:

- **Sound that takes its context as a parameter,** rather than reaching for a global
  `AudioContext`. All four games' sound already did, or could, with a line changed.
- **The game's own path, not a copy of it.** Render through the same mixer, buses, reverb and
  limiter that play uses. A copy made for measuring drifts from the game the first time either is
  changed, and then measures nothing (Charter §5: *When two copies of one thing disagree, delete
  one*).
- **The same take twice.** Seed whatever is random in the synthesis, so that a take repeats. Kyle on
  Duty's renders came out identical, to the last digit of every measure, from two commits with the
  same sound code; then a difference between two trees is the change and nothing else.
- **A way to reach a moment,** where the sound depends on the game: step the world to the round's
  turn, the window going down, the explosion, and render what the ears hear there.

Two ways in, either is fine:

- **A handle** that renders: `window.__game.hear({ seconds, at })` returning an `AudioBuffer`, or a
  sound board page, as Kyle on Duty's `lookdev/sounds.html` is.
- **The game's modules, straight from the dev server.** Vite serves the source as modules, so a
  take can `await import("/src/audio/whatever.ts")` in the page and call it into its own
  `OfflineAudioContext`. Dragon's birdsong was rendered this way with no handle at all.

## 3. Write the script

```js
// scratch-takes-<thing>.mjs, at the repo root, where git ignores it
export const path = "/?test=1"; // what to open
export async function ready(page) {
    await page.waitForFunction(() => window.__game !== undefined, null, { timeout: 120_000 });
}
export default async function (take, page) {
    // Through a handle the game offers:
    await take("round-turn", () =>
        page.evaluate(async () => __takes.pack(await window.__game.hear({ seconds: 8, at: "roundEnd" }))),
    );
    // Or through a module of the game's own, into a context of the take's own:
    await take("curlew", () =>
        page.evaluate(async () => {
            const { sing } = await import("/src/render/songs.ts");
            const ctx = new OfflineAudioContext(2, 48000 * 4, 48000);
            sing(ctx, "curlew", 0.3, ctx.destination, 0.1);
            return __takes.pack(await ctx.startRendering());
        }),
    );
}
```

The handle's names are placeholders; use the game's. `__takes.pack` is the harness's, in the page
before the game loads. Then:

- **Take the whole sound, and a little either side.** Start the render before the sound begins and
  end it after it has rung out, or a late start and a cut-off tail are invisible.
- **Take what the player hears, where they hear it,** when the game places its sound: through the
  game's ears, at the distance and through the wall the report names, as well as the sound alone.
- **Take the thing it competes with too.** *Drowned out* is two takes, and their overlap.
- **Name takes for the moment,** not the function: `colt-under-a-groan`, not `test2`.

## 4. Run it, and read it

```bash
npm run takes -- scratch-takes-<thing>.mjs scratch-sound-<thing> 2>&1 | tee scratch-sound-<thing>.log
```

- **Read the run's output first.** Page errors are printed as they happen, and so is a take that
  came back **SILENT** (nothing above -70 LUFS: usually a graph never connected to the context's
  destination, or a sound scheduled after the render ends) or with samples **at full scale**.
- **Then the numbers,** a line a take, all of them in `takes.json`:

  | Number | What it says | What to look for |
  |---|---|---|
  | LUFS | how loud, as the ear weighs it, silence gated out | sounds of one kind within a few LU of each other; a jump against the before |
  | loudest 3 s | the loudest three seconds | a sound that is quiet on average and loud in a burst |
  | peak dBFS, clipped | the largest sample, and how many reach 1.0 | clipped above 0 is crackle when played; a peak above -1 dBFS is close |
  | starts, loudest at, rings | seconds: first within 40 dB of the loudest, the loudest, and how long it stays within 40 dB after | *late*, *cut off*, *rings on* |
  | centroid, octaves | where the energy sits | *muddy* (125-500 Hz heavy), *thin* or *tinny* (little under 250, a high centroid) |
  | L/R | 1 is the same in both ears, 0 unrelated, below 0 one side inverted | a placed sound at 1 is not placed; below 0 cancels on a mono speaker |

- **Then look at the sheet:** each take's waveform (red where it reaches full scale) and its
  spectrogram, 30 Hz to 16 kHz on a log scale with a line at 1 kHz. A click is a vertical line; a
  hum a horizontal one; a cut-off is a wall where the tail should fade; a late start is space at the
  left.
- **Measure before you describe.** *Thin* is a claim about the octaves; read them, against the
  before and against a sound the person called right, before saying so.

## 5. Before and after, and the control

```bash
npm run takes -- scratch-takes-<thing>.mjs scratch-sound-<thing> --tree before=@<commit> --tree now=.
```

The same script renders an older commit's sound, exported with its own `node_modules` (the trees are
`shots.mjs`'s), and the run prints each take's numbers side by side, a column a tree, and puts them
side by side on the sheet.

- **The control comes first.** Before *gone in the after* means anything, the defect has to show in
  the before, or in this checkout with the fix taken out. A take that comes back silent proves
  nothing about a sound being right.
- **Keep what the person called right in the same run.** When they say one sound is right and
  another is not, take both, and check the right one did not move (Charter §5).
- **Match the pair on everything but the change.** Same seed, same moment, same length, same
  distance. Takes repeat exactly, so a difference in an unchanged take means the pair is not
  matched.

## 6. Give the person takes to listen to

The numbers find defects; the person decides what sounds right.

- **Match the level of a pair** they compare: `--match -20` writes each take again scaled to -20
  LUFS, so the louder one does not win by being louder. Extra Sapien matched its listening pairs
  so *"that the level does not decide"*.
- **Ask for a comparison, not an absolute:** which of two is nearer what they remember or want,
  rather than whether one is good. Extra Sapien's first playtest learned to ask that way.
- **Say what to listen for, and where:** the moment, the sound, what changed, what might be worth
  a second listen. And then the game: a sound heard in play, under everything else, is not the
  sound heard alone.

## 7. Write it down

- **Keep a takes script that proved itself** under `scripts/takes/`, with a header that says what it
  renders and how it is run.
- **Log what the takes found** with the `design-log` skill, and keep apart what was measured, what
  the person heard on the listening copies, and what they heard at the game.

## Things that have caught us out

- **A copy of the sound for measuring.** It measures the copy. Render through the game's own path.
- **A random voice.** Synthesis with an unseeded random gives a different take each run, and a
  before and after that differ for no reason.
- **The wrong context.** Code that reaches for a global `AudioContext` renders nothing into the
  take's, and the take comes back silent.
- **A render as long as the sound.** The tail is cut off by the render, not by the game. Render past
  the end.
- **The mean of a mix.** One voice wrong under twenty right ones barely moves the mix's numbers.
  Take the voice alone as well.
- **Laptop speakers.** Under about 150 Hz the person may hear nothing that the numbers show; ask
  what they listened on before deciding their *thin* is the mix's.
