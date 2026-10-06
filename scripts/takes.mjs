#!/usr/bin/env node
/**
 * Takes of the game's own sound, rendered offline, for listening to and for
 * measuring: from this checkout, and side by side from any other checkout or
 * any older commit. The sound counterpart of `shots.mjs`, and run the same way.
 *
 *   npm run takes -- <takes.mjs> <out-dir> [--tree label=DIR | label=@COMMIT]...
 *                    [--query "&seed=3"] [--match -20]
 *
 * <takes.mjs> is a script of the game's own, and the only part of this that
 * knows the game. It reaches the game's sound through whatever handle the game
 * offers; what that is, and how it renders, is the game's choice:
 *
 *   export const path = "/?test=1";       // what to open, "/" if left out
 *   export async function ready(page) {}  // wait until the game can be driven
 *   export const hrtf = 48000;            // if any panner is "HRTF": its rate (or rates)
 *   export default async function (take, page, tree) {
 *       // set the game up with page.evaluate(...), then, for every take worth keeping:
 *       await take("name", () =>
 *           page.evaluate(async () => __takes.pack(await window.__game.hear({ seconds: 4 }))),
 *       );
 *   }
 *
 * The second argument of `take` renders and returns `{ sampleRate, channels }`,
 * the channels as arrays of numbers or as base64 of little-endian float32.
 * The page has a helper for that: `__takes.pack(audioBuffer)`. Render offline,
 * through an OfflineAudioContext, and through the game's own code: a Web Audio
 * graph builds into any BaseAudioContext, so a game whose sound takes its
 * context as a parameter can render a take as fast as the machine allows, the
 * same on every machine, with no speaker. Dragon's, Extra Sapien's, sandworm's
 * and Kyle on Duty's sound all do; each of the four built a renderer and a
 * measurer of its own before this one existed.
 *
 * Every take goes to `<out-dir>/<name>.wav`, or with more than one tree to
 * `<out-dir>/<name>-<label>.wav` (32-bit float), with what it measured in
 * `<out-dir>/takes.json` and on the console, and every run lays the takes out
 * on `<out-dir>/sheet.png`: a row a take and a column a tree, each with its
 * waveform, its spectrogram and its numbers (`lib/listen.mjs` says what each
 * is). `--match -20` also writes `<name>[-<label>].-20LUFS.wav`, each scaled to
 * that loudness, so that a pair compared by ear is not decided by its level:
 * Extra Sapien matched its listening pairs that way. An out-dir named
 * `scratch-...` is ignored by git.
 *
 * `hrtf` is for a gotcha of Chromium's. An offline render that reaches its
 * first panner with `panningModel = "HRTF"` waits for Chromium to load the HRTF
 * database, and now and then that load never finishes: the render waits for
 * ever, with nothing said, and so does every later one on that page. Kyle on
 * Duty's renders stopped at a different take each run, and under load every
 * run stalled within four. Given `hrtf`, this loads the database in the page
 * before the first take, through a render of its own that the page then holds
 * (a loaded database is shared while a context holds it), and on a page where
 * the load has not finished in five seconds it opens the page again under the
 * machine's other name: another site to Chromium, so a fresh renderer. A
 * reload waits on the stuck page, and timed out. Without `hrtf`, nothing of
 * this runs.
 *
 * Trees, their copies and their servers are `shots.mjs`'s, in `lib/trees.mjs`.
 * The same script drives every tree, so a commit older than the handle it
 * uses fails, says so, and leaves its column empty.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { BANDS, compare, matched, measure, spectrogram, wav } from "./lib/listen.mjs";
import { parseTrees, serve, stop, watch } from "./lib/trees.mjs";

const argv = process.argv.slice(2);
const pos = [];
const opt = { tree: [] };
while (argv.length) {
    const a = argv.shift();
    if (a === "--tree") opt.tree.push(argv.shift());
    else if (a.startsWith("--")) opt[a.slice(2)] = argv.shift();
    else pos.push(a);
}
const [scriptFile, outDir] = pos;
if (!scriptFile || !outDir) {
    console.error(
        "usage: npm run takes -- <takes.mjs> <out-dir> [--tree label=DIR|label=@COMMIT]... " +
            "[--query Q] [--match LUFS]",
    );
    process.exit(2);
}
const script = await import(pathToFileURL(resolve(scriptFile)).href);
if (typeof script.default !== "function")
    throw new Error(`${scriptFile} has no default export to drive the game with`);
const match = opt.match === undefined ? null : Number(opt.match);
const trees = parseTrees(opt.tree, "takes");
const many = trees.length > 1;
mkdirSync(outDir, { recursive: true });

/** In the page before the game loads: the helper a take hands its audio back through. */
const helper = () => {
    window.__takes = {
        pack(buffer) {
            const channels = [];
            for (let c = 0; c < buffer.numberOfChannels; c++) {
                const bytes = new Uint8Array(buffer.getChannelData(c).slice().buffer);
                let s = "";
                for (let i = 0; i < bytes.length; i += 0x8000)
                    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
                channels.push(btoa(s));
            }
            return { sampleRate: buffer.sampleRate, channels };
        },
        /** Load the HRTF database at a rate and hold it; false if the load did not finish. */
        hrtf(rate) {
            const held = (window.__takesHrtf ??= new Map());
            if (!held.has(rate)) {
                const c = new OfflineAudioContext(1, 1024, rate);
                const p = c.createPanner();
                p.panningModel = "HRTF";
                const src = c.createConstantSource();
                src.connect(p).connect(c.destination);
                src.start();
                held.set(
                    rate,
                    Promise.race([
                        c.startRendering().then(() => c),
                        new Promise((ok) => setTimeout(() => ok(null), 5000)),
                    ]),
                );
            }
            return held.get(rate).then((c) => c !== null);
        },
    };
};

