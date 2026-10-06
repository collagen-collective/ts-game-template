// @ts-check
/**
 * The feedback inbox's door: an AWS Lambda function, reached at its function
 * URL, that takes a report from the game and commits it to the inbox
 * repository as one folder, `inbox/<when>_<who>/`. The game makes the report
 * (README, *Feedback from inside the game*, says what it sends); this checks it
 * and writes it, and nothing else, so that what changes is in the game and this
 * file seldom changes. `infra/` deploys it. It needs nothing but Node 22's own `fetch`
 * and `crypto`, and, when its settings are in a secret, the AWS SDK that
 * Lambda's runtime already carries.
 *
 * It holds the GitHub token, which a page must never hold, and takes a report
 * only with a key it knows: each player's link carries theirs (`?key=`), and
 * the key names whose words a report holds. A password on the hosted site does
 * not reach here, this being another address.
 *
 * The dev server's inbox (`vite.config.ts`) reads reports with the same
 * `parseReport` and `folderOf`, and writes them to a folder on disk instead.
 *
 * Its settings, in the function's environment:
 * - `GITHUB_TOKEN`: a fine-grained token that can write to the inbox repository's contents, and
 *   nothing else;
 * - `INBOX_REPO`: `owner/name` of the inbox repository;
 * - `INBOX_BRANCH`: its branch, `main` if unset;
 * - `KEYS`: who holds which key, `name:key` pairs separated by commas (`tester:3f9c…`);
 * - `FEEDBACK_SECRET`: or, instead of `GITHUB_TOKEN` and `KEYS`, the name or ARN of a Secrets
 *   Manager secret holding both as JSON, `{"GITHUB_TOKEN": "…", "KEYS": "…"}`. The function
 *   that `infra/` deploys is set up this way, and reads the secret again every few minutes, so a
 *   key changed there (`npm run secret` in `infra/`) needs no deploy.
 */
import { timingSafeEqual } from "node:crypto";

export const LIMITS = {
    /**
     * A report's largest size, in bytes. A function URL takes 6 MB; a report at
     * 1280×720 (a frame, a marked copy, the state and a trace) was about half a
     * megabyte in Extra Sapien, and its first live one 1.1 MB.
     */
    body: 5_000_000,
    /** How many files a report may hold. */
    files: 6,
    /** What a file may be called: `report.md`, `frame.jpg` and the like, a name and never a path. */
    name: /^[a-z0-9][a-z0-9-]{0,40}\.(md|json|jpg|png|webp|txt)$/,
};

