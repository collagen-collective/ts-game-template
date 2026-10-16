import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, resolveConfig } from "vite";
import { LIMITS } from "../handler.mjs";

const project = new URL("../..", import.meta.url).pathname;
const root = mkdtempSync(join(tmpdir(), "feedback-dev-inbox-test-"));
const inbox = join(root, "inbox");
const report = JSON.stringify({
    stamp: "2026-10-06_213105",
    files: { "report.md": Buffer.from("# A local report\n").toString("base64") },
});
let server;
let origin;
let previousInbox;

const folders = () => {
    try {
        return readdirSync(inbox).sort();
    } catch (e) {
        if (e.code === "ENOENT") return [];
        throw e;
    }
};

// Leave the upload unfinished. Returning null is an observed lack of an early
// refusal, so a regression fails on its status assertion, not a test timeout.
function unfinished(headers, chunk) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const req = request(`${origin}/__feedback`, { method: "POST", headers }, (res) => {
            let body = "";
            res.setEncoding("utf8");
            res.on("data", (part) => (body += part));
            res.on("end", () => finish({ status: res.statusCode, body }));
            res.on("error", fail);
        });
        const timer = setTimeout(() => finish({ status: null, body: "" }), 1000);
        function finish(value) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            req.destroy();
            resolve(value);
        }
        function fail(error) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            req.destroy();
            reject(error);
        }
        req.on("error", fail);
        req.flushHeaders();
        if (chunk) req.write(chunk);
    });
}

beforeAll(async () => {
    previousInbox = process.env["FEEDBACK_INBOX"];
    process.env["FEEDBACK_INBOX"] = inbox;
    server = await createServer({
        configFile: join(project, "vite.config.ts"),
        root: project,
        server: { host: "127.0.0.1", port: 0, watch: null },
        logLevel: "error",
    });
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
});

afterAll(async () => {
    await server?.close();
    if (previousInbox === undefined) delete process.env["FEEDBACK_INBOX"];
    else process.env["FEEDBACK_INBOX"] = previousInbox;
    rmSync(root, { recursive: true, force: true });
});

describe("the real Vite feedback endpoint", () => {
    it("keeps the plugin out of production builds", async () => {
        const config = await resolveConfig(
            {
                configFile: join(project, "vite.config.ts"),
                root: project,
                logLevel: "error",
            },
            "build",
        );
        expect(config.plugins.some((plugin) => plugin.name === "feedback-dev-inbox")).toBe(false);
    });

    it("rejects foreign, null, and absent Origin before an unfinished body arrives", async () => {
        const before = folders();
        for (const given of ["https://another.example", "null", undefined]) {
            const r = await unfinished({
                ...(given ? { origin: given } : {}),
                "content-type": "text/plain",
                "content-length": Buffer.byteLength(report),
            });
            expect(r.status, `unfinished request with Origin ${given}`).toBe(403);
        }
        expect(folders()).toEqual(before);
    });

    it("preserves Vite's refusal of unapproved Host names", async () => {
        const before = folders();
        const r = await unfinished({
            host: "attacker.example",
            origin: "http://attacker.example",
            "content-length": Buffer.byteLength(report),
        });
        expect(r.status, "a matching attacker Origin and unapproved Host").toBe(403);
        expect(folders()).toEqual(before);
    });

    it("rejects a declared oversized body before any bytes arrive", async () => {
        const before = folders();
        const r = await unfinished({
            origin,
            "content-length": LIMITS.body + 1,
            "content-type": "text/plain",
        });
        expect(r.status, "oversized Content-Length with an unfinished request").toBe(413);
        expect(JSON.parse(r.body).ok).toBe(false);
        expect(folders()).toEqual(before);
    });

    it("rejects a chunked upload as soon as it crosses the byte limit, before end", async () => {
        const before = folders();
        const r = await unfinished(
            { origin, "content-type": "text/plain", "transfer-encoding": "chunked" },
            Buffer.alloc(LIMITS.body + 1, " "),
        );
        expect(r.status, "oversized chunked upload left unfinished").toBe(413);
        expect(JSON.parse(r.body).ok).toBe(false);
        expect(folders()).toEqual(before);
    });

    it("keeps the shared parser's JSON, filenames, file count and base64 checks", async () => {
        const before = folders();
        const b64 = Buffer.from("x").toString("base64");
        for (const body of [
            "not JSON",
            JSON.stringify({ files: { "../report.md": b64 } }),
            JSON.stringify({ files: { "report.md": "not base64!" } }),
            JSON.stringify({ files: { "frame.jpg": b64 } }),
            JSON.stringify({
                files: {
                    "report.md": b64,
                    ...Object.fromEntries(
                        Array.from({ length: LIMITS.files }, (_, i) => [`f${i}.txt`, b64]),
                    ),
                },
            }),
        ]) {
            const r = await fetch(`${origin}/__feedback`, {
                method: "POST",
                headers: { origin, "content-type": "text/plain" },
                body,
            });
            expect(r.status, body).toBe(400);
        }
        expect(folders()).toEqual(before);
    });

    it("still writes small same-origin reports and keeps same-stamp reports separate", async () => {
        const before = new Set(folders());
        const written = [];
        for (let n = 0; n < 2; n++) {
            const r = await fetch(`${origin}/__feedback`, {
                method: "POST",
                headers: { origin, "content-type": "text/plain" },
                body: report,
            });
            expect(r.status).toBe(200);
            const answer = await r.json();
            expect(answer.ok).toBe(true);
            expect(before.has(answer.folder)).toBe(false);
            expect(readFileSync(join(inbox, answer.folder, "report.md"), "utf8")).toBe(
                "# A local report\n",
            );
            written.push(answer.folder);
        }
        expect(new Set(written).size).toBe(2);
    });
});
