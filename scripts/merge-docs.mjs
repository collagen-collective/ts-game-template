#!/usr/bin/env node
/**
 * The merge driver for the three documents. `.gitattributes` names it for
 * them, and `npm install` registers it with git (`prepare` runs this with
 * `--install`).
 *
 * Every branch appends to the design log, and many add a rule to the end of
 * the Charter's §5, so any two branches open at once conflict there. In
 * dragon, the game built from this template that this driver was written for,
 * every merge of main into a branch in its first week did, seven of seven. In
 * all of those, both sides had added text at the same place and neither had
 * changed anything that was there. That case, and only that one, is resolved
 * here.
 *
 * Both sides' additions are kept, theirs first: on a merge of main into a
 * branch, that is what landed first. In the design log the added entries are
 * merged by their headings' dates instead, each side's run kept together
 * wherever the dates allow, so the log stays oldest first and an entry's
 * "the entry before" still points where it did. Anything else is left as an
 * ordinary conflict, markers and all: a paragraph both sides edited, a log
 * addition that is not a run of dated entries, one heading written two ways.
 *
 *   node scripts/merge-docs.mjs <base> <ours> <theirs> <marker-size> <path>
 *
 * Git passes those as %O %A %B %L %P and reads the result from <ours>. Where
 * the driver is not registered, GitHub's merge button included, git merges
 * these files as it merges anything else, which is how they merged before.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";

const HEADING = /^### (\d{4}-\d{2}-\d{2}) /;
const isSep = (line) => line.trim() === "" || line.trim() === "---";

/**
 * What git runs, from the top of the work tree. The second half is for a
 * driver that cannot run at all — a checkout without this file, an edit that
 * broke it. Git would keep our side untouched and call the file conflicted
 * with nothing marked in it, and our side is missing everything theirs added,
 * so that half hands the file to git's own merge, markers and all.
 */
const DRIVER = [
    "node scripts/merge-docs.mjs %O %A %B %L %P ||",
    "{ grep -q '^<<<<<<<' %A && exit 1;",
    "git merge-file --marker-size=%L -L ours -L base -L theirs %A %O %B; }",
].join(" ");

/** Register the driver in this checkout's git config. Never fails an install. */
function install() {
    try {
        execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
    } catch {
        return; // Not a checkout: a tarball or a container build has nothing to merge.
    }
    try {
        // The command first: a driver with a name and no command stops every merge
        // of these files dead ("lacks command line"), where no driver at all is harmless.
        execFileSync("git", ["config", "merge.docs.driver", DRIVER]);
        execFileSync("git", ["config", "merge.docs.name", "the documents: keep what both added"]);
    } catch (err) {
        process.stderr.write(
            `merge-docs: not registered (${err.message}); the docs merge as before\n`,
        );
    }
}

function merge(basePath, oursPath, theirsPath, markerArg, path = "") {
    const size = Number(markerArg) || 7;
    const fallback = () => {
        // Whatever went wrong, leave git's own merge, markers and all, and say it is not done.
        try {
            execFileSync("git", [
                "merge-file",
                `--marker-size=${size}`,
                oursPath,
                basePath,
                theirsPath,
            ]);
            process.exit(0);
        } catch {
            process.exit(1);
        }
    };
    try {
        const { text, conflicts } = mergeFile(basePath, oursPath, theirsPath, size);
        const { out, found, left } = resolveHunks(
            text,
            size,
            /DESIGN-LOG\.md$/.test(path),
            basePath,
        );
        const marker = new RegExp(`^${"<".repeat(size)}( |$)`, "m");
        // A count that disagrees with git's means the markers were not read as written (CRLF, say).
        if ((conflicts < 127 && found !== conflicts) || (left === 0 && marker.test(out)))
            return fallback();
        writeFileSync(oursPath, out);
        process.exit(left > 0 ? 1 : 0);
    } catch (err) {
        process.stderr.write(`merge-docs: ${err.message}; falling back to git's own merge\n`);
        fallback();
    }
}

function mergeFile(basePath, oursPath, theirsPath, size) {
    const args = ["merge-file", "-p", "--diff3", `--marker-size=${size}`];
    args.push("-L", "ours", "-L", "base", "-L", "theirs", oursPath, basePath, theirsPath);
    try {
        return {
            text: execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 }),
            conflicts: 0,
        };
    } catch (err) {
        if (err.status > 0 && typeof err.stdout === "string")
            return { text: err.stdout, conflicts: err.status };
        throw err;
    }
}

