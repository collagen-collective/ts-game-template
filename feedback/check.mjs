// The feedback page, driven in a real browser: `npm run feedback:check [-- <out-dir>]`.
//
// It serves the demo (`feedback/demo/`) on a Vite server of its own, sends one report on the keys
// and mouse, one on a gamepad (a fake one, with the browser's standard mapping), and one the inbox
// refuses, and says what failed. With an out-dir it keeps a frame of each step to look at. Reports
// land in a folder of their own under the system's temp dir, never in feedback-inbox/.
//
// It is not in CI or `npm run verify`: the template has no game to boot, and a game's own
// end-to-end tests are the place to check the page as that game uses it. Run it after changing
// anything in feedback/page/.
import { chromium } from "@playwright/test";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";

const out = process.argv[2] ?? null;
if (out) mkdirSync(out, { recursive: true });
const root = mkdtempSync(join(tmpdir(), "feedback-check-"));
process.env["FEEDBACK_INBOX"] = join(root, "feedback-inbox");
const server = await createServer({
    configFile: new URL("../vite.config.ts", import.meta.url).pathname,
    root: new URL("..", import.meta.url).pathname,
    server: { port: 0, watch: null },
    logLevel: "error",
});
await server.listen();
const port = server.httpServer.address().port;

const failures = [];
const expect = (ok, what) => {
    console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
    if (!ok) failures.push(what);
};
const browser = await chromium.launch({
    executablePath: process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE"] || undefined,
});
try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.addInitScript(() => {
        const buttons = Array.from({ length: 17 }, () => ({
            pressed: false,
            value: 0,
            touched: false,
        }));
        const pad = {
            id: "check",
            index: 0,
            connected: true,
            mapping: "standard",
            axes: [0, 0, 0, 0],
            buttons,
            timestamp: 0,
        };
        Object.assign(window, { __pad: pad, __padOn: false });
        navigator.getGamepads = () => [window.__padOn ? pad : null];
    });
    const shot = async (name) => out && (await page.screenshot({ path: join(out, `${name}.png`) }));
    const demo = () =>
        page.evaluate(() => {
            const d = window.__feedbackDemo;
            return {
                open: d.feedback.isOpen,
                stage: d.feedback.stage,
                folder: d.feedback.lastFolder,
                marks: d.feedback.marks.length,
                paused: d.paused(),
                status: document.querySelector(".fb-status")?.textContent ?? "",
            };
        });
    const button = async (i, ms = 80) => {
        const set = (on) =>
            page.evaluate(
                ([i, on]) => {
                    window.__pad.buttons[i].pressed = on;
                    window.__pad.buttons[i].value = on ? 1 : 0;
                },
                [i, on],
            );
        await set(true);
        await page.waitForTimeout(ms);
        await set(false);
        await page.waitForTimeout(80);
    };
    const stick = (x, y) =>
        page.evaluate(
            ([x, y]) => {
                window.__pad.axes[0] = x;
                window.__pad.axes[1] = y;
            },
            [x, y],
        );
    const key = async (k) => {
        await page.keyboard.press(k);
        await page.waitForTimeout(50);
    };
    const folders = () => readdirSync(join(root, "feedback-inbox")).sort();

    await page.goto(`http://localhost:${port}/feedback/demo/`);
    await page.waitForTimeout(500);
    await key("Escape");
    await page.click('[data-do="feedback"]');
    await page.waitForTimeout(300);
    expect((await demo()).stage === "mark", "FEEDBACK opens on the frame, to mark");
    await shot("1-mark");

    // The keys and mouse: a ring, a stroke, a ring undone.
    await page.mouse.click(640, 330);
    await page.mouse.move(300, 500);
    await page.mouse.down();
    for (let i = 0; i <= 10; i++) await page.mouse.move(300 + i * 30, 500 - i * 8);
    await page.mouse.up();
    await page.mouse.click(900, 200);
    await key("KeyZ");
    expect((await demo()).marks === 2, "a click rings, a drag draws, Z undoes");
    await shot("2-marked");
    await key("Enter");
    await key("ArrowDown");
    await key("Enter");
    await page.click(".fb-page textarea");
    await page.keyboard.type("Typed: z, and Escape after");
    await key("Escape");
    expect((await demo()).marks === 2, "a z typed in the box is a letter, not an undo");
    await page.click('.fb-part[data-part="browser"]');
    await page.waitForTimeout(50);
    const ticks = await page.evaluate(() =>
        [...document.querySelectorAll(".fb-part")].map((e) => e.getAttribute("aria-checked")),
    );
    expect(
        ticks.join() === "true,true,false",
        `a click unticks a part, and the box says so (${ticks.join()})`,
    );
    await shot("3-tell");
    await key("Control+Enter");
    await page.waitForTimeout(500);
    await shot("4-sent");
    expect((await demo()).status.startsWith("SENT"), "Ctrl+Enter sends, and says so");
    await page.waitForTimeout(2000);
    let s = await demo();
    expect(
        !s.open && s.paused,
        "the thanks closes the page, and the game is still paused under it",
    );
    const first = folders()[0];
    expect(
        !!first && readdirSync(join(root, "feedback-inbox", first)).length === 5,
        "the report has its five files",
    );
    const md = first ? readFileSync(join(root, "feedback-inbox", first, "report.md"), "utf8") : "";
    expect(
        md.startsWith("# An idea · The Bridge") && md.includes("> Typed: z, and Escape after"),
        "report.md has the kind and the words as typed",
    );

    // The pad: the stick, A, RT held, Start; B after the thanks.
    await page.evaluate(() => {
        window.__padOn = true;
        window.__feedbackDemo.feedback.open();
    });
    await stick(1, -0.5);
    await page.waitForTimeout(400);
    await stick(0, 0);
    await button(0);
    await page.evaluate(() => {
        window.__pad.buttons[7].pressed = true;
        window.__pad.buttons[7].value = 1;
        window.__pad.axes[1] = 1;
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => {
        window.__pad.buttons[7].pressed = false;
        window.__pad.buttons[7].value = 0;
        window.__pad.axes[1] = 0;
    });
    await page.waitForTimeout(100);
    expect((await demo()).marks === 2, "on the pad, A rings and RT held draws");
    await shot("5-pad-mark");
    await button(9);
    await button(13);
    await button(0);
    await shot("6-pad-tell");
    await button(9);
    await page.waitForTimeout(600);
    await button(1);
    await page.waitForTimeout(200);
    s = await demo();
    expect(!s.open && folders().length === 2, "Start sends on the pad, and B puts the thanks away");

    // Refused: the words stay, and Escape twice puts the page away without reaching the game.
    await page.evaluate(() => (window.__padOn = false));
    await page.route("**/__feedback", (r) =>
        r.fulfill({
            status: 403,
            contentType: "application/json",
            body: JSON.stringify({ ok: false, error: "the inbox does not know this link's key" }),
        }),
    );
    await page.evaluate(() => window.__feedbackDemo.feedback.open());
    // Four keys inside one frame are four steps, in order: on to the words, down twice, choose.
    await page.evaluate(() => {
        for (const code of ["Enter", "ArrowDown", "ArrowDown", "Enter"]) {
            window.dispatchEvent(new KeyboardEvent("keydown", { code, key: code, bubbles: true }));
            window.dispatchEvent(new KeyboardEvent("keyup", { code, key: code, bubbles: true }));
        }
    });
    await page.waitForTimeout(100);
    const chosen = await page.evaluate(
        () => document.querySelector(".fb-kind.fb-chosen")?.textContent,
    );
    expect(
        chosen === "I LIKED THIS",
        `keys pressed faster than frames are each taken, in order (${chosen})`,
    );
    await page.click(".fb-page textarea");
    await page.keyboard.type("kept?");
    await key("Control+Enter");
    await page.waitForTimeout(400);
    s = await demo();
    const kept = await page.evaluate(() => document.querySelector(".fb-page textarea").value);
    expect(
        s.open && s.status.startsWith("NOT SENT: the inbox does not know") && kept === "kept?",
        "a refused report says why, and keeps the words",
    );
    await shot("7-refused");
    // Sending took the cursor out of the box: Escape goes back to the frame, then puts it away.
    await key("Escape");
    expect((await demo()).stage === "mark", "Escape from the words goes back to the frame");
    await key("Escape");
    await page.waitForTimeout(300);
    s = await demo();
    expect(
        !s.open && s.paused,
        "Escape from the frame puts the page away, and the game does not see it",
    );

    // Opened with the pad, the page names the pad's buttons before the pad is touched.
    await page.evaluate(() => window.__feedbackDemo.feedback.open("pad"));
    await page.waitForTimeout(100);
    const named = await page.evaluate(() => document.querySelector(".fb-mhints").textContent);
    expect(named.includes("Start"), `opened with "pad", it names the pad's buttons (${named})`);
    await key("Escape");
    await page.waitForTimeout(300);

    // A key held into the page and let go on it is let go in the game; one pressed on it is not.
    const ups = await page.evaluate(async () => {
        const seen = [];
        const hear = (e) => seen.push(e.code);
        window.addEventListener("keyup", hear);
        const fire = (type, code) =>
            window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true }));
        fire("keydown", "Space");
        window.__feedbackDemo.feedback.open();
        await new Promise((r) => requestAnimationFrame(r));
        fire("keyup", "Space");
        fire("keydown", "KeyZ");
        fire("keyup", "KeyZ");
        window.__feedbackDemo.feedback.close();
        await new Promise((r) => setTimeout(r, 200));
        window.removeEventListener("keyup", hear);
        return seen.join();
    });
    expect(
        ups === "Space",
        `a key held into the page is let go in the game, one pressed on it is kept (${ups})`,
    );
    expect(
        errors.length === 0,
        `no errors in the page${errors.length ? `: ${errors.join("; ")}` : ""}`,
    );
} finally {
    await browser.close();
    await server.close();
    rmSync(root, { recursive: true, force: true });
}
if (failures.length > 0) {
    console.error(`\n${failures.length} failed.`);
    process.exitCode = 1;
}
