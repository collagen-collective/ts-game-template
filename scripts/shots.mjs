#!/usr/bin/env node
/**
 * Posed frames of the game, for looking at rather than measuring: from this
 * checkout, and side by side on one sheet from any other checkout or any older
 * commit.
 *
 *   npm run shots -- <shots.mjs> <out-dir> [--tree label=DIR | label=@COMMIT]...
 *                    [--query "&seed=3"] [--width 1280] [--height 720]
 *
 * <shots.mjs> is a script of the game's own, and the only part of this that
 * knows the game. It drives the page through whatever test handle the game
 * offers; what that handle is, and how it is reached, is the game's choice:
 *
 *   export const path = "/?test=1";       // what to open, "/" if left out
 *   export async function ready(page) {}  // wait until the game can be driven
 *   export async function draw(page) {}   // draw a frame: run before every shot
 *   export default async function (shoot, page, tree) {
 *       // pose the game with page.evaluate(...), then
 *       await shoot("name"); // for every frame worth keeping
 *   }
 *
 * `ready` and `draw` may be left out. A game that draws only when asked, under
 * test, needs `draw`, or every frame is of the last one it drew; one whose
 * posing draws its own frame, as dragon's camera does, leaves `draw` out and
 * draws where it needs to. `--query` is added to `path` as written. The page's
 * errors are printed and its `console.log` is not: a script that measures
 * returns what it measured from `page.evaluate` and prints it itself.
 *
 * Every frame goes to `<out-dir>/<name>.png`, or with more than one tree to
 * `<out-dir>/<name>-<label>.png`, and every run lays them out on
 * `<out-dir>/sheet.png`: a row a shot and a column a tree, or with one tree a
 * contact sheet in shot order. A long run's sheet is cut into `sheet-1.png`,
 * `sheet-2.png` and so on, each short enough to read as one picture. An
 * out-dir named `scratch-...` is ignored by git.
 *
 * A tree is `label=DIR`, a checkout of the game, or `label=@COMMIT`, which is
 * exported with `git archive` into a folder of its own under the system's temp
 * directory (`TMPDIR` moves it), with node_modules of its own; the copy is kept
 * for the next run, and `rm -rf` takes it away. With no `--tree`, the one tree is this checkout,
 * `now=.`. The same script drives every tree, so a commit older than the
 * handle it uses fails, says so, and leaves its column empty.
 *
 * Carried back from dragon and Extra Sapien, games built from this template,
 * each of which built one of these for itself. Frames found what the tests
 * could not: in Extra Sapien, with every test green, a tour of the whole game
 * found 22 defects where four places built apart had met. The reason for each
 * choice below is beside it.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
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
        "usage: npm run shots -- <shots.mjs> <out-dir> [--tree label=DIR|label=@COMMIT]... " +
            "[--query Q] [--width W] [--height H]",
    );
    process.exit(2);
}
const script = await import(pathToFileURL(resolve(scriptFile)).href);
if (typeof script.default !== "function")
    throw new Error(`${scriptFile} has no default export to drive the game with`);
const width = Number(opt.width ?? 1280);
const height = Number(opt.height ?? 720);
// The trees, their copies and their servers: lib/trees.mjs, with the reasons.
const trees = parseTrees(opt.tree, "shots");
const many = trees.length > 1;
mkdirSync(outDir, { recursive: true });

const executablePath = process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE"];
// The full browser in its headless mode, as playwright.config.ts says why.
const browser = await chromium.launch(
    executablePath ? { executablePath } : { channel: "chromium" },
);
const frames = new Map(); // shot name -> tree label -> file name
let failed = false;
try {
    for (const tree of trees) {
        const say = (m) => console.log(many ? `${tree.label}: ${m}` : m);
        let page = null;
        try {
            const port = await serve(tree.dir);
            page = await browser.newPage({ viewport: { width, height } });
            const watching = watch(page, say);
            // The first load compiles every module, and took longer than the default
            // 30 s on a busy machine in Extra Sapien; so did compositing a frame with
            // the bloom on, in software.
            await page.goto(`http://127.0.0.1:${port}${script.path ?? "/"}${opt.query ?? ""}`, {
                timeout: 120_000,
            });
            if (script.ready) await script.ready(page);
            watching.booted = true;
            const shoot = async (name) => {
                if (script.draw) await script.draw(page);
                const file = many ? `${name}-${tree.label}.png` : `${name}.png`;
                await page.screenshot({ path: join(outDir, file), timeout: 180_000 });
                if (!frames.has(name)) frames.set(name, new Map());
                frames.get(name).set(tree.label, file);
                console.log(join(outDir, file));
            };
            await script.default(shoot, page, tree);
        } catch (e) {
            failed = true;
            say(`FAILED: ${e instanceof Error ? e.message : e}`);
        } finally {
            await page?.close().catch(() => {});
            stop();
        }
    }
    for (const file of await sheets()) console.log(file);
} finally {
    await browser.close();
    stop();
}
process.exit(failed ? 1 : 0);

/**
 * The sheet is laid out as a page beside the frames and photographed by the
 * same browser: the browser is the one image tool every checkout has, and
 * dragon's cloud container had no ImageMagick. Cut into pages of about 2,400
 * pixels, so that each can be read as one picture: an agent trying this on
 * Extra Sapien got a before-and-after of 33 rows on two pages of about 5,900
 * pixels each, shrunk to an unreadable strip when looked at, and built a
 * shorter sheet of its own to read it.
 */
