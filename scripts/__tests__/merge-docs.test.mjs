import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import {
    appendFileSync,
    copyFileSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * The docs' merge driver, run the way git runs it. What is asserted is the
 * contract, which has stopped changing: two additions at one place are both
 * kept, in the log by date, and everything else is left as a conflict. The
 * second half is the one that matters, because a merge that says it is done
 * when it is not is silent — nothing downstream reads a design log for
 * missing entries.
 */
const driver = join(import.meta.dirname, "..", "merge-docs.mjs");

function merge(path, base, ours, theirs) {
    const dir = mkdtempSync(join(tmpdir(), "merge-docs-"));
    const [o, a, b] = ["base", "ours", "theirs"].map((n) => join(dir, n));
    writeFileSync(o, base);
    writeFileSync(a, ours);
    writeFileSync(b, theirs);
    let done = true;
    try {
        execFileSync("node", [driver, o, a, b, "7", path], { stdio: "pipe" });
    } catch {
        done = false;
    }
    const text = readFileSync(a, "utf8");
    return { done, text, markers: /^<{7}/m.test(text) };
}

const entry = (date, title, body = `${title}, in full.`) =>
    `\n---\n\n### ${date} · ${title} \`[build]\`\n\n${body}\n`;
const LOG = "# Design Log\n" + entry("2026-09-20", "Where it starts");
const CHARTER = "## 5\n\n- **Guideline one.** Text.\n\nRead this section.\n";
const withGuideline = (guideline) =>
    CHARTER.replace("Read this", `- **${guideline}** Text.\n\nRead this`);

describe("the docs' merge driver", () => {
    it("keeps both sides' log entries, oldest first, each side's run together", () => {
        const [m23, m24] = [entry("2026-09-23", "Main A"), entry("2026-09-24", "Main B")];
        const [b23, b24] = [entry("2026-09-23", "Branch A"), entry("2026-09-24", "Branch B")];
        const r = merge("docs/DESIGN-LOG.md", LOG, LOG + b23 + b24, LOG + m23 + m24);
        expect(r.done).toBe(true);
        // What landed first leads a shared day, and the branch is not cut in two.
        expect(r.text).toBe(LOG + m23 + b23 + b24 + m24);
    });

    it("keeps both sides' guidelines at the end of a list, theirs first", () => {
        const r = merge(
            "docs/CHARTER.md",
            CHARTER,
            withGuideline("Mine."),
            withGuideline("Theirs."),
        );
        expect(r.done).toBe(true);
        expect(r.text).toBe(
            "## 5\n\n- **Guideline one.** Text.\n\n- **Theirs.** Text.\n\n- **Mine.** Text.\n\nRead this section.\n",
        );
    });

    const conflicts = [
        {
            what: "a log entry both sides changed",
            path: "docs/DESIGN-LOG.md",
            base: LOG + entry("2026-09-21", "Old"),
            ours: LOG + entry("2026-09-21", "Old", "Amended here."),
            theirs: LOG + entry("2026-09-21", "Old", "Amended there."),
        },
        {
            // Kept whole or not at all: read as entries, the paragraph would be dropped.
            what: "a log addition with more in it than dated entries",
            path: "docs/DESIGN-LOG.md",
            base: LOG,
            ours: LOG + "\nA stray paragraph.\n" + entry("2026-09-23", "Branch"),
            theirs: LOG + entry("2026-09-24", "Main"),
        },
        {
            what: "one log heading written two ways",
            path: "docs/DESIGN-LOG.md",
            base: LOG,
            ours: LOG + entry("2026-09-24", "Same", "One way."),
            theirs: LOG + entry("2026-09-24", "Same", "Another way."),
        },
        {
            what: "a guideline both sides changed",
            path: "docs/CHARTER.md",
            base: CHARTER,
            ours: CHARTER.replace("Text.", "Mine."),
            theirs: CHARTER.replace("Text.", "Theirs."),
        },
        {
            what: "two additions that share a line",
            path: "docs/OPEN-QUESTIONS.md",
            base: CHARTER,
            ours: withGuideline("Mine.").replace("Read this", "## DECIDE\n\nRead this"),
            theirs: withGuideline("Theirs.").replace("Read this", "## DECIDE\n\nRead this"),
        },
        {
            // The markers come back with CRLF endings and are not read as markers,
            // so git's count and the driver's disagree and git's own merge stands.
            what: "a file with Windows line endings",
            path: "docs/DESIGN-LOG.md",
            base: LOG.replaceAll("\n", "\r\n"),
            ours: (LOG + entry("2026-09-23", "Ours")).replaceAll("\n", "\r\n"),
            theirs: (LOG + entry("2026-09-22", "Theirs")).replaceAll("\n", "\r\n"),
        },
    ];
    for (const c of conflicts)
        it(`leaves ${c.what} as a conflict`, () => {
            const r = merge(c.path, c.base, c.ours, c.theirs);
            expect(r.done, "claimed a merge it did not do").toBe(false);
            expect(r.markers, "a conflict with nothing to show where").toBe(true);
        });
});

/**
 * The wire: a repository whose main and branch each logged an entry, the driver
 * registered the way `npm install` registers it, and `git merge` run on it.
 */
function mergeInRepo({ withScript }) {
    const dir = mkdtempSync(join(tmpdir(), "merge-docs-repo-"));
    const env = Object.fromEntries(
        Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")),
    );
    const git = (...args) =>
        execFileSync("git", ["-c", "commit.gpgsign=false", ...args], {
            cwd: dir,
            env,
            stdio: "pipe",
        });
    const log = join(dir, "docs", "DESIGN-LOG.md");
    git("init", "-q", "-b", "main");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "test");
    mkdirSync(join(dir, "docs"));
    writeFileSync(join(dir, ".gitattributes"), "docs/DESIGN-LOG.md merge=docs\n");
    writeFileSync(log, LOG);
    if (withScript) {
        mkdirSync(join(dir, "scripts"));
        copyFileSync(driver, join(dir, "scripts", "merge-docs.mjs"));
    }
    git("add", "-A");
    git("commit", "-q", "-m", "base");
    git("checkout", "-q", "-b", "branch");
    appendFileSync(log, entry("2026-09-23", "Branch"));
    git("commit", "-q", "-am", "branch");
    git("checkout", "-q", "main");
    appendFileSync(log, entry("2026-09-22", "Main"));
    git("commit", "-q", "-am", "main");
    execFileSync("node", [driver, "--install"], { cwd: dir, env });
    let done = true;
    try {
        git("merge", "-q", "--no-edit", "branch");
    } catch {
        done = false;
    }
    const text = readFileSync(log, "utf8");
    return { done, text, markers: /^<{7}/m.test(text) };
}

describe("the docs' merge driver, as git runs it", () => {
    it("resolves a merge once it is registered", () => {
        const r = mergeInRepo({ withScript: true });
        expect(r.done).toBe(true);
        expect(r.text).toBe(LOG + entry("2026-09-22", "Main") + entry("2026-09-23", "Branch"));
    });

    it("hands the merge back to git when it cannot run at all", () => {
        // Registered, and the script is not there: git alone would keep our side,
        // without the branch's entry, and mark nothing.
        const r = mergeInRepo({ withScript: false });
        expect(r.done).toBe(false);
        expect(r.markers, "a conflict with nothing to show where").toBe(true);
        expect(r.text).toContain("Branch, in full.");
        expect(r.text).toContain("Main, in full.");
    });
});