/** A report turned away, with the status the game is answered with and why, in words. */
export class Refused extends Error {
    /** @param {number} status @param {string} message */
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

/** The sender's own clock, to the second: `2026-10-06_213105`. */
const STAMP = /^\d{4}-\d{2}-\d{2}_\d{6}$/;

/**
 * @typedef {{ name: string, bytes: Buffer }} ReportFile
 * @typedef {{ key: string | null, stamp: string | null, files: ReportFile[] }} Report
 */

/**
 * A report's body, checked: JSON with `files` (name to base64), and the `key`
 * and `stamp` it was sent with. Throws `Refused` for anything else.
 * @param {string} text
 * @returns {Report}
 */
export function parseReport(text) {
    if (Buffer.byteLength(text) > LIMITS.body) throw new Refused(413, "the report is too large");
    /** @type {unknown} */
    let body;
    try {
        body = JSON.parse(text);
    } catch {
        throw new Refused(400, "the report is not JSON");
    }
    if (!body || typeof body !== "object") throw new Refused(400, "the report is not an object");
    const b = /** @type {Record<string, unknown>} */ (body);
    const given = b["files"];
    if (!given || typeof given !== "object") throw new Refused(400, "the report has no files");
    const entries = Object.entries(given);
    if (entries.length === 0 || entries.length > LIMITS.files)
        throw new Refused(400, `a report holds 1 to ${LIMITS.files} files`);
    const files = entries.map(([name, data]) => {
        if (!LIMITS.name.test(name))
            throw new Refused(400, `a file may not be called ${JSON.stringify(name.slice(0, 60))}`);
        if (typeof data !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(data))
            throw new Refused(400, `${name} is not base64`);
        return { name, bytes: Buffer.from(data, "base64") };
    });
    if (!files.some((f) => f.name === "report.md"))
        throw new Refused(400, "a report needs its report.md");
    return {
        key: typeof b["key"] === "string" ? b["key"] : null,
        stamp: typeof b["stamp"] === "string" && STAMP.test(b["stamp"]) ? b["stamp"] : null,
        files,
    };
}

/**
 * The report's folder: the sender's time, which sorts by when, and who sent
 * it. A missing or odd stamp takes the time here, in UTC.
 * @param {string | null} stamp
 * @param {string} who
 * @param {Date} now
 */
export function folderOf(stamp, who, now) {
    const when =
        stamp ?? now.toISOString().replace(/:/g, "").replace(/\..*$/, "").replace("T", "_");
    const name = who.toLowerCase().replace(/[^a-z0-9-]/g, "") || "someone";
    return `${when}_${name}`;
}

/**
 * Who holds `key`, of the `name:key` pairs in `keys`, or null. Compared in
 * constant time, so that a key cannot be found a character at a time.
 * @param {string | null} key
 * @param {string} keys
 * @returns {string | null}
 */
export function whoHolds(key, keys) {
    if (!key) return null;
    const given = Buffer.from(key);
    for (const pair of keys.split(",")) {
        const i = pair.indexOf(":");
        if (i < 1) continue;
        const want = Buffer.from(pair.slice(i + 1).trim());
        if (want.length > 0 && want.length === given.length && timingSafeEqual(want, given))
            return pair.slice(0, i).trim();
    }
    return null;
}

/** How long the secret's token and keys are kept before it is read again, in ms. */
export const SECRET_TTL = 5 * 60_000;

/** @type {Map<string, { at: number, token: string, keys: string }>} */
const secrets = new Map();

/**
 * The token and the keys: from the secret `FEEDBACK_SECRET` names when it
 * names one, kept for `SECRET_TTL`, and otherwise from the environment.
 * @param {Record<string, string | undefined>} env
 * @param {(id: string) => Promise<string>} read the secret's text
 * @param {number} now
 * @returns {Promise<{ token: string, keys: string }>}
 */
export async function settings(env, read, now) {
    const id = env["FEEDBACK_SECRET"];
    if (!id) return { token: env["GITHUB_TOKEN"] ?? "", keys: env["KEYS"] ?? "" };
    const kept = secrets.get(id);
    if (kept && now - kept.at < SECRET_TTL) return kept;
    /** @type {unknown} */
    let value;
    try {
        value = JSON.parse(await read(id));
    } catch (e) {
        throw new Refused(500, `the inbox's secret could not be read: ${String(e)}`);
    }
    const v = /** @type {Record<string, unknown>} */ (value ?? {});
    const got = {
        at: now,
        token: typeof v["GITHUB_TOKEN"] === "string" ? v["GITHUB_TOKEN"] : "",
        keys: typeof v["KEYS"] === "string" ? v["KEYS"] : "",
    };
    secrets.set(id, got);
    return got;
}

/**
 * A secret's text, through the AWS SDK that Lambda's Node runtime carries.
 * Named by a variable so that nothing else that imports this file (the dev
 * server, the tests) looks for the SDK.
 * @param {string} id
 * @returns {Promise<string>}
 */
async function readSecret(id) {
    const sdk = "@aws-sdk/client-secrets-manager";
    const { SecretsManagerClient, GetSecretValueCommand } = await import(sdk);
    const r = await new SecretsManagerClient({}).send(new GetSecretValueCommand({ SecretId: id }));
    return r.SecretString ?? "";
}

/**
 * The report as one commit on the inbox's branch, through GitHub's Git Data
 * API: a blob for each file, a tree with them under `inbox/<folder>/`, the
 * commit, and the branch moved to it. The repository needs a first commit (a
 * README) for its branch to exist.
 * @param {{ repo: string, branch: string, token: string, folder: string,
 *           files: ReportFile[], message: string, fetch?: typeof fetch }} o
 * @returns {Promise<string>} the commit's sha
 */
export async function commit(o) {
    const f = o.fetch ?? fetch;
    /** @param {string} path @param {RequestInit} [init] */
    const api = async (path, init) => {
        const r = await f(`https://api.github.com/repos/${o.repo}${path}`, {
            ...init,
            headers: {
                authorization: `Bearer ${o.token}`,
                accept: "application/vnd.github+json",
                "content-type": "application/json",
                "user-agent": "game-feedback",
                "x-github-api-version": "2022-11-28",
            },
        });
        const json = await r.json().catch(() => ({}));
        if (!r.ok)
            throw new Refused(502, `GitHub answered ${r.status} to ${path}: ${json.message ?? ""}`);
        return json;
    };
    const ref = await api(`/git/ref/heads/${o.branch}`);
    const parent = ref.object.sha;
    const base = await api(`/git/commits/${parent}`);
    const tree = [];
    for (const file of o.files) {
        const blob = await api("/git/blobs", {
            method: "POST",
            body: JSON.stringify({ content: file.bytes.toString("base64"), encoding: "base64" }),
        });
        tree.push({
            path: `inbox/${o.folder}/${file.name}`,
            mode: "100644",
            type: "blob",
            sha: blob.sha,
        });
    }
    const made = await api("/git/trees", {
        method: "POST",
        body: JSON.stringify({ base_tree: base.tree.sha, tree }),
    });
    const c = await api("/git/commits", {
        method: "POST",
        body: JSON.stringify({ message: o.message, tree: made.sha, parents: [parent] }),
    });
    await api(`/git/refs/heads/${o.branch}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: c.sha }),
    });
    return c.sha;
}

/**
 * The function URL's handler. Answers JSON: `{ ok: true, folder }`, or
 * `{ ok: false, error }` with what was wrong in words, which the game shows.
 * @param {{ requestContext?: { http?: { method?: string } }, body?: string, isBase64Encoded?: boolean }} event
 * @param {{ env?: Record<string, string | undefined>, fetch?: typeof fetch, now?: Date,
 *           readSecret?: (id: string) => Promise<string> }} [given] for tests
 */
export async function handler(event, given = {}) {
    const env = given.env ?? process.env;
    /** @param {number} status @param {object} body */
    const answer = (status, body) => ({
        statusCode: status,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });
    try {
        if (event.requestContext?.http?.method !== "POST")
            return answer(405, { ok: false, error: "the inbox takes a report by POST" });
        const text = event.isBase64Encoded
            ? Buffer.from(event.body ?? "", "base64").toString("utf8")
            : (event.body ?? "");
        const report = parseReport(text);
        const now = given.now ?? new Date();
        const { token, keys } = await settings(env, given.readSecret ?? readSecret, now.getTime());
        const who = whoHolds(report.key, keys);
        if (!who)
            return answer(403, { ok: false, error: "the inbox does not know this link's key" });
        const folder = folderOf(report.stamp, who, now);
        const o = {
            repo: env["INBOX_REPO"] ?? "",
            branch: env["INBOX_BRANCH"] || "main",
            token,
            folder,
            files: report.files,
            message: `Feedback from ${who}: ${folder}`,
            ...(given.fetch ? { fetch: given.fetch } : {}),
        };
        try {
            await commit(o);
        } catch (e) {
            // Another report moved the branch between reading it and moving it: once more.
            if (!(e instanceof Refused && /answered 422 to \/git\/refs/.test(e.message))) throw e;
            await commit(o);
        }
        return answer(200, { ok: true, folder });
    } catch (e) {
        if (e instanceof Refused) {
            if (e.status >= 500) console.error(e.message);
            return answer(e.status, { ok: false, error: e.message });
        }
        console.error(e);
        return answer(500, { ok: false, error: "the inbox could not take it" });
    }
}