const LOADS = 10;
/** Make the page ready to render, loading it again where the HRTF database did not load. */
async function readyToRender(page, say) {
    const rates = script.hrtf === undefined ? [] : [script.hrtf].flat();
    for (let k = 1; ; k++) {
        if (script.ready) await script.ready(page);
        let loaded = true;
        for (const rate of rates)
            loaded &&= await page.evaluate((r) => window.__takes.hrtf(r), rate);
        if (loaded) return;
        if (k === LOADS) throw new Error(`the HRTF database did not load in ${LOADS} page loads`);
        say(`the HRTF database did not load; opening the page again (${k} of ${LOADS - 1})`);
        const u = new URL(page.url());
        u.hostname = u.hostname === "localhost" ? "127.0.0.1" : "localhost";
        await page.goto(u.href, { timeout: 120_000 });
    }
}

const unpack = (r) => ({
    rate: r.sampleRate,
    channels: r.channels.map((c) =>
        typeof c === "string"
            ? new Float32Array(new Uint8Array(Buffer.from(c, "base64")).buffer)
            : Float32Array.from(c),
    ),
});

const executablePath = process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE"];
// The full browser in its headless mode, as playwright.config.ts says why.
const browser = await chromium.launch(
    executablePath ? { executablePath } : { channel: "chromium" },
);
const takes = new Map(); // take name -> tree label -> { file, m, grid, wave }
let failed = false;
try {
    for (const tree of trees) {
        const say = (m) => console.log(many ? `${tree.label}: ${m}` : m);
        let page = null;
        try {
            const port = await serve(tree.dir);
            page = await browser.newPage();
            await page.addInitScript(helper);
            const watching = watch(page, say);
            await page.goto(`http://127.0.0.1:${port}${script.path ?? "/"}${opt.query ?? ""}`, {
                timeout: 120_000,
            });
            await readyToRender(page, say);
            watching.booted = true;
            const take = async (name, render) => {
                const t0 = performance.now();
                const { rate, channels } = unpack(await render());
                const ms = performance.now() - t0;
                if (!channels.length || !channels[0].length)
                    throw new Error(`take ${name} came back empty`);
                const base = many ? `${name}-${tree.label}` : name;
                writeFileSync(join(outDir, `${base}.wav`), wav(channels, rate));
                if (match !== null)
                    writeFileSync(
                        join(outDir, `${base}.${match}LUFS.wav`),
                        wav(matched(channels, rate, match), rate),
                    );
                const m = { ...measure(channels, rate), renderMs: Math.round(ms) };
                if (!takes.has(name)) takes.set(name, new Map());
                takes.get(name).set(tree.label, {
                    channels,
                    rate,
                    file: `${base}.wav`,
                    m,
                    grid: spectrogram(channels, rate),
                    wave: waveform(channels),
                });
                say(`${join(outDir, `${base}.wav`)}  ${line(m)}`);
                if (m.clipped) say(`  ${name}: ${m.clipped} samples at full scale`);
                if (!Number.isFinite(m.lufs)) say(`  ${name}: SILENT (nothing above -70 LUFS)`);
            };
            await script.default(take, page, tree);
        } catch (e) {
            failed = true;
            say(`FAILED: ${e instanceof Error ? e.message : e}`);
        } finally {
            await page?.close().catch(() => {});
            stop();
        }
    }
    const record = {};
    for (const [name, by] of takes)
        record[name] = Object.fromEntries([...by].map(([l, t]) => [l, t.m]));
    writeFileSync(join(outDir, "takes.json"), JSON.stringify(record, null, 1));
    if (many) table();
    for (const file of await sheets()) console.log(file);
} finally {
    await browser.close();
    stop();
}
process.exit(failed ? 1 : 0);

