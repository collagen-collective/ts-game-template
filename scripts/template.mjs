#!/usr/bin/env node
/**
 * Keeps a project in step with the template it was made from, through Copier
 * (https://copier.readthedocs.io), which runs under uv or pipx and needs no
 * install of its own. README.md, under *Staying in step with the template*,
 * says how it fits together; this file is the mechanism.
 *
 *   node scripts/template.mjs link [<template-commit>]
 *   node scripts/template.mjs update [--to <ref>] [--lock-only] [--summary <file>]
 *
 * `link` is done once, in a project that has no `.copier-answers.yml` yet: one
 * made with GitHub's "Use this template" button, or one made before the
 * template could be updated from. It writes down which template commit the
 * project began from. Given none, it finds it: GitHub's button makes a first
 * commit whose tree is exactly the template's at that moment, so the template
 * commit whose tree differs least from the project's first commit is the one.
 *
 * `update` brings the project up to the template's main (or `--to <ref>`). It
 * is a three-way merge, file by file: what the template changed since the
 * project's recorded commit is applied over what the project changed since
 * then. Where both changed the same lines, the file is left with conflict
 * markers and marked unmerged, as after a `git merge`. The three documents
 * then get their own merge driver, as they do on a merge of main, which keeps
 * both sides' additions where that is all either side made. The lockfile is
 * the project's own and is never merged: `npm install` brings it into line
 * with whatever package.json now says (`--lock-only` touches only the
 * lockfile, for CI). `--summary` writes what came in, and what is left to
 * resolve, as Markdown, for the body of a pull request.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEMPLATE = "https://github.com/collagen-collective/ts-game-template.git";
const ANSWERS = ".copier-answers.yml";
const REF = "refs/template/main";
const COPIER = "copier>=9.4,<10";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const tryGit = (...args) => {
    try {
        return git(...args);
    } catch {
        return null;
    }
};
const die = (message) => {
    process.stderr.write(`template: ${message}\n`);
    process.exit(1);
};

/** The answers file's two fields, read without a YAML parser: Copier writes them one to a line. */
function readAnswers() {
    if (!existsSync(ANSWERS)) return null;
    const text = readFileSync(ANSWERS, "utf8");
    const field = (name) => text.match(new RegExp(`^${name}: *['"]?([^'"\\n]+)`, "m"))?.[1].trim();
    return { commit: field("_commit"), src: field("_src_path") };
}

/** The template's history, fetched under a ref of its own so nothing of the project's moves. */
function fetchTemplate(src) {
    const url = src.replace(/^gh:/, "https://github.com/");
    try {
        execFileSync("git", ["fetch", "--quiet", "--no-tags", url, `+HEAD:${REF}`], {
            stdio: ["ignore", "inherit", "inherit"],
        });
    } catch {
        die(`could not fetch the template from ${url}`);
    }
}

function link(args) {
    if (existsSync(ANSWERS)) die(`${ANSWERS} already exists: this project is linked`);
    const src = option(args, "--src") ?? TEMPLATE;
    let commit = args.find((a) => !a.startsWith("--") && a !== option(args, "--src"));
    fetchTemplate(src);
    if (commit) {
        commit =
            tryGit("rev-parse", "--verify", `${commit}^{commit}`) ?? die(`no commit ${commit}`);
    } else {
        commit = findOrigin();
    }
    writeFileSync(
        ANSWERS,
        [
            "# The template commit this project was last brought up to. `npm run template:update` reads and",
            "# rewrites it; `npm run template:link` writes it the first time. Not edited by hand.",
            `_commit: ${commit}`,
            `_src_path: ${src}`,
            "",
        ].join("\n"),
    );
    git("update-ref", "-d", REF);
    console.log(
        `Wrote ${ANSWERS}. Commit it, then \`npm run template:update\` brings the rest in.`,
    );
}

/** The template commit this project began from. */
function findOrigin() {
    // A project cloned rather than made from the button shares the template's history outright.
    const base = tryGit("merge-base", "HEAD", REF);
    if (base) {
        console.log(
            `This project shares the template's history; it began from ${base.slice(0, 7)}.`,
        );
        return base;
    }
    const roots = git("rev-list", "--max-parents=0", "HEAD").split("\n");
    const root = roots[roots.length - 1];
    let best = null;
    for (const candidate of git("rev-list", REF).split("\n")) {
        const stat = git("diff", "--shortstat", root, candidate);
        const lines = [...stat.matchAll(/(\d+) (?:insertion|deletion)/g)].reduce(
            (sum, m) => sum + Number(m[1]),
            0,
        );
        if (!best || lines < best.lines) best = { candidate, lines };
        if (lines === 0) break;
    }
    if (!best) die("the template has no commits to compare against");
    const subject = git("log", "-1", "--format=%h %s", best.candidate);
    if (best.lines === 0) {
        console.log(`The project's first commit is exactly the template at ${subject}.`);
    } else {
        console.log(
            `The closest template commit to the project's first commit is ${subject}, ${best.lines} ` +
                "lines apart. If you know which commit it was made from, pass it instead: " +
                "`npm run template:link -- <commit>`.",
        );
    }
    return best.candidate;
}

