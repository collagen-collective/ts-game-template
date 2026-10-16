// @ts-check
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { folderOf, LIMITS, parseReport, Refused } from "./handler.mjs";

/**
 * The dev server's local feedback inbox. Reports use the Lambda's parser but
 * stay on disk, under FEEDBACK_INBOX or feedback-inbox/. Browser writes must
 * come from this exact origin; CORS alone cannot prevent a foreign form POST.
 * @returns {import("vite").Plugin}
 */
export function devInbox() {
    return {
        name: "feedback-dev-inbox",
        apply: "serve",
        configureServer(server) {
            const root =
                process.env["FEEDBACK_INBOX"] || join(server.config.root, "feedback-inbox");
            // Install after Vite's own Host checks, preserving its DNS-rebinding
            // protection as well as the loopback-only default listen address.
            return () =>
                server.middlewares.use("/__feedback", (req, res) => {
                    /** @type {Buffer[]} */
                    const chunks = [];
                    let bytes = 0;
                    let stopped = false;
                    const clear = () => {
                        stopped = true;
                        chunks.length = 0;
                        req.removeListener("data", receive);
                        req.removeListener("end", finish);
                    };
                    /** @param {number} status @param {object} body */
                    const answer = (status, body) => {
                        res.statusCode = status;
                        res.setHeader("content-type", "application/json");
                        res.end(JSON.stringify(body));
                    };
                    /** @param {number} status @param {string} error */
                    const refuse = (status, error) => {
                        clear();
                        // Stop receiving now, then close after the refusal has been
                        // flushed. An unfinished upload must not keep buffering or
                        // occupy a reusable connection after its budget is spent.
                        req.pause();
                        res.setHeader("connection", "close");
                        res.once("finish", () => req.destroy());
                        answer(status, { ok: false, error });
                    };
                    /** @param {Buffer} chunk */
                    function receive(chunk) {
                        bytes += chunk.length;
                        if (bytes > LIMITS.body) return refuse(413, "the report is too large");
                        chunks.push(chunk);
                    }
                    function finish() {
                        if (stopped) return;
                        const text = Buffer.concat(chunks, bytes).toString("utf8");
                        clear();
                        try {
                            const report = parseReport(text);
                            const base = folderOf(report.stamp, "dev", new Date());
                            let folder = base;
                            for (let n = 2; existsSync(join(root, folder)); n++)
                                folder = `${base}-${n}`;
                            mkdirSync(join(root, folder), { recursive: true });
                            for (const f of report.files)
                                writeFileSync(join(root, folder, f.name), f.bytes);
                            answer(200, { ok: true, folder });
                        } catch (e) {
                            answer(e instanceof Refused ? e.status : 500, {
                                ok: false,
                                error: e instanceof Error ? e.message : String(e),
                            });
                        }
                    }
                    req.once("aborted", clear);
                    req.once("error", () => {
                        clear();
                        res.destroy();
                    });
                    res.once("close", clear);
                    if (req.method !== "POST")
                        return refuse(405, "the inbox takes a report by POST");
                    const scheme = server.config.server.https ? "https" : "http";
                    const expected = `${scheme}://${req.headers.host}`;
                    if (!req.headers.host || req.headers.origin !== expected)
                        return refuse(403, "the dev inbox only accepts reports from this origin");
                    if (Number(req.headers["content-length"]) > LIMITS.body)
                        return refuse(413, "the report is too large");
                    req.on("data", receive);
                    req.on("end", finish);
                });
        },
    };
}