function fmt(v, d = 1) {
    return Number.isFinite(v) ? v.toFixed(d) : "-inf";
}

function line(m) {
    return (
        `${fmt(m.seconds, 2)} s, ${fmt(m.lufs)} LUFS (loudest 3 s ${fmt(m.loudest3s)}), peak ${fmt(m.peak)} dBFS, ` +
        `starts ${fmt(m.start, 2)} s, loudest at ${fmt(m.loudestAt, 2)} s, rings ${fmt(m.ringsFor, 2)} s, ` +
        `centroid ${Math.round(m.centroid)} Hz, L/R ${fmt(m.correlation, 2)}`
    );
}

/** The numbers side by side, a take a block and a tree a column. */
function table() {
    const rows = [
        ["LUFS", (m) => fmt(m.lufs)],
        ["loudest 3 s", (m) => fmt(m.loudest3s)],
        ["peak dBFS", (m) => fmt(m.peak)],
        ["clipped", (m) => String(m.clipped)],
        ["starts s", (m) => fmt(m.start, 2)],
        ["loudest at s", (m) => fmt(m.loudestAt, 2)],
        ["rings s", (m) => fmt(m.ringsFor, 2)],
        ["centroid Hz", (m) => String(Math.round(m.centroid))],
        ["L/R", (m) => fmt(m.correlation, 2)],
    ];
    for (const [name, by] of takes) {
        console.log(`\n${name}`);
        console.log(["", ...trees.map((t) => t.label)].map((s) => s.padStart(14)).join(""));
        for (const [label, f] of rows)
            console.log(
                [label, ...trees.map((t) => (by.get(t.label) ? f(by.get(t.label).m) : "no take"))]
                    .map((s) => s.padStart(14))
                    .join(""),
            );
        // Against the first tree: from when the take differs, and what changed after.
        const first = by.get(trees[0].label);
        for (const t of trees.slice(1)) {
            const other = by.get(t.label);
            if (!first || !other) continue;
            if (first.rate !== other.rate) {
                console.log(`  ${t.label} against ${trees[0].label}: rendered at another rate`);
                continue;
            }
            const c = compare(first.channels, other.channels, first.rate);
            if (c.from === null) {
                console.log(
                    `  ${t.label} against ${trees[0].label}: the same take (within -100 dBFS)`,
                );
                continue;
            }
            const moved = c.octaves
                .filter((o) => Math.abs(o.change) >= 3)
                .map(
                    (o) =>
                        `${o.band >= 1000 ? `${o.band / 1000}k` : o.band} ${o.change > 0 ? "+" : ""}${o.change.toFixed(0)}`,
                )
                .join(", ");
            console.log(
                `  ${t.label} against ${trees[0].label}: differs from ${c.from.toFixed(2)} s; ` +
                    `after that, octaves in dB: ${moved || "none moved 3 dB"}`,
            );
        }
    }
}

/** Min and max of each of 720 slices: the waveform as drawn. */
function waveform(channels) {
    const n = channels[0].length;
    const out = [];
    for (let x = 0; x < 720; x++) {
        let lo = 0;
        let hi = 0;
        for (let i = Math.floor((x * n) / 720); i < Math.floor(((x + 1) * n) / 720); i++)
            for (const c of channels) {
                lo = Math.min(lo, c[i]);
                hi = Math.max(hi, c[i]);
            }
        out.push([+lo.toFixed(3), +hi.toFixed(3)]);
    }
    return out;
}

