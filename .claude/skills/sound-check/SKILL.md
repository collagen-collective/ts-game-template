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
one existed: a hook that rendered half a second of the world at two levels, with an in-game sound
desk; scores rendered in headless Chromium and measured for levels, spectra and onsets; an encounter
rendered while the world stepped, A-weighted by band; and a sound board's recipes rendered and
measured against the sounds of the game it recreated. What they found, and what the four had in
common, is what this is made of.

It was tried before it shipped. Two agents were given one report, *"The end-of-round sting doesn't
ring out any more. The big hit at the end used to shimmer away for a few seconds, and now it just
stops dead"*, on copies of a game in which the tam-tam under the sting's last hit had been
stopped 0.65 s after it, with no history to diff against. One had this skill and `npm run takes`;
the other was meant to have neither, found the skill in its session anyway, and used the game's own
renderer and measurer with it. Both found the cut, fixed it and showed it fixed, in 11 and 12
minutes. So the trial says little about speed; what it says is in this skill now, from what both
found wrong with it: the comparison between trees, levelling a pair by its loudest three seconds,
`TREES_DIR`, and the caveats on loudness, ring-out and repeats below.

## 1. Start with what they heard

Ask what they heard, where in the game, at what moment, and what they expected to hear instead;
and on what: headphones, laptop speakers, a television. A laptop's speakers play little under 100
to 150 Hz, so a sound that is *thin* there can be *boomy* on headphones. Their words are more exact
than they sound: *muddy* is usually too much between 125 and 500 Hz, *harsh* or *tinny* too much
between 2 and 6 kHz and little under it, *crackle* is clipping, *late* is a start time, and
*drowned out* is two levels and an overlap.

In a recreation, ask for a recording of the original before a description, and measure the two with
the same instrument (one recreation made it a guideline of its own: *Ask the person for a recording
of it before a description*). If nobody is around to ask, write down the questions you would have
asked, and bring them back with what you found.

**If the game has no `npm run takes` yet,** it was made from the template before the harness: copy
`scripts/takes.mjs` and `scripts/lib/` from the template, and add the npm script. Or render with the
game's own tools, if it has some, and read what they give the way this skill reads its numbers.

## 2. Give the game a way to render, once

A take is the game's own sound rendered into an `OfflineAudioContext`: as fast as the machine
allows, the same on every machine, with no speaker and no real-time clock. It works because a Web
Audio graph builds into any `BaseAudioContext`. What that needs from the game:

- **Sound that takes its context as a parameter,** rather than reaching for a global
  `AudioContext`. All four games' sound already did, or could, with a line changed.
- **The game's own path, not a copy of it.** Render through the same mixer, buses, reverb and
  limiter that play uses. A copy made for measuring drifts from the game the first time either is
  changed, and then measures nothing (`CLAUDE.md`: *keep one of each thing*).
- **The same take twice.** Seed whatever is random in the synthesis, so that a take repeats. Kyle on
  Duty's stings rendered alike from two commits with the same sound code, to about -117 dBFS in
  every sample and to the last digit of every measure; then a difference between two trees is the
  change. Its game-over song did not: two renders of the same code parted from 10.8 s on, by about
  -55 dBFS. Render a take twice before you read a difference between trees as the change.
- **A way to reach a moment,** where the sound depends on the game: step the world to the round's
  turn, the window going down, the explosion, and render what the ears hear there.

Two ways in, either is fine:

- **A handle** that renders: `window.__game.hear({ seconds, at })` returning an `AudioBuffer`, or a
  sound board page, as one game's `lookdev/sounds.html` is.
