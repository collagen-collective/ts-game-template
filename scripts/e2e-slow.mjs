#!/usr/bin/env node
/**
 * The end-to-end suite a little slower than CI runs it: two workers sharing one
 * core. A time limit set from a run on a development machine is set for a
 * faster machine than CI's, and this is where to find that out first.
 *
 *   npm run test:e2e:slow [-- <playwright test arguments>]
 *
 * Carried back from Extra Sapien, a game built from this template, where CI
 * first ran 112 commits into a branch and failed two end-to-end tests on their
 * time limits, with nothing wrong in the game. Pinned like this, a cloud
 * session failed the same two the same way. CI's runner, for a private
 * repository, had two cores: Playwright ran 2 workers there at "100%". Its
 * whole suite, at one commit, took:
 *
 *   - 2.0 min in a four-core cloud session, on 4 workers;
 *   - 6.0 min on CI, on 2 workers and 2 cores;
 *   - 7.8 min pinned like this, on 2 workers and 1 core: 1.3 times CI.
 *
 * So a test that passes here has room to spare on CI. One that fails here may
 * still pass there, but with less than a third in hand: Extra Sapien's
 * folk-score test took 1.5 min on CI against a 90 s limit, and failed here.
 *
 * Linux only: it pins with `taskset` (util-linux), and every process the suite
 * starts, the server and the browsers, inherits the pin. The cloud sessions are
 * Linux. It takes the first core this process is allowed rather than core 0,
 * since a container's cpuset need not include core 0.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const fail = (why) => {
    console.error(`test:e2e:slow: ${why}`);
    process.exit(2);
};
if (process.platform !== "linux") fail("pinning to one core needs Linux's taskset.");
if (spawnSync("taskset", ["-V"]).error) fail("taskset is not installed (util-linux).");

const allowed = /^Cpus_allowed_list:\s*(\d+)/m.exec(readFileSync("/proc/self/status", "utf8"));
const core = allowed ? allowed[1] : "0";
const args = ["-c", core, "npx", "playwright", "test", "--workers=2", ...process.argv.slice(2)];
console.log(`taskset ${args.join(" ")}`);
const run = spawnSync("taskset", args, { stdio: "inherit" });
process.exit(run.status ?? 1);
