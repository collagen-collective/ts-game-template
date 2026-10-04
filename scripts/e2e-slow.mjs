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
 * time limits, with nothing wrong in the game. Its runner, for a private
 * repository, had two cores (Playwright ran 2 workers there at "100%") and drew
 * 2.8 times slower than a four-core cloud session: the boot test took 42.6 s
 * there and 15.1 s here. Pinned like this, the session ran the same suite 3.8
 * times slower than unpinned, and both tests failed as they had on CI. A test
 * that passes here has room to spare there. (Design log, 2026-10-04, *CI's
 * runner draws 2.8 times slower than here*.)
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
