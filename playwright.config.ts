import { defineConfig } from "@playwright/test";

/**
 * The end-to-end tests boot the real game on the Vite dev server in headless
 * Chromium and drive it. They are the tests that say a player can do a thing.
 * Headless Chromium runs WebGL 2, drawing in software, so a 3D game boots here.
 *
 * Carried back from dragon, a game built from this template, with the reason
 * for each setting beside it: every one of them was paid for there. Give any
 * setting you add or change its reason too. One that arrives without one gets
 * kept or changed by guesswork, and dragon's first config ran on one worker
 * for a week because nothing said why it did.
 *
 * Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to point at a Chromium binary when the
 * one Playwright wants is not installed. The cloud session's start hook
 * (.claude/hooks/cloud-session-start.sh) does this.
 */
const executablePath = process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE"];

/**
 * Every run starts its own server and never borrows one that is already up. A
 * run that borrows a server tests whatever that server serves: in dragon, a
 * worktree with a bug in it passed a test its own code fails, because another
 * checkout's server was on the port, and a run that borrowed an earlier run's
 * server lost it halfway when that run finished. So the port is this
 * checkout's own, taken from its path, so that two worktrees can each run the
 * suite at once, and it is never the dev server's 3000. E2E_PORT overrides it.
 * Two runs in one checkout do collide on it, and the second stops before it
 * starts; the way past that is another E2E_PORT, not `reuseExistingServer`,
 * which is what the error suggests.
 */
const port = Number(process.env["E2E_PORT"] ?? 3100 + (hashOf(import.meta.dirname) % 800));

function hashOf(s: string): number {
    let h = 7;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}

export default defineConfig({
    // A layout assumption, like index.html's entry point: a line to change.
    testDir: "tests/e2e",
    // Tests spread over the workers one at a time rather than a file at a time.
    // That is sound only while no test reads anything another leaves behind:
    // files, storage, the clock, shared state in the page. List what they share
    // before trusting it. On a 4-vCPU cloud session dragon's suite took 13.5
    // minutes on one worker and 4.3 on four. A worker is one browser.
    fullyParallel: true,
    workers: "100%",
    // A retry turns a failure into a pass and hides why it failed. A timeout is
    // not a flake until it has been timed on both commits.
    retries: 0,
    reporter: [["list"]],
    use: {
        baseURL: `http://127.0.0.1:${port}`,
        viewport: { width: 1280, height: 720 },
        // The full browser in its headless mode, which is what the cloud
        // sessions run, and not the headless shell Playwright picks by default.
        // On the shell, a player's frame loop grew a browser to gigabytes, and
        // two at once ran CI's runner out of memory. No local run had ever used
        // that browser, and the first fix went to a test's time budget.
        channel: executablePath ? undefined : "chromium",
        launchOptions: executablePath ? { executablePath } : {},
        // CI keeps test-results/ from a failed run for a week.
        screenshot: "only-on-failure",
    },
    webServer: {
        command: `npx vite --host 127.0.0.1 --port ${port} --strictPort`,
        // Watching nothing (vite.config.ts). While dragon's watched, a file
        // saved under src/ reloaded the page under whichever test was running,
        // and the test died on "Execution context was destroyed" or went on
        // against a fresh game. Five runs were lost that way, four of them put
        // down to whoever had been editing. An edit made during a run is the
        // next run's to test.
        env: { E2E_SERVER: "1" },
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: false,
        timeout: 60_000,
    },
});
