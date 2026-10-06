import { describe, expect, it } from "vitest";
import {
    folderOf,
    handler,
    LIMITS,
    parseReport,
    SECRET_TTL,
    settings,
    whoHolds,
} from "../handler.mjs";

/**
 * The feedback function against a GitHub of its own: a branch, commits, trees
 * and blobs, kept as GitHub keeps them, so that what is asserted is where a
 * report ends up, not the order of the calls that put it there.
 */
function github({ movesOnce = false } = {}) {
    const blobs = new Map();
    const trees = new Map([["t0", { base: null, entries: [{ path: "README.md", sha: "b0" }] }]]);
    const commits = new Map([
        ["c0", { tree: "t0", parents: [] }],
        ["c-other", { tree: "t0", parents: ["c0"] }],
    ]);
    let head = "c0";
    let moves = movesOnce ? 1 : 0;
    let n = 0;
    const calls = [];
    const answer = (status, json) => new Response(JSON.stringify(json), { status });
    /** @type {typeof fetch} */
    const fetch = async (url, init = {}) => {
        const path = String(url).replace("https://api.github.com/repos/o/inbox", "");
        const method = init.method ?? "GET";
        calls.push(`${method} ${path}`);
        if (init.headers?.authorization !== "Bearer t0k3n")
            return answer(401, { message: "Bad credentials" });
        const body = init.body ? JSON.parse(String(init.body)) : null;
        if (method === "GET" && path === "/git/ref/heads/main")
            return answer(200, { object: { sha: head } });
        if (method === "GET" && path.startsWith("/git/commits/")) {
            const sha = path.slice("/git/commits/".length);
            return answer(200, { sha, tree: { sha: commits.get(sha).tree } });
        }
        if (method === "POST" && path === "/git/blobs") {
            const sha = `b${++n}`;
            blobs.set(sha, Buffer.from(body.content, body.encoding));
            return answer(201, { sha });
        }
        if (method === "POST" && path === "/git/trees") {
            const sha = `t${++n}`;
            trees.set(sha, { base: body.base_tree, entries: body.tree });
            return answer(201, { sha, tree: body.tree });
        }
        if (method === "POST" && path === "/git/commits") {
            const sha = `c${++n}`;
            commits.set(sha, { tree: body.tree, parents: body.parents, message: body.message });
            return answer(201, { sha });
        }
        if (method === "PATCH" && path === "/git/refs/heads/main") {
            // Another report's commit lands first, once, if asked.
            if (moves > 0) {
                moves--;
                head = "c-other";
                return answer(422, { message: "Update is not a fast forward" });
            }
            head = body.sha;
            return answer(200, { object: { sha: head } });
        }
        return answer(404, { message: "Not Found" });
    };
    /** Every file on the branch's head, by path, as bytes. */
    const files = () => {
        const out = new Map();
        const walk = (sha) => {
            const t = trees.get(sha);
            if (t.base) walk(t.base);
            for (const e of t.entries) out.set(e.path, blobs.get(e.sha) ?? Buffer.from(""));
        };
        walk(commits.get(head).tree);
        return out;
    };
    return { fetch, calls, files, head: () => head, commits };
}

const env = {
    KEYS: "tester:k3y-k3y-k3y,person:an0ther",
    INBOX_REPO: "o/inbox",
    GITHUB_TOKEN: "t0k3n",
};
const b64 = (s) => Buffer.from(s).toString("base64");
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
const report = (over = {}) => ({
    key: "k3y-k3y-k3y",
    stamp: "2026-10-06_213105",
    files: {
        "report.md": b64("# The bridge\n\n> it hit me"),
        "frame.jpg": jpeg.toString("base64"),
        "state.json": b64("{}"),
    },
    ...over,
});
const post = (body, gh, now = new Date("2026-10-07T04:31:05Z")) =>
    handler(
        {
            requestContext: { http: { method: "POST" } },
            body: typeof body === "string" ? body : JSON.stringify(body),
        },
        { env, fetch: gh.fetch, now },
    );
const read = (r) => ({ status: r.statusCode, ...JSON.parse(r.body) });

