import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { folderOf, parseReport, Refused } from "./feedback/handler.mjs";

/**
 * The dev server's feedback inbox. `npm run dev`, and the end-to-end suite's
 * server, take a report at `/__feedback` and write it to `feedback-inbox/`, a
 * folder for each, read as the feedback function reads them
 * (`feedback/handler.mjs`) and sent nowhere. So a game's feedback page can be
 * played and tested before the function exists, and nothing a session tries
 * reaches the real inbox. A page tells the two apart by `import.meta.env.DEV`
 * (README, *Feedback from inside the game*).
 */
function devInbox(): Plugin {
    return {
        name: "feedback-dev-inbox",
        apply: "serve",
        configureServer(server) {
            const root = join(server.config.root, "feedback-inbox");
            server.middlewares.use("/__feedback", (req, res) => {
                const answer = (status: number, body: object): void => {
                    res.statusCode = status;
                    res.setHeader("content-type", "application/json");
                    res.end(JSON.stringify(body));
                };
                if (req.method !== "POST")
                    return answer(405, { ok: false, error: "the inbox takes a report by POST" });
                const chunks: Buffer[] = [];
                req.on("data", (c: Buffer) => chunks.push(c));
                req.on("end", () => {
                    try {
                        const report = parseReport(Buffer.concat(chunks).toString("utf8"));
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
                });
            });
        },
    };
}

export default defineConfig({
    plugins: [devInbox()],
    server: {
        port: 3000,
        // The end-to-end suite's server watches nothing: playwright.config.ts
        // sets E2E_SERVER, and `npm run dev` does not. A server that watches
        // reloads every page it serves when a file it serves changes. One that
        // does not reloads nothing, and serves each module as it was when it
        // was first asked for, so a run tests the code as it stood when it began.
        watch: process.env["E2E_SERVER"] ? null : undefined,
    },
});