/**
 * The sheet, drawn by the browser on a canvas as shots.mjs draws its own: the
 * browser is the one image tool every checkout has. Each take: its waveform
 * (red where it reaches full scale), its spectrogram from 30 Hz to 16 kHz on a
 * log scale (a line at 1 kHz), and its numbers. Cut into pages of about 2,400
 * pixels, for shots.mjs's reason.
 */
async function sheets() {
    if (takes.size === 0) return [];
    const cols = trees.length;
    const width = Math.min(1800, 640 * cols + 40);
    const cell = 300;
    const data = [...takes].map(([name, by]) => ({
        name,
        cells: trees.map((t) => {
            const v = by.get(t.label);
            return v
                ? { label: t.label, wave: v.wave, grid: v.grid, text: line(v.m), bands: v.m.bands }
                : { label: t.label };
        }),
    }));
    const perPage = Math.max(1, Math.floor(2_400 / (cell + 30)));
    const files = [];
    const pages = Math.ceil(data.length / perPage);
    for (let p = 0; p < pages; p++) {
        const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#1d1f22;color:#eee;font:13px/1.35 system-ui,sans-serif;padding:12px 20px}
.t{margin:10px 0 4px;font-weight:600} .g{display:grid;gap:6px;grid-template-columns:repeat(${cols},1fr)}
.c{background:#2a2d31;padding:4px} canvas{width:100%;display:block} .n{font-size:11px;color:#bbb;margin-top:3px}
.c i{display:block;padding:12px;color:#ff8a80}
</style></head><body><script>const DATA=${JSON.stringify(data.slice(p * perPage, (p + 1) * perPage))};const BANDS=${JSON.stringify(BANDS)};
for (const take of DATA) {
  const t = document.createElement("div"); t.className = "t"; t.textContent = take.name; document.body.appendChild(t);
  const g = document.createElement("div"); g.className = "g"; document.body.appendChild(g);
  for (const c of take.cells) {
    const d = document.createElement("div"); d.className = "c"; g.appendChild(d);
    if (!c.wave) { d.innerHTML = "<i>" + c.label + ": no take</i>"; continue; }
    const cv = document.createElement("canvas"); cv.width = 720; cv.height = ${cell}; d.appendChild(cv);
    const x = cv.getContext("2d"); x.fillStyle = "#111"; x.fillRect(0, 0, 720, ${cell});
    const wh = 90;
    x.fillStyle = "#8ab4f8";
    c.wave.forEach(([lo, hi], i) => {
      x.fillStyle = (hi >= 1 || lo <= -1) ? "#ff5252" : "#8ab4f8";
      x.fillRect(i, wh / 2 - hi * wh / 2, 1, Math.max(1, (hi - lo) * wh / 2));
    });
    const top = wh + 4, gh = ${cell} - top - 4, rows = c.grid[0].length, colsN = c.grid.length;
    for (let i = 0; i < colsN; i++) for (let r = 0; r < rows; r++) {
      const v = Math.max(0, Math.min(1, (c.grid[i][r] + 100) / 90));
      x.fillStyle = "hsl(" + (260 - 220 * v) + ",80%," + (8 + 55 * v) + "%)";
      x.fillRect(i * 720 / colsN, top + gh - (r + 1) * gh / rows, 720 / colsN + 1, gh / rows + 1);
    }
    const k = Math.log(1000 / 30) / Math.log(16000 / 30);
    x.strokeStyle = "#fff6"; x.beginPath(); x.moveTo(0, top + gh * (1 - k)); x.lineTo(720, top + gh * (1 - k)); x.stroke();
    x.fillStyle = "#000a"; x.fillRect(0, 0, 60, 16); x.fillStyle = "#fff"; x.fillText(c.label, 4, 12);
    const n = document.createElement("div"); n.className = "n";
    n.textContent = c.text + " · octaves " + BANDS.map((b, j) => (b >= 1000 ? b / 1000 + "k" : b) + " " + c.bands[j].toFixed(0) + "%").join(" ");
    d.appendChild(n);
  }
}
</script></body></html>`;
        const name = pages === 1 ? "sheet" : `sheet-${p + 1}`;
        const htmlFile = resolve(outDir, `${name}.html`);
        writeFileSync(htmlFile, html);
        const page = await browser.newPage({ viewport: { width, height: 100 } });
        await page.goto(pathToFileURL(htmlFile).href);
        await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
        await page.close();
        files.push(join(outDir, `${name}.png`));
    }
    return files;
}
