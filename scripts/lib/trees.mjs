/**
 * The checkouts a harness runs the game from, and a server of its own for
 * each: shared by `shots.mjs` (frames) and `takes.mjs` (sound), so that what
 * either says about a tree, the other says too. The reasons for each choice
 * are beside it; most were paid for in dragon and Extra Sapien.
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

/**
 * `--tree` values as given (`label=DIR` or `label=@COMMIT`), as trees to run
 * from. With none, the one tree is this checkout, `now=.`.
 */
export function parseTrees(given, prefix) {
    return (given.length ? given : ["now=."]).map((t) => {
        const at = t.indexOf("=");
        const [label, where] = [t.slice(0, at), t.slice(at + 1)];
        if (at < 1 || !where)
            throw new Error(`--tree wants label=DIR or label=@COMMIT, not "${t}"`);
        return {
            label,
            dir: where.startsWith("@") ? copyAt(where.slice(1), prefix) : resolve(where),
        };
    });
}

/**
 * The game as it was at a commit, beside this checkout. An export of the
 * commit's files, not a worktree: a worktree registers itself in the shared
 * .git, and in dragon both agents given a version that made one declined to
 * use it for that reason. With node_modules of its own, not a link to this
 * checkout's: with a link, two dev servers share Vite's dependency cache, and
 * one re-bundling reloads the other's pages mid-run ("504 Outdated Optimize
 * Dep"), and the frames come back empty or wrong with nothing said. Install
 * scripts are skipped, so the copy registers no hooks and no merge driver.
 * The copy is kept for the next run, under `TREES_DIR` if it is set and the
 * system's temp directory if not, and `rm -rf` takes it away. Not `TMPDIR`:
 * Chromium keeps its profile there too, and with `TMPDIR` set to a long path
 * in a session's scratch folder it crashed on launch (SIGTRAP), in the trial
 * the sound harness had before it shipped.
 */
export function copyAt(commit, prefix = "tree") {
    // The repository the run is made from, as `now=.` is this directory.
    const repo = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
    const short = execFileSync("git", ["rev-parse", "--short", `${commit}^{commit}`], {
        cwd: repo,
        encoding: "utf8",
    }).trim();
    const base = process.env["TREES_DIR"] || tmpdir();
    const dir = join(base, `${prefix}-${basename(repo)}-at-${short}`);
    if (existsSync(join(dir, "node_modules", ".package-lock.json"))) {
        console.log(`reusing ${dir}`);
        return dir;
    }
    if (existsSync(dir))
        throw new Error(`${dir} exists and is not a finished copy; remove it with: rm -rf ${dir}`);
    mkdirSync(dir, { recursive: true });
    console.log(`copying ${short} to ${dir}`);
    execFileSync("sh", ["-c", `git archive ${short} | tar -x -C "${dir}"`], { cwd: repo });
    execFileSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], {
        cwd: dir,
        stdio: ["ignore", "ignore", "inherit"],
    });
    return dir;
}

// A port nobody is on, asked of the system rather than guessed: in Extra
// Sapien, two runs in two worktrees once drew the same random port, the second
// run's server exited, and its frames were of the first run's page.
const free = () =>
    new Promise((ok, fail) => {
        const s = createServer();
        s.once("error", fail);
        s.listen(0, "127.0.0.1", () => {
            const { port } = s.address();
            s.close(() => ok(port));
        });
    });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let server = null;
/** Stop the server `serve` started, if one is running. */
export function stop() {
    try {
        if (server) process.kill(-server.pid, "SIGTERM");
    } catch {
        // already gone
    }
    server = null;
}
process.on("exit", stop);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => process.exit(130));

/**
 * A server for one tree, and its port. Every tree gets a server of its own,
 * and never borrows one: a run that borrows a server photographs whatever that
 * server serves. It watches nothing (E2E_SERVER, in
 * vite.config.ts), so a file saved during the run does not reload the page
 * under it. One at a time: a second call stops the first.
 */
export async function serve(dir) {
    stop();
    const port = await free();
    server = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
        cwd: dir,
        env: { ...process.env, E2E_SERVER: "1" },
        detached: true,
        stdio: "ignore",
    });
    let exited = null;
    server.on("exit", (code) => (exited = code ?? "a signal"));
    for (let i = 0; i < 600; i++) {
        // A server that answers while ours has exited is somebody else's.
        if (exited !== null) throw new Error(`the server for ${dir} exited (${exited})`);
        try {
            await fetch(`http://127.0.0.1:${port}/`);
            if (exited === null) return port;
        } catch {
            await sleep(200);
        }
    }
    throw new Error(`the server for ${dir} did not answer on ${port} in two minutes`);
}

/**
 * The page's errors, said as they happen: a frame of a broken game looks like
 * a frame, and a take of one sounds like silence. A reload mid-run is said
 * too, since everything after it is of a fresh game.
 */
export function watch(page, say) {
    page.on("pageerror", (e) => say(`page error: ${e.message}`));
    page.on("console", (m) => {
        if (m.type() === "error") say(`console error: ${m.text().slice(0, 400)}`);
    });
    const state = { booted: false };
    page.on("framenavigated", (f) => {
        if (state.booted && f === page.mainFrame())
            say("THE PAGE RELOADED, and everything after this is of a fresh game");
    });
    return state;
}