- **The game's modules, straight from the dev server.** Vite serves the source as modules, so a
  take can `await import("/src/audio/whatever.ts")` in the page and call it into its own
  `OfflineAudioContext`. One game's birdsong was rendered this way with no handle at all.

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
before the game loads. If any of the game's panners is `panningModel = "HRTF"`, add
`export const hrtf = 48000;` with the rate its takes render at (an array for more than one), and
the harness loads the HRTF database before the first take: see *An HRTF panner, offline*, below.
Then:

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
  | LUFS | how loud, as the ear weighs it, silence gated out | sounds of one kind within a few LU of each other. A tail restored can *lower* it: more quiet blocks pass the gate (the trial's fixed sting read 1.4 LU quieter). Read the loudest 3 s beside it |
  | loudest 3 s | the loudest three seconds | a sound that is quiet on average and loud in a burst |
  | peak dBFS, clipped | the largest sample, and how many reach 1.0 | clipped above 0 is crackle when played; a peak above -1 dBFS is close |
  | starts, loudest at, rings | seconds: first within 40 dB of the loudest, the loudest, and how long it stays within 40 dB after | *late*, *cut off*, *rings on*, for the whole take. A layer cut while another holds on barely moves it (the trial's cut tam-tam moved it 0.03 s): compare against a before (§5), or take the layer alone |
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
`shots.mjs`'s; `TREES_DIR` keeps the copies inside the checkout, and `TMPDIR` must not, since it
moves Chromium's files too and crashed it in the trial). The run prints each take's numbers side by
side, a column a tree, puts them side by side on the sheet, and says of each take against the
first tree **from when it differs, and which octaves changed after that**:

```
end-sting
  now against cut: differs from 3.00 s; after that, octaves in dB: 250 +9, 500 +12, 1k +11, 2k +10
start-sting
  now against cut: the same take (within -100 dBFS)
```

That line is the trial's defect and its control, found with no tool written for it: the cut
tam-tam's partials between 300 Hz and 2 kHz, from where its oscillators had stopped.

**When no commit has it right,** the last good record may be a number: a measurement in the design
log, taken with the game's own tools. Render now with the same tools and compare with that. In the
trial, the design log's table for the sting matched the fixed sting on every number the cut had
moved, which showed the table had been taken before the cut came in.

- **The control comes first.** Before *gone in the after* means anything, the defect has to show in
  the before, or in this checkout with the fix taken out. A take that comes back silent proves
  nothing about a sound being right.
- **Keep what the person called right in the same run.** When they say one sound is right and
  another is not, take both, and check the right one did not move (`CLAUDE.md`, *An observation is
  not a finding…*).
- **Match the pair on everything but the change.** Same seed, same moment, same length, same
  distance. Takes repeat exactly, so a difference in an unchanged take means the pair is not
  matched.

## 6. Give the person takes to listen to

The numbers find defects; the person decides what sounds right.

- **Match the level of a pair** they compare: `--match -20` writes each take again with its loudest
  three seconds at -20 LUFS, so the louder one does not win by being louder. One game matched
  its listening pairs so *"that the level does not decide"*. Not by integrated loudness: a pair
  that differs only in its tail would be levelled apart by the gate, and their identical starts
  would play 1.4 dB apart.
- **Ask for a comparison, not an absolute:** which of two is nearer what they remember or want,
  rather than whether one is good. One game's first playtest learned to ask that way.
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
- **Laptop speakers.** A laptop plays little under 100 to 150 Hz, so the person may hear nothing
  of what the numbers show there; ask what they listened on before deciding their *thin* is the
  mix's.
- **`TMPDIR` for the tree copies.** It moves Chromium's profile too, and from a long path Chromium
  crashed on launch. `TREES_DIR` moves only the copies.
- **An HRTF panner, offline.** A render that reaches its first `"HRTF"` panner waits for Chromium
  to load the HRTF database, and now and then the load never finishes: the render waits for ever,
  with nothing said, and so does every later one on that page. In one game it stopped every
  full render of its sound board at a different zombie voice; under load, every run stalled within
  four renders. It looked like the game's bug for a day, and three guesses were wrong before the
  renderer's threads named it (`OfflineAudioRender`, waiting, and `HRTF database loader`). A take
  that hangs at random, on sounds that are placed, is this until shown otherwise: `export const
  hrtf` in the script, and the harness loads the database first and opens a fresh page when it
  does not load. In a live `AudioContext`, in the same headless Chromium, the panner sounded within
  20 ms on 40 of 40 pages, with and without load: the hang is the offline render's wait.
- **A fix that reads quieter.** Restoring a tail lowered the sting's integrated loudness by 1.4 LU,
  because the gate let more of its quiet blocks in. More sound, a smaller number.
