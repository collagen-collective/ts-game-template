/**
 * What a report holds, as files: `report.md` (the player's words as written,
 * the frame, and a line for each part sent), `state.json` (all of it as
 * data), `frame.jpg`, `marked.jpg` if they marked it, and a file for each part
 * that has one. The handler takes six files at most (`LIMITS`,
 * `feedback/handler.mjs`), so a snapshot's parts may add two.
 */
import type { Frame } from "./capture.ts";
import { type Mark, markData } from "./marks.ts";

/** What it might be. None is required, and none is chosen to begin with. */
export interface Kind {
    id: string;
    /** On the page. */
    label: string;
    /** At the head of `report.md`. */
    title: string;
}

export const KINDS: readonly Kind[] = [
    { id: "wrong", label: "SOMETHING WENT WRONG", title: "Something went wrong" },
    { id: "idea", label: "AN IDEA", title: "An idea" },
    { id: "right", label: "THIS FELT RIGHT", title: "This felt right" },
    { id: "else", label: "SOMETHING ELSE", title: "Something else" },
];

/**
 * Something the game sends with the words, which the player can leave out:
 * where they were, the last ten seconds, the settings. Each is a line on the
 * page, and in the report as they chose.
 */
export interface Part {
    /** Its key in `state.json`: lower-case letters, digits and dashes. */
    id: string;
    /** What the page says goes with the words: "the bridge, 4:12 into the run". */
    label: string;
    /** Lines for `report.md`, each a bullet: "**Where:** the bridge, 4:12 into the run". */
    lines?: readonly string[];
    /** Plain data, kept in `state.json` under `id`. */
    data?: unknown;
    /** A file of its own: `trace.json`, say. Data that is not text is written as JSON. */
    file?: { name: string; data: string | Blob | unknown; note?: string };
    /** Whether it begins ticked; true unless said. */
    on?: boolean;
}

/**
 * What the game knows at the pause, given to the page with the frame: what the
 * frame is called, and the parts.
 */
export interface Snapshot {
    /** Over the frame, and at the head of `report.md`: "The Bridge". */
    title?: string;
    /** Under it, over the frame: "4:12 into the run · the world is paused". */
    subtitle?: string;
    parts?: readonly Part[];
}

/** What is sent: the player's choices, and the moment as it was kept. */
export interface Draft {
    kind: Kind | null;
    words: string;
    snapshot: Snapshot;
    /** Which parts are sent, by id; `frame` is the frame's own. */
    sent: Record<string, boolean>;
    frame: Frame | null;
    marks: readonly Mark[];
    marked: Blob | null;
    /** The build, as the game names it: a commit, say. */
    build: string;
    /** When it was sent, on the player's clock. */
    at: Date;
}

const two = (n: number): string => String(n).padStart(2, "0");

/** 2026-10-06 21:31:05, on the sender's clock. */
export function localTime(d: Date): string {
    return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
}

/** 2026-10-06_213105: what the report's folder is named for. */
export function stampOf(d: Date): string {
    return localTime(d).replace(" ", "_").replace(/:/g, "");
}

const included = (d: Draft): Part[] => (d.snapshot.parts ?? []).filter((p) => d.sent[p.id]);
const framed = (d: Draft): boolean => !!(d.sent["frame"] && d.frame?.blob);

export function reportMarkdown(d: Draft): string {
    const out = [`# ${d.kind?.title ?? "Feedback"} · ${d.snapshot.title ?? "the game"}`, ""];
    const words = d.words.replace(/\s+$/, "");
    if (words) out.push(...words.split("\n").map((l) => (l ? `> ${l}` : ">")), "");
    else out.push("*Nothing written.*", "");
    if (framed(d)) {
        if (d.marked)
            out.push(
                "![The frame, as marked](marked.jpg)",
                "",
                "[The frame without the marks](frame.jpg)",
                "",
            );
        else out.push("![The frame, as it was paused](frame.jpg)", "");
        if (!d.frame?.hud) out.push("*The HUD could not be drawn into it in this browser.*", "");
    }
    out.push(`- **Sent:** ${localTime(d.at)}, on the sender's clock`);
    for (const p of included(d)) for (const l of p.lines ?? []) out.push(`- ${l}`);
    out.push(`- **Build:** ${d.build}`, "");
    out.push("`state.json` has all of it as data, as far as it was sent.");
    for (const p of included(d))
        if (p.file) out.push("", `\`${p.file.name}\`${p.file.note ? `: ${p.file.note}` : ""}`);
    return `${out.join("\n")}\n`;
}

export function reportState(d: Draft): Record<string, unknown> {
    const f = d.frame;
    const out: Record<string, unknown> = {
        kind: d.kind?.id ?? null,
        words: d.words,
        title: d.snapshot.title ?? null,
        sent: {
            local: localTime(d.at),
            utc: d.at.toISOString(),
            offsetMinutes: -d.at.getTimezoneOffset(),
        },
        build: d.build,
        frame:
            framed(d) && f
                ? {
                      file: "frame.jpg",
                      marked: d.marked ? "marked.jpg" : null,
                      marks: d.marks.map(markData),
                      width: f.width,
                      height: f.height,
                      hud: f.hud,
                  }
                : null,
    };
    for (const p of included(d)) if (p.data !== undefined) out[p.id] = p.data;
    return out;
}

async function base64(data: Blob | string): Promise<string> {
    const bytes = new Uint8Array(await new Blob([data]).arrayBuffer());
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000)
        s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
}

const asFile = (data: unknown): string | Blob =>
    typeof data === "string" || data instanceof Blob ? data : `${JSON.stringify(data)}\n`;

/** The report's files, by name, as base64: what the inbox takes. */
export async function reportFiles(d: Draft): Promise<Record<string, string>> {
    const files: Record<string, string> = {
        "report.md": await base64(reportMarkdown(d)),
        "state.json": await base64(`${JSON.stringify(reportState(d), null, 2)}\n`),
    };
    if (framed(d) && d.frame?.blob) {
        files["frame.jpg"] = await base64(d.frame.blob);
        if (d.marked) files["marked.jpg"] = await base64(d.marked);
    }
    for (const p of included(d)) {
        if (!p.file) continue;
        if (files[p.file.name]) throw new Error(`two files are called ${p.file.name}`);
        files[p.file.name] = await base64(asFile(p.file.data));
    }
    return files;
}