function resolveHunks(text, size, isLog, basePath) {
    const lines = text.split("\n");
    const [open, mid, eq, close] = [
        `${"<".repeat(size)} ours`,
        `${"|".repeat(size)} base`,
        "=".repeat(size),
        `${">".repeat(size)} theirs`,
    ];
    const sep = isLog ? separator(readFileSync(basePath, "utf8")) : [];
    const out = [];
    let found = 0;
    let left = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] !== open) {
            out.push(lines[i]);
            continue;
        }
        const b = lines.indexOf(mid, i + 1);
        const e = lines.indexOf(eq, b + 1);
        const c = lines.indexOf(close, e + 1);
        if (b < 0 || e < 0 || c < 0) throw new Error("unbalanced conflict markers");
        found++;
        const [ours, base, theirs] = [
            lines.slice(i + 1, b),
            lines.slice(b + 1, e),
            lines.slice(e + 1, c),
        ];
        const done =
            base.length > 0
                ? null
                : isLog
                  ? mergeEntries(ours, theirs, sep)
                  : bothAdded(ours, theirs);
        if (done) out.push(...done);
        else {
            out.push(...lines.slice(i, c + 1));
            left++;
        }
        i = c;
    }
    return { out: out.join("\n"), found, left };
}

/** Two additions to prose, kept whole, theirs first; or null if they overlap at all. */
function bothAdded(ours, theirs) {
    const said = new Set(theirs.filter((l) => l.trim() !== ""));
    if (ours.some((l) => l.trim() !== "" && said.has(l))) return null;
    // One blank line where they meet, not the one each side brought.
    const join = theirs.at(-1)?.trim() === "" && ours[0]?.trim() === "";
    return [...theirs, ...(join ? ours.slice(1) : ours)];
}

/** A side's added lines as dated entries, or null if they are anything else. */
function entries(lines) {
    const heads = lines.flatMap((l, i) => (HEADING.test(l) ? [i] : []));
    if (heads.length === 0 || !lines.slice(0, heads[0]).every(isSep)) return null;
    const list = heads.map((h, k) => {
        let end = k + 1 < heads.length ? heads[k + 1] : lines.length;
        while (end > h && isSep(lines[end - 1])) end--;
        return { heading: lines[h], date: HEADING.exec(lines[h])[1], body: lines.slice(h, end) };
    });
    return {
        list,
        lead: heads[0] > 0,
        tail: lines.slice(lines.findLastIndex((l) => !isSep(l)) + 1),
    };
}

function mergeEntries(ours, theirs, sep) {
    const a = entries(theirs);
    const b = entries(ours);
    if (!a || !b || a.lead !== b.lead) return null;
    // A heading is an entry's identity: the same one twice is one entry, if it says the same thing.
    const known = new Map(a.list.map((x) => [x.heading, x.body.join("\n")]));
    const mine = [];
    for (const x of b.list) {
        if (!known.has(x.heading)) mine.push(x);
        else if (known.get(x.heading) !== x.body.join("\n")) return null;
    }
    const merged = byDate(a.list, mine);
    const last = merged[merged.length - 1];
    const tail = a.list.includes(last) ? a.tail : b.tail;
    return [...merged.flatMap((x, k) => [...(k > 0 || a.lead ? sep : []), ...x.body]), ...tail];
}

/** Both runs in date order, switching sides only when the dates require it. */
function byDate(first, second) {
    const out = [];
    let i = 0;
    let j = 0;
    let onFirst = !(first.length && second.length && second[0].date < first[0].date);
    while (i < first.length || j < second.length) {
        if (onFirst) {
            if (i < first.length && (j >= second.length || first[i].date <= second[j].date))
                out.push(first[i++]);
            else onFirst = false;
        } else if (j < second.length && (i >= first.length || second[j].date <= first[i].date))
            out.push(second[j++]);
        else onFirst = true;
    }
    return out;
}

/** The separator the file uses most often between entries: it is not uniform. */
function separator(text) {
    const lines = text.split("\n");
    const counts = new Map();
    for (let i = 1; i < lines.length; i++) {
        if (!HEADING.test(lines[i])) continue;
        let s = i;
        while (s > 0 && isSep(lines[s - 1])) s--;
        if (s === i) continue;
        const key = JSON.stringify(lines.slice(s, i));
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const best = [...counts].sort((x, y) => y[1] - x[1])[0];
    return best ? JSON.parse(best[0]) : ["", "---", ""];
}

if (process.argv[2] === "--install") install();
else merge(...process.argv.slice(2));