describe("the feedback function", () => {
    it("lands a report with a known key as one commit, its files under inbox/<when>_<who>/", async () => {
        const gh = github();
        const r = read(await post(report(), gh));
        expect(r).toEqual({ status: 200, ok: true, folder: "2026-10-06_213105_tester" });
        const head = gh.commits.get(gh.head());
        expect(head.parents).toEqual(["c0"]);
        expect(head.message).toBe("Feedback from tester: 2026-10-06_213105_tester");
        const files = gh.files();
        expect([...files.keys()].sort()).toEqual([
            "README.md",
            "inbox/2026-10-06_213105_tester/frame.jpg",
            "inbox/2026-10-06_213105_tester/report.md",
            "inbox/2026-10-06_213105_tester/state.json",
        ]);
        expect(files.get("inbox/2026-10-06_213105_tester/frame.jpg").equals(jpeg)).toBe(true);
        expect(files.get("inbox/2026-10-06_213105_tester/report.md").toString()).toBe(
            "# The bridge\n\n> it hit me",
        );
    });

    it("turns away a key it does not know, or none, and never asks GitHub", async () => {
        for (const key of ["k3y-k3y-k3z", "k3y", "", undefined]) {
            const gh = github();
            const r = read(await post(report({ key }), gh));
            expect(r.status, `key ${key}`).toBe(403);
            expect(gh.calls).toEqual([]);
        }
    });

    it("turns away a file name that is a path, or not a report's kind of file", async () => {
        for (const name of [
            "../report.md",
            "inbox/x.md",
            "a/b.json",
            "Report.md",
            "run.exe",
            ".md",
            "x.md.sh",
        ]) {
            const gh = github();
            const r = read(
                await post(report({ files: { "report.md": b64("x"), [name]: b64("x") } }), gh),
            );
            expect(r.status, name).toBe(400);
            expect(gh.calls).toEqual([]);
        }
    });

    it("turns away what is not a report: no report.md, not base64, too many files, too large, not JSON", async () => {
        const many = Object.fromEntries(
            Array.from({ length: LIMITS.files + 1 }, (_, i) => [`f${i}.txt`, b64("x")]),
        );
        const cases = [
            [report({ files: { "frame.jpg": b64("x") } }), 400],
            [report({ files: { "report.md": "not base64!" } }), 400],
            [report({ files: { ...many, "report.md": b64("x") } }), 400],
            [report({ files: { "report.md": "A".repeat(LIMITS.body) } }), 413],
            ["{ not json", 400],
        ];
        for (const [body, status] of cases) {
            const gh = github();
            expect(read(await post(body, gh)).status).toBe(status);
            expect(gh.calls).toEqual([]);
        }
    });

    it("reads the branch again when another report moved it between reading and writing", async () => {
        const gh = github({ movesOnce: true });
        const r = read(await post(report(), gh));
        expect(r.status).toBe(200);
        expect(gh.commits.get(gh.head()).parents).toEqual(["c-other"]);
        expect(gh.files().has("inbox/2026-10-06_213105_tester/report.md")).toBe(true);
    });

    it("takes a report only by POST", async () => {
        const gh = github();
        const r = await handler(
            { requestContext: { http: { method: "GET" } } },
            { env, fetch: gh.fetch },
        );
        expect(r.statusCode).toBe(405);
    });
});

describe("the token and the keys, from a secret", () => {
    const stored = JSON.stringify({ GITHUB_TOKEN: "t0k3n", KEYS: "tester:k3y-k3y-k3y" });
    const sent = (gh, readSecret, id) =>
        handler(
            { requestContext: { http: { method: "POST" } }, body: JSON.stringify(report()) },
            {
                env: { INBOX_REPO: "o/inbox", FEEDBACK_SECRET: id },
                fetch: gh.fetch,
                readSecret,
                now: new Date("2026-10-07T04:31:05Z"),
            },
        );

    it("lands a report with the token and the keys the secret holds, and nothing in the environment", async () => {
        const gh = github();
        const asked = [];
        const r = read(await sent(gh, async (id) => (asked.push(id), stored), "secret-a"));
        expect(r).toEqual({ status: 200, ok: true, folder: "2026-10-06_213105_tester" });
        expect(asked).toEqual(["secret-a"]);
    });

    it("reads the secret again only once it has been kept for SECRET_TTL, so a changed key needs no deploy", async () => {
        let text = stored;
        let reads = 0;
        const reader = async () => (reads++, text);
        expect((await settings({ FEEDBACK_SECRET: "secret-b" }, reader, 0)).keys).toBe(
            "tester:k3y-k3y-k3y",
        );
        text = JSON.stringify({ GITHUB_TOKEN: "t0k3n", KEYS: "tester:n3w" });
        expect((await settings({ FEEDBACK_SECRET: "secret-b" }, reader, SECRET_TTL - 1)).keys).toBe(
            "tester:k3y-k3y-k3y",
        );
        expect((await settings({ FEEDBACK_SECRET: "secret-b" }, reader, SECRET_TTL)).keys).toBe(
            "tester:n3w",
        );
        expect(reads).toBe(2);
    });

    it("says so when the secret cannot be read, and asks GitHub nothing", async () => {
        for (const reader of [
            async () => "not json",
            async () => {
                throw new Error("AccessDeniedException");
            },
        ]) {
            const gh = github();
            const r = read(await sent(gh, reader, `secret-${Math.random()}`));
            expect(r.status).toBe(500);
            expect(r.error).toMatch(/^the inbox's secret could not be read/);
            expect(gh.calls).toEqual([]);
        }
    });

    it("turns away every key while the secret holds none yet", async () => {
        const gh = github();
        const empty = JSON.stringify({ GITHUB_TOKEN: "", KEYS: "" });
        const r = read(await sent(gh, async () => empty, "secret-c"));
        expect(r.status).toBe(403);
        expect(gh.calls).toEqual([]);
    });
});

describe("a report's folder and its sender", () => {
    it("is named for the sender's clock, or the time here when that is missing or odd", () => {
        const now = new Date("2026-10-07T04:31:05.250Z");
        expect(folderOf("2026-10-06_213105", "tester", now)).toBe("2026-10-06_213105_tester");
        expect(parseReport(JSON.stringify(report({ stamp: "06/10/2026 21:31" }))).stamp).toBe(null);
        expect(folderOf(null, "tester", now)).toBe("2026-10-07_043105_tester");
        expect(folderOf(null, "Tester's/../x", now)).toBe("2026-10-07_043105_testersx");
    });

    it("knows a key only whole, from name:key pairs", () => {
        expect(whoHolds("k3y-k3y-k3y", env.KEYS)).toBe("tester");
        expect(whoHolds("an0ther", env.KEYS)).toBe("person");
        expect(whoHolds("an0the", env.KEYS)).toBe(null);
        expect(whoHolds("tester", env.KEYS)).toBe(null);
        expect(whoHolds("x", "nocolon,:x")).toBe(null);
        expect(whoHolds(null, env.KEYS)).toBe(null);
    });
});