async function sheets() {
    if (frames.size === 0) return [];
    const esc = (s) =>
        String(s).replace(
            /[&<>"]/g,
            (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
        );
    const sheetWidth = many ? Math.min(1800, 640 * trees.length + 40) : 1800;
    const cols = many ? trees.length : 4;
    const cellHeight = ((sheetWidth - 40) / cols) * (height / width) + (many ? 30 : 6);
    const cells = many
        ? [...frames].map(([name, by]) => ({
              label: name,
              images: trees.map((t) => ({ file: by.get(t.label), caption: t.label })),
          }))
        : [
              {
                  label: "",
                  images: [...frames].map(([name, by]) => ({
                      file: [...by.values()][0],
                      caption: name,
                  })),
              },
          ];
    // Rows of the grid, so that a page can be cut between them.
    const rows = cells.flatMap((c) => {
        const out = [];
        for (let i = 0; i < c.images.length; i += cols)
            out.push({ label: i === 0 ? c.label : "", images: c.images.slice(i, i + cols) });
        return out;
    });
    const perPage = Math.max(1, Math.floor(2_400 / cellHeight));
    const files = [];
    const pages = Math.ceil(rows.length / perPage);
    for (let p = 0; p < pages; p++) {
        const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#1d1f22;color:#eee;font:14px/1.35 system-ui,sans-serif;padding:12px 20px}
.t{margin:10px 0 4px;font-weight:600} .g{display:grid;gap:3px;grid-template-columns:repeat(${cols},1fr)}
.c{position:relative;min-height:40px;background:#2a2d31} .c img{width:100%;display:block}
.c span{position:absolute;left:4px;top:3px;background:#000a;color:#fff;padding:0 4px;font-size:12px}
.c i{display:block;padding:12px;color:#ff8a80}
</style></head><body>${rows
            .slice(p * perPage, (p + 1) * perPage)
            .map(
                (r) =>
                    `${r.label ? `<div class="t">${esc(r.label)}</div>` : ""}<div class="g">${r.images
                        .map((m) =>
                            m.file
                                ? `<div class="c"><img src="${esc(encodeURIComponent(m.file))}"><span>${esc(m.caption)}</span></div>`
                                : `<div class="c"><i>${esc(m.caption)}: no frame</i></div>`,
                        )
                        .join("")}</div>`,
            )
            .join("")}</body></html>`;
        const name = pages === 1 ? "sheet" : `sheet-${p + 1}`;
        const htmlFile = resolve(outDir, `${name}.html`);
        writeFileSync(htmlFile, html);
        const page = await browser.newPage({ viewport: { width: sheetWidth, height: 100 } });
        await page.goto(pathToFileURL(htmlFile).href);
        await page.waitForFunction(() => [...document.images].every((i) => i.complete));
        await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
        await page.close();
        files.push(join(outDir, `${name}.png`));
    }
    return files;
}
