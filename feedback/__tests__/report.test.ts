import { describe, expect, it } from "vitest";
import { parseReport } from "../handler.mjs";
import { KINDS, type Draft, reportFiles, reportMarkdown, stampOf } from "../page/report.ts";
import { Trace } from "../page/trace.ts";

const at = new Date(2026, 9, 6, 21, 31, 5);
const draft = (over: Partial<Draft> = {}): Draft => ({
    kind: KINDS[0]!,
    words: "It hit me\n\nthrough the wall",
    snapshot: {
        title: "The Bridge",
        parts: [
            {
                id: "where",
                label: "the bridge",
                lines: ["**Where:** the bridge, 4:12 in"],
                data: { x: 1 },
                file: { name: "trace.json", data: [{ t: 0 }] },
            },
            { id: "settings", label: "the settings", data: { volume: 0.5 } },
        ],
    },
    sent: { frame: true, where: true, settings: true },
    frame: { blob: new Blob(["jpeg"]), width: 1280, height: 720, hud: true },
    marks: [{ kind: "ring", x: 0.123456, y: 0.5, r: 0.05 }],
    marked: new Blob(["marked"]),
    build: "abc1234",
    at,
    ...over,
});

const decode = (files: Record<string, string>, name: string): string =>
    Buffer.from(files[name]!, "base64").toString("utf8");

describe("a report", () => {
    it("is what the feedback function takes, with its folder named for the sender's clock", async () => {
        const files = await reportFiles(draft());
        const report = parseReport(JSON.stringify({ key: "k", stamp: stampOf(at), files }));
        expect(report.stamp).toBe("2026-10-06_213105");
        expect(report.files.map((f) => f.name).sort()).toEqual([
            "frame.jpg",
            "marked.jpg",
            "report.md",
            "state.json",
            "trace.json",
        ]);
    });

    it("quotes the words as written, and gives each part sent its lines and its data", async () => {
        const files = await reportFiles(draft());
        const md = decode(files, "report.md");
        expect(md).toContain("# Something went wrong · The Bridge");
        expect(md).toContain("> It hit me\n>\n> through the wall");
        expect(md).toContain("![The frame, as marked](marked.jpg)");
        expect(md).toContain("- **Where:** the bridge, 4:12 in");
        const state = JSON.parse(decode(files, "state.json"));
        expect(state.words).toBe("It hit me\n\nthrough the wall");
        expect(state.where).toEqual({ x: 1 });
        expect(state.settings).toEqual({ volume: 0.5 });
        expect(state.frame.marks[0].x).toBe(0.1235);
        expect(JSON.parse(decode(files, "trace.json"))).toEqual([{ t: 0 }]);
    });

    it("leaves out whatever the player left out", async () => {
        const files = await reportFiles(
            draft({ sent: { frame: false, where: false, settings: true } }),
        );
        expect(Object.keys(files).sort()).toEqual(["report.md", "state.json"]);
        const state = JSON.parse(decode(files, "state.json"));
        expect(state.frame).toBe(null);
        expect(state.where).toBeUndefined();
        expect(state.settings).toEqual({ volume: 0.5 });
        expect(decode(files, "report.md")).not.toContain("Where:");
    });

    it("says so when nothing was written, and names no kind when none was chosen", () => {
        const md = reportMarkdown(draft({ words: "  \n", kind: null }));
        expect(md).toContain("# Feedback · The Bridge");
        expect(md).toContain("*Nothing written.*");
    });
});

describe("the trace", () => {
    it("samples as often as it is told, and keeps only the last seconds", () => {
        const trace = new Trace<number>(1, 0.1);
        let calls = 0;
        for (let i = 0; i <= 300; i++)
            trace.offer(i / 60, () => {
                calls++;
                return i;
            });
        const all = trace.all();
        expect(calls).toBeGreaterThanOrEqual(45);
        expect(calls).toBeLessThanOrEqual(51);
        expect(all.at(-1)!.t - all[0]!.t).toBeLessThanOrEqual(1);
        expect(all.length).toBeGreaterThanOrEqual(9);
    });
});