/** The first of uv, pipx or an installed copier that is there to run. */
function copierCommand() {
    const runs = (cmd) => spawnSync(cmd, ["--version"], { stdio: "ignore" }).status === 0;
    if (runs("uvx")) return ["uvx", "--from", COPIER, "copier"];
    if (runs("pipx")) return ["pipx", "run", "--spec", COPIER, "copier"];
    if (runs("copier")) return ["copier"];
    die("Copier runs under uv or pipx, and neither is installed: https://docs.astral.sh/uv/");
}

function update(args) {
    const before = readAnswers() ?? die(`no ${ANSWERS}: run \`npm run template:link\` first`);
    if (git("status", "--porcelain")) die("commit or stash your changes first");
    const to = option(args, "--to") ?? "HEAD";
    const [cmd, ...rest] = copierCommand();
    const run = spawnSync(
        cmd,
        [...rest, "update", "--defaults", "--conflict", "inline", "--vcs-ref", to],
        { stdio: "inherit" },
    );
    if (run.status !== 0) die("copier update failed; nothing above was committed");

    const after = readAnswers();
    const docs = resolveDocs();
    const conflicted = unmerged();
    // A package.json left with conflict markers is not JSON yet: npm waits for it to be resolved.
    const manifestChanged = tryGit("diff", "--quiet", "HEAD", "--", "package.json") === null;
    let lockFailed = false;
    if (manifestChanged && !conflicted.includes("package.json")) {
        const npm = ["install", ...(args.includes("--lock-only") ? ["--package-lock-only"] : [])];
        console.log(`package.json changed: npm ${npm.join(" ")}`);
        // Stdout to stderr: under --summary, CI reads only what this script writes to the file.
        lockFailed = spawnSync("npm", npm, { stdio: ["ignore", 2, 2] }).status !== 0;
    }

    fetchTemplate(before.src);
    const log =
        before.commit === after.commit
            ? ""
            : (tryGit(
                  "log",
                  "--reverse",
                  "--no-merges",
                  "--format=- %h %s",
                  `${before.commit}..${after.commit}`,
              ) ?? "");
    git("update-ref", "-d", REF);

    const changed = git("status", "--porcelain");
    const lines = [];
    if (!changed) lines.push(`Already up to date with the template at \`${after.commit}\`.`);
    else {
        lines.push(`Brings the template in from \`${before.commit}\` to \`${after.commit}\`.`, "");
        if (log) lines.push("## What came in", "", log, "");
        if (docs.length) {
            lines.push(
                "## Merged by the documents' driver",
                "",
                ...docs.map((f) => `- \`${f}\`: both sides only added`),
                "",
            );
        }
        lines.push("## Left to resolve", "");
        if (lockFailed) {
            lines.push(
                "`npm install` failed on the merged `package.json` (see the update's output, or the " +
                    "workflow's log), so `package-lock.json` is not yet in line with it.",
                "",
            );
        }
        if (conflicted.length) {
            lines.push(
                "Both the project and the template changed the same lines. Read both sides: " +
                    "the project's are under `before updating`, the template's under `after updating`.",
                "",
                ...conflicted.map((f) => `- \`${f}\``),
            );
            if (conflicted.includes("package.json")) {
                lines.push(
                    "",
                    "Once `package.json` is resolved, `npm install` brings the lockfile into line.",
                );
            }
        } else if (!lockFailed) lines.push("Nothing: every file merged.");
    }
    const summary = lines.join("\n");
    console.log(`\n${summary}`);
    const out = option(args, "--summary");
    if (out) writeFileSync(out, `${summary}\n`);
}

/**
 * Copier merges with `git merge-file`, which no merge driver reaches. It leaves
 * each conflicted file unmerged in the index, with the last template version,
 * the project's and the new template version as stages 1, 2 and 3, so the
 * documents' driver can be run over them exactly as git would run it.
 */
function resolveDocs() {
    const resolved = [];
    for (const path of unmerged()) {
        if (!/: merge: docs$/.test(git("check-attr", "merge", "--", path))) continue;
        const dir = mkdtempSync(join(tmpdir(), "template-docs-"));
        const [base, ours, theirs] = [1, 2, 3].map((stage) => {
            const file = join(dir, String(stage));
            try {
                // Not trimmed, unlike git() above: the driver compares these byte for byte.
                writeFileSync(file, execFileSync("git", ["show", `:${stage}:${path}`]));
            } catch {
                writeFileSync(file, ""); // No such stage: the file is new on one side.
            }
            return file;
        });
        const driver = spawnSync("node", ["scripts/merge-docs.mjs", base, ours, theirs, "7", path]);
        if (driver.status !== 0) continue; // A real collision: the markers copier left stay.
        writeFileSync(path, readFileSync(ours));
        git("add", "--", path);
        resolved.push(path);
    }
    return resolved;
}

function unmerged() {
    const out = git("diff", "--name-only", "--diff-filter=U");
    return out ? [...new Set(out.split("\n"))] : [];
}

function option(args, name) {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
}

const [command, ...args] = process.argv.slice(2);
if (command === "link") link(args);
else if (command === "update") update(args);
else
    die(
        "usage: template.mjs link [<commit>] | update [--to <ref>] [--lock-only] [--summary <file>]",
    );
