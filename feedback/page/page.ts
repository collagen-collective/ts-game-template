/**
 * The feedback page: what a player at the hosted game uses to tell you what
 * they saw, without leaving it. Built in Extra Sapien for the one other person
 * who played the game it rebuilt, and taken from there; what the person there
 * asked for was *"leave feedback with screenshot annotations, etc."*
 *
 * At the pause the game hands it the frame and what it knows (`keep`); from a
 * menu, it opens the page (`open`). First the frame, full size, to mark: a
 * ring, a stroke, undo. Then what kind of thing it is, the player's words, and
 * what goes with them, each of which they can leave out. Nothing is required,
 * and the box says so, in the words Extra Sapien's person gave it: *"I know I
 * have failed to follow through on filing feedback or a bug report because I
 * didn't feel I had the energy to do it well with the expected, observed,
 * steps to reproduce, etc."*
 *
 * Every step works on a gamepad and on the keys and mouse alike, and the page
 * reads both itself while it is open: a pad with the browser's standard
 * mapping, polled each frame, and the keys, which it keeps from the game until
 * it closes. The words are typed on the keyboard. It closes only once every
 * key and button pressed on it is let go, so the press that closes it does not
 * reach the game's menu as well.
 */
import { type CaptureOptions, captureFrame, type Frame, jpeg } from "./capture.ts";
import { type Mark, MARK_STYLE, type MarkStyle, paintMarks } from "./marks.ts";
import {
    type Draft,
    type Kind,
    KINDS,
    type Part,
    reportFiles,
    type Snapshot,
    stampOf,
} from "./report.ts";
import { endpoint, isDev, post, takeKey } from "./send.ts";
import { CSS } from "./style.ts";

export interface FeedbackOptions {
    /** Where the page is put; the body, unless said. It covers the window either way. */
    parent?: HTMLElement;
    /** What it might be, as the player is offered it. `KINDS` unless said. */
    kinds?: readonly Kind[];
    /** The words in the empty box. */
    prompt?: string;
    /** The build, as the report names it: the commit, say, through Vite's `define`. */
    build?: string;
    /** Where this browser keeps the key its link carried. One per game, if games share an origin. */
    storageKey?: string;
    /** Whether "the build and this browser" goes with the words, as a part they can leave out. */
    browser?: boolean;
    /** How the frame is kept: its width and quality, and what over the canvas to leave out. */
    capture?: CaptureOptions;
    /** A ring's radius, as a share of the frame's width. */
    ring?: number;
    /** The pad's cursor, in frame widths a second with the stick pushed all the way. */
    cursor?: number;
    /** How long the thanks stays before the page closes, in ms. */
    thanks?: number;
    /** When the page has closed, and every press made on it is let go: whether a report was sent. */
    onClose?: (sent: boolean) => void;
}

export const PROMPT = "Write as much or as little as you want, everything helps";

type Device = "keys" | "pad";
type Act = "send" | "back" | "next" | "undo";
type Press = {
    up: boolean;
    down: boolean;
    accept: boolean;
    back: boolean;
    undo: boolean;
    next: boolean;
    write: boolean;
};
const NONE: Press = {
    up: false,
    down: false,
    accept: false,
    back: false,
    undo: false,
    next: false,
    write: false,
};

/** The browser's standard gamepad mapping. */
const PAD = { a: 0, b: 1, x: 2, y: 3, rt: 7, start: 9, up: 12, down: 13, dead: 0.2, flick: 0.6 };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** The graphics card, as the browser names it, where it will. */
function gpu(): string | null {
    try {
        const gl = document.createElement("canvas").getContext("webgl");
        if (!gl) return null;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return name;
    } catch {
        return null;
    }
}

/** The build and this browser: a part every game can send. */
export function browserPart(build: string): Part {
    const address = new URLSearchParams(location.search);
    address.delete("key");
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
        id: "browser",
        label: `the build (${build}) and this browser, ${w}×${h}`,
        lines: [`**Browser:** ${w}×${h} at ${window.devicePixelRatio}×`],
        data: {
            address: address.toString(),
            screen: { width: w, height: h, pixelRatio: window.devicePixelRatio },
            browser: navigator.userAgent,
            gpu: gpu(),
        },
    };
}

export class FeedbackPage {
    private readonly o: Required<Omit<FeedbackOptions, "parent" | "onClose" | "capture">> & {
        capture: CaptureOptions;
    };
    private readonly onClose: ((sent: boolean) => void) | undefined;
    private readonly el: HTMLDivElement;
    private readonly still: HTMLImageElement;
    private readonly canvas: HTMLCanvasElement;
    private readonly heading: HTMLDivElement;
    private readonly markHints: HTMLSpanElement;
    private readonly img: HTMLImageElement;
    private readonly cap: HTMLDivElement;
    private readonly kindsEl: HTMLDivElement;
    private readonly partsEl: HTMLDivElement;
    private readonly box: HTMLTextAreaElement;
    private readonly status: HTMLDivElement;
    private readonly hints: HTMLDivElement;
    private hintsShown = "";
    private markHintsShown = "";
    private readonly key: string | null;
    isOpen = false;
    /** `mark`: the frame full size, to mark; `tell`: what it is, the words, what goes with them. */
    stage: "mark" | "tell" = "mark";
    private snap: { snapshot: Snapshot; frame: Promise<Frame> | null } = {
        snapshot: {},
        frame: null,
    };
    private frame: Frame | null = null;
    private frameUrl: string | null = null;
    private drawn: Mark[] = [];
    /** Counts every change to the marks, so a marked frame knows whether it is the latest. */
    private version = 0;
    private marked: { blob: Blob | null; url: string | null; of: number } | null = null;
    private cursorAt: [number, number] = [0.5, 0.5];
    private stroke: { points: [number, number][]; by: Device; moved: boolean } | null = null;
    private kind: Kind | null = null;
    private sent: Record<string, boolean> = {};
    private parts: Part[] = [];
    private index = 0;
    private device: Device = "keys";
    private state: { now: "editing" | "sending" | "sent" | "failed"; text: string; until: number } =
        {
            now: "editing",
            text: "",
            until: 0,
        };
    /**
     * Keys pressed since the last frame, one a press, handled in the order
     * they came: two in one frame (Enter, then an arrow) are two steps.
     */
    private queued: Press[] = [];
    private act: Act | null = null;
    private line: number | null = null;
    private readonly held = new Set<string>();
    private padWas: boolean[] = [];
    private flick = 0;
    private raf = 0;
    private last = 0;
    /** Closed, and waiting for every press made on it to be let go. */
    private leaving: { sent: boolean } | null = null;
    private style: MarkStyle = MARK_STYLE;
    /** The folder the last report landed in: the dev server's, or the inbox's. */
    lastFolder: string | null = null;

    constructor(options: FeedbackOptions = {}) {
        this.o = {
            kinds: options.kinds ?? KINDS,
            prompt: options.prompt ?? PROMPT,
            build: options.build ?? "unknown",
            storageKey: options.storageKey ?? "feedback:key",
            browser: options.browser ?? true,
            capture: options.capture ?? {},
            ring: options.ring ?? 0.05,
            cursor: options.cursor ?? 0.5,
            thanks: options.thanks ?? 1600,
        };
        this.onClose = options.onClose;
        if (!document.getElementById("fb-style")) {
            const style = document.createElement("style");
            style.id = "fb-style";
            style.textContent = CSS;
            document.head.appendChild(style);
        }
        this.el = document.createElement("div");
        this.el.className = "fb-page";
        this.el.dataset["feedbackPage"] = "";
        this.el.innerHTML = `
<div class="fb-mark"><img alt=""><canvas></canvas><div class="fb-ctx"></div>
<div class="fb-bar"><b class="fb-t">MARK WHAT YOU MEAN</b><span class="fb-mhints"></span></div></div>
<div class="fb-tell"><div class="fb-frame"><img alt=""><div class="fb-cap"></div></div>
<div class="fb-form"><h2>WHAT IS IT?</h2><div class="fb-kinds"></div><textarea spellcheck="true"></textarea><h2>SENT WITH IT<span class="fb-note">untick anything you would rather keep</span></h2><div class="fb-parts"></div></div>
<div class="fb-status"></div><div class="fb-hints"></div></div>`;
        (options.parent ?? document.body).appendChild(this.el);
        const q = <T extends Element>(s: string): T => this.el.querySelector<T>(s)!;
        this.still = q(".fb-mark img");
        this.canvas = q(".fb-mark canvas");
        this.heading = q(".fb-ctx");
        this.markHints = q(".fb-mhints");
        this.img = q(".fb-tell img");
        this.cap = q(".fb-cap");
        this.kindsEl = q(".fb-kinds");
        this.partsEl = q(".fb-parts");
        this.box = q("textarea");
        this.box.placeholder = this.o.prompt;
        this.status = q(".fb-status");
        this.hints = q(".fb-hints");
        this.kindsEl.innerHTML = this.o.kinds
            .map((_, i) => `<div class="fb-row fb-kind" data-line="${i}"></div>`)
            .join("");
        this.o.kinds.forEach((k, i) => {
            this.kindsEl.children[i]!.textContent = k.label;
        });
        this.key = takeKey(this.o.storageKey);
        this.listen();
    }

    /**
     * Whether feedback can be sent from here: on the dev server, whose inbox is
     * a folder, or where there is a function to send to and this browser holds
     * a key. A game offers FEEDBACK in its menu only when this is true.
     */
    get available(): boolean {
        return isDev() || (endpoint() !== "" && this.key !== null);
    }

    /** The player's marks on the frame, as they stand. */
    get marks(): readonly Mark[] {
        return this.drawn;
    }

    /**
     * At the pause, before a menu covers the HUD: the frame the player is
     * looking at, and what the game knows. A new frame clears the marks; the
     * words and choices stay until a report is sent.
     */
    keep(
        canvas: HTMLCanvasElement | null,
        snapshot: Snapshot = {},
        overlay?: HTMLElement | null,
    ): void {
        const frame = canvas
            ? captureFrame(canvas, {
                  ...this.o.capture,
                  overlay: overlay ?? this.o.capture.overlay ?? null,
                  exclude: ["[data-feedback-page]", ...(this.o.capture.exclude ?? [])],
              })
            : null;
        this.snap = { snapshot, frame };
        this.frame = null;
        this.drawn = [];
        this.stroke = null;
        this.cursorAt = [0.5, 0.5];
        this.changed();
        if (this.frameUrl) URL.revokeObjectURL(this.frameUrl);
        this.frameUrl = null;
        void frame?.then((f) => {
            if (this.snap.frame !== frame) return;
            this.frame = f;
            this.frameUrl = f.blob ? URL.createObjectURL(f.blob) : null;
            this.render();
        });
    }

    /**
     * Over the game, on the frame kept at the pause. `device` is what the
     * player opened it with, so the page names its buttons from the start;
     * unless it is said, the page names the keys until a pad is touched, and
     * a player who opened it with a pad's A sees the keys' names first.
     */
    open(device?: Device): void {
        if (this.isOpen) return;
        this.isOpen = true;
        if (device) this.device = device;
        this.leaving = null;
        this.stage = this.snap.frame ? "mark" : "tell";
        this.index = 0;
        this.state = { now: "editing", text: "", until: 0 };
        this.parts = [
            ...(this.snap.snapshot.parts ?? []),
            ...(this.o.browser ? [browserPart(this.o.build)] : []),
        ];
        const was = this.sent;
        this.sent = { frame: was["frame"] ?? true };
        for (const p of this.parts) this.sent[p.id] = was[p.id] ?? p.on ?? true;
        this.partsEl.innerHTML = ["frame", ...this.parts.map((p) => p.id)]
            .map(
                (id, i) =>
                    `<div class="fb-row fb-part" role="checkbox" data-part="${id}" data-line="${this.firstPart + i}"></div>`,
            )
            .join("");
        this.padWas = this.padButtons();
        this.el.classList.add("fb-open");
        this.el.classList.toggle("fb-marking", this.stage === "mark");
        this.render();
        this.last = performance.now();
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(this.frameLoop);
    }

    /** Put away, without waiting for anything; `onClose` is called. */
    close(): void {
        if (!this.isOpen) return;
        this.leave(false);
    }

    /** Taken off the page for good. */
    destroy(): void {
        cancelAnimationFrame(this.raf);
        this.isOpen = false;
        this.el.remove();
        window.removeEventListener("keydown", this.onKey, true);
        window.removeEventListener("keyup", this.onKey, true);
        window.removeEventListener("resize", this.onResize);
    }

    // The lines of the tell page, top to bottom: the kinds, the box, the frame, the parts.
    private get words(): number {
        return this.o.kinds.length;
    }
    private get firstPart(): number {
        return this.o.kinds.length + 1;
    }
    private get rows(): number {
        return this.firstPart + 1 + this.parts.length;
    }
    private partAt(line: number): string | null {
        const i = line - this.firstPart;
        if (i === 0) return "frame";
        return this.parts[i - 1]?.id ?? null;
    }

    private readonly onResize = (): void => this.render();

    /**
     * The keys while the page is open: every one kept from the game, but what
     * is typed in the box, and the letting go of a key pressed before it
     * opened. That one the game saw go down, and must see come up, or a game
     * that keeps the keys held thinks it held for ever: the Space that chose
     * FEEDBACK, in Extra Sapien, left its hero jumping when play went on.
     */
    private readonly onKey = (e: KeyboardEvent): void => {
        if (!this.isOpen && !this.leaving) return;
        if (e.type === "keyup") {
            const ours = this.held.delete(e.code);
            if (ours && e.target !== this.box) e.stopImmediatePropagation();
            return;
        }
        if (this.leaving) return;
        this.held.add(e.code);
        if (e.target === this.box) {
            if (e.key === "Escape") {
                e.preventDefault();
                this.box.blur();
            } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.act = "send";
            }
            this.use("keys");
            return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.repeat && !["ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(e.code)) return;
        this.use("keys");
        const q: Press = { ...NONE };
        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                q.up = true;
                break;
            case "ArrowDown":
            case "KeyS":
                q.down = true;
                break;
            case "Enter":
            case "NumpadEnter":
                if (e.ctrlKey || e.metaKey) this.act = "send";
                else q.accept = true;
                break;
            case "Space":
                q.accept = true;
                break;
            case "Escape":
            case "Backspace":
                q.back = true;
                break;
            case "KeyZ":
                q.undo = true;
                break;
        }
        this.queued.push(q);
    };

    private listen(): void {
        window.addEventListener("keydown", this.onKey, true);
        window.addEventListener("keyup", this.onKey, true);
        window.addEventListener("resize", this.onResize);
        // What is typed in the box stays in it.
        for (const t of ["keydown", "keyup", "keypress"])
            this.box.addEventListener(t, (e) => e.stopPropagation());
        this.el.addEventListener("click", (e) => {
            const t = e.target as HTMLElement;
            this.use("keys");
            const act = t.closest<HTMLElement>("[data-act]")?.dataset["act"];
            const line = t.closest<HTMLElement>("[data-line]")?.dataset["line"];
            if (act === "send" || act === "back" || act === "next" || act === "undo")
                this.act = act;
            else if (line !== undefined) this.line = Number(line);
        });
        this.el.addEventListener("mousemove", (e) => {
            const line = (e.target as HTMLElement).closest<HTMLElement>("[data-line]")?.dataset[
                "line"
            ];
            if (line !== undefined && Number(line) !== this.index) {
                this.index = Number(line);
                this.render();
            }
        });
        // The mouse on the frame: a click rings, a drag draws, the right button undoes.
        this.canvas.addEventListener("pointerdown", (e) => {
            this.use("keys");
            if (e.button === 2) {
                this.act = "undo";
                return;
            }
            if (e.button !== 0) return;
            this.stroke = { points: [this.fractionAt(e)], by: "keys", moved: false };
            this.canvas.setPointerCapture(e.pointerId);
            this.render();
        });
        this.canvas.addEventListener("pointermove", (e) => {
            if (this.stroke?.by !== "keys") return;
            if (this.extend(this.fractionAt(e))) this.render();
        });
        this.canvas.addEventListener("pointerup", () => {
            if (this.stroke?.by !== "keys") return;
            this.endStroke();
            this.render();
        });
        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        this.box.addEventListener("focus", () => {
            this.index = this.words;
            this.render();
        });
        this.box.addEventListener("blur", () => this.render());
    }

    private use(d: Device): void {
        if (d === this.device) return;
        this.device = d;
        this.render();
    }

    /** The first pad with buttons, as the browser maps it. */
    private pad(): Gamepad | null {
        for (const p of navigator.getGamepads?.() ?? [])
            if (p && p.buttons.length > PAD.start) return p;
        return null;
    }

    private padButtons(): boolean[] {
        return this.pad()?.buttons.map((b) => b.pressed || b.value > 0.5) ?? [];
    }

    private readonly frameLoop = (now: number): void => {
        const dt = Math.min(0.1, (now - this.last) / 1000);
        this.last = now;
        const pad = this.pad();
        const buttons = this.padButtons();
        const pressed = (i: number): boolean => !!buttons[i] && !this.padWas[i];
        if (this.leaving) {
            if (this.held.size === 0 && !buttons.some(Boolean)) {
                const sent = this.leaving.sent;
                this.leaving = null;
                this.onClose?.(sent);
                return;
            }
            this.padWas = buttons;
            this.raf = requestAnimationFrame(this.frameLoop);
            return;
        }
        const keys = this.queued;
        this.queued = [];
        const p: Press = { ...NONE };
        let move: [number, number] = [0, 0];
        let draw = false;
        if (pad) {
            const sx = pad.axes[0] ?? 0;
            const sy = pad.axes[1] ?? 0;
            const m = Math.hypot(sx, sy);
            if (m > PAD.dead)
                move = [
                    (sx / m) * ((m - PAD.dead) / (1 - PAD.dead)),
                    (sy / m) * ((m - PAD.dead) / (1 - PAD.dead)),
                ];
            draw = !!buttons[PAD.rt];
            // The stick as the menus' up and down: a press each time it is pushed past the flick.
            const f = sy < -PAD.flick ? -1 : sy > PAD.flick ? 1 : 0;
            if (this.stage === "tell" && f !== 0 && f !== this.flick) {
                if (f < 0) p.up = true;
                else p.down = true;
            }
            this.flick = f;
            if (pressed(PAD.up)) p.up = true;
            if (pressed(PAD.down)) p.down = true;
            if (pressed(PAD.a)) p.accept = true;
            if (pressed(PAD.b)) p.back = true;
            if (pressed(PAD.x)) p.undo = true;
            if (pressed(PAD.y)) p.write = true;
            if (pressed(PAD.start)) p.next = true;
            if (buttons.some((b, i) => b && !this.padWas[i]) || m > 0.5) this.use("pad");
        }
        this.padWas = buttons;
        for (const k of keys) if (this.isOpen) this.step(k, 0, [0, 0], false);
        if (this.isOpen) this.step(p, dt, move, draw);
        if (this.isOpen || this.leaving) this.raf = requestAnimationFrame(this.frameLoop);
    };

    private step(p: Press, dt: number, move: [number, number], draw: boolean): void {
        const act = this.act;
        const line = this.line;
        this.act = null;
        this.line = null;
        if (this.state.now === "sending") return;
        if (this.state.now === "sent") {
            const any = p.accept || p.back || p.next || act !== null || line !== null;
            if (performance.now() >= this.state.until || any) this.leave(true);
            return;
        }
        if (this.stage === "mark") this.stepMark(p, dt, move, draw, act);
        else this.stepTell(p, act, line);
    }

    /** The frame, full size: the stick, A, RT and X on the pad; the mouse's own events. */
    private stepMark(
        p: Press,
        dt: number,
        move: [number, number],
        draw: boolean,
        act: Act | null,
    ): void {
        if (act === "back" || p.back) return this.leave(false);
        if (act === "next" || p.next || (p.accept && this.device === "keys")) return this.toTell();
        let redraw = false;
        if (p.undo || act === "undo") {
            if (this.stroke) this.stroke = null;
            else if (this.drawn.pop()) this.changed();
            redraw = true;
        }
        if (this.device === "pad") {
            if (move[0] !== 0 || move[1] !== 0) {
                const f = this.frameBox();
                const aspect = f.height > 0 ? f.width / f.height : 16 / 9;
                const step = this.o.cursor * dt;
                this.cursorAt = [
                    clamp01(this.cursorAt[0] + move[0] * step),
                    clamp01(this.cursorAt[1] + move[1] * step * aspect),
                ];
                if (this.stroke?.by === "pad") this.extend(this.cursorAt);
                redraw = true;
            }
            if (draw && !this.stroke)
                this.stroke = { points: [[...this.cursorAt]], by: "pad", moved: false };
            else if (!draw && this.stroke?.by === "pad") {
                this.endStroke();
                redraw = true;
            }
            if (p.accept) {
                this.drawn.push({
                    kind: "ring",
                    x: this.cursorAt[0],
                    y: this.cursorAt[1],
                    r: this.o.ring,
                });
                this.changed();
                redraw = true;
            }
        }
        if (redraw) this.render();
    }

    /** What it is, the words, what goes with them; B (Escape) goes back to the frame. */
    private stepTell(p: Press, act: Act | null, line: number | null): void {
        const typing = document.activeElement === this.box;
        if (act === "back" || (p.back && !typing)) {
            if (this.snap.frame) this.toMark();
            else this.leave(false);
            return;
        }
        if (act === "send" || p.next) {
            void this.send();
            return;
        }
        let moved = false;
        if (line !== null) {
            this.index = line;
            this.choose();
            moved = true;
        }
        if (p.write) {
            this.index = this.words;
            this.box.focus();
            moved = true;
        }
        if (p.up || p.down) {
            this.index = (this.index + (p.down ? 1 : -1) + this.rows) % this.rows;
            if (this.index !== this.words) this.box.blur();
            moved = true;
        }
        if (p.accept && !typing) {
            this.choose();
            moved = true;
        }
        if (moved) this.render();
    }

    /** On the line the cursor is on: a kind chosen or let go, the box to write in, a part in or out. */
    private choose(): void {
        const kind = this.o.kinds[this.index];
        if (kind) this.kind = this.kind?.id === kind.id ? null : kind;
        else if (this.index === this.words) this.box.focus();
        else {
            const id = this.partAt(this.index);
            if (id) this.sent[id] = !this.sent[id];
        }
    }

    private leave(sent: boolean): void {
        if (sent) {
            // Sent: the next report starts empty, the frame's marks with it.
            this.box.value = "";
            this.kind = null;
            this.sent = {};
            this.drawn = [];
            this.changed();
        }
        this.isOpen = false;
        this.stroke = null;
        this.box.blur();
        this.el.classList.remove("fb-open");
        // The frame loop runs on until every press made here is let go, then calls onClose.
        this.leaving = { sent };
    }

    private toTell(): void {
        this.endStroke();
        this.stage = "tell";
        this.el.classList.remove("fb-marking");
        void this.compose();
        this.render();
    }

    private toMark(): void {
        this.box.blur();
        this.stage = "mark";
        this.el.classList.add("fb-marking");
        this.render();
    }

    private changed(): void {
        this.version++;
    }

    /**
     * The stroke goes on to `p`, if it is two of the player's pixels from the
     * last point; it counts as a stroke, not a click, once it is six from where
     * it began.
     */
    private extend(p: [number, number]): boolean {
        const s = this.stroke;
        if (!s) return false;
        const f = this.frameBox();
        const px = (a: readonly [number, number], b: readonly [number, number]): number =>
            Math.hypot((a[0] - b[0]) * f.width, (a[1] - b[1]) * f.height);
        if (px(p, s.points.at(-1)!) < 2) return false;
        s.points.push([p[0], p[1]]);
        if (px(p, s.points[0]!) >= 6) s.moved = true;
        return true;
    }

    /** A stroke let go: kept if it moved; a click that did not move is a ring. */
    private endStroke(): void {
        const s = this.stroke;
        this.stroke = null;
        if (!s) return;
        if (s.moved && s.points.length >= 2) this.drawn.push({ kind: "stroke", points: s.points });
        else if (s.by === "keys") {
            const [x, y] = s.points[0]!;
            this.drawn.push({ kind: "ring", x, y, r: this.o.ring });
        } else return;
        this.changed();
    }

    /** Where the frame is drawn on the page, in CSS pixels: the image, fitted whole. */
    private frameBox(): { left: number; top: number; width: number; height: number } {
        const r = this.still.getBoundingClientRect();
        const w = this.frame?.width ?? r.width;
        const h = this.frame?.height ?? r.height;
        const k = w > 0 && h > 0 ? Math.min(r.width / w, r.height / h) : 1;
        return {
            left: r.left + (r.width - w * k) / 2,
            top: r.top + (r.height - h * k) / 2,
            width: w * k,
            height: h * k,
        };
    }

    private fractionAt(e: { clientX: number; clientY: number }): [number, number] {
        const f = this.frameBox();
        return [
            clamp01((e.clientX - f.left) / Math.max(1, f.width)),
            clamp01((e.clientY - f.top) / Math.max(1, f.height)),
        ];
    }

    /** The marked frame: the frame at its own size with the marks drawn in, as they were seen. */
    private async compose(): Promise<void> {
        const v = this.version;
        if (this.marked?.of === v) return;
        let blob: Blob | null = null;
        if (this.frame?.blob && this.drawn.length > 0) {
            const bmp = await createImageBitmap(this.frame.blob);
            const c = document.createElement("canvas");
            c.width = bmp.width;
            c.height = bmp.height;
            const g = c.getContext("2d");
            if (g) {
                g.drawImage(bmp, 0, 0);
                const seen = this.frameBox().width || bmp.width;
                paintMarks(
                    g,
                    this.drawn,
                    (p) => [p[0] * bmp.width, p[1] * bmp.height],
                    bmp.width,
                    bmp.width / seen,
                    this.style,
                );
                blob = await jpeg(c, this.o.capture.quality);
            }
            bmp.close();
        }
        if (v !== this.version) return;
        if (this.marked?.url) URL.revokeObjectURL(this.marked.url);
        this.marked = { blob, url: blob ? URL.createObjectURL(blob) : null, of: v };
        this.render();
    }

    private async send(): Promise<void> {
        this.box.blur();
        this.state = { now: "sending", text: "SENDING…", until: 0 };
        this.render();
        const frame = this.snap.frame ? await this.snap.frame : null;
        if (this.drawn.length > 0) await this.compose();
        const d: Draft = {
            kind: this.kind,
            words: this.box.value,
            snapshot: { ...this.snap.snapshot, parts: this.parts },
            sent: { ...this.sent },
            frame,
            marks: [...this.drawn],
            marked: this.drawn.length > 0 ? (this.marked?.blob ?? null) : null,
            build: this.o.build,
            at: new Date(),
        };
        let r;
        try {
            const files = await reportFiles(d);
            r = await post(endpoint(), { key: this.key, stamp: stampOf(d.at), files });
        } catch (e) {
            r = { ok: false as const, error: e instanceof Error ? e.message : String(e) };
        }
        if (r.ok) {
            this.lastFolder = r.folder;
            this.state = {
                now: "sent",
                text: "SENT. THANK YOU.",
                until: performance.now() + this.o.thanks,
            };
        } else
            this.state = {
                now: "failed",
                text: `NOT SENT: ${r.error}. Your words are kept; send again when you like.`,
                until: 0,
            };
        this.render();
    }

    private render(): void {
        if (!this.isOpen) return;
        const css = getComputedStyle(this.el);
        this.style = {
            color: css.getPropertyValue("--fb-mark").trim() || MARK_STYLE.color,
            glow: css.getPropertyValue("--fb-glow").trim() || MARK_STYLE.glow,
        };
        if (this.frameUrl && this.still.getAttribute("src") !== this.frameUrl)
            this.still.src = this.frameUrl;
        if (this.stage === "mark") this.renderMark();
        else this.renderTell();
    }

    private renderMark(): void {
        const s = this.snap.snapshot;
        this.heading.replaceChildren();
        if (s.title) this.heading.append(s.title);
        if (s.subtitle) {
            const t = document.createElement("span");
            t.className = "fb-sub";
            t.textContent = s.subtitle;
            this.heading.append(document.createElement("br"), t);
        }
        this.drawMarks();
        // Written only when it changes: a hint replaced under the mouse loses its click.
        const hints =
            this.device === "pad"
                ? `<span class="fb-k">left stick</span>move<span class="fb-k">A</span>ring it<span class="fb-k">RT</span>hold to draw` +
                  `<span class="fb-act" data-act="undo"><span class="fb-k">X</span>undo</span>` +
                  `<span class="fb-act" data-act="next"><span class="fb-k">Start</span>next</span>` +
                  `<span class="fb-act" data-act="back"><span class="fb-k">B</span>back</span>`
                : `click to ring it, drag to draw` +
                  `<span class="fb-act" data-act="undo"><span class="fb-k">Z</span>undo</span>` +
                  `<span class="fb-act" data-act="next"><span class="fb-k">Enter</span>next</span>` +
                  `<span class="fb-act" data-act="back"><span class="fb-k">Esc</span>back</span>`;
        if (hints !== this.markHintsShown) {
            this.markHints.innerHTML = hints;
            this.markHintsShown = hints;
        }
    }

    /** The marks over the frame, the stroke being drawn, and the pad's cursor. */
    private drawMarks(): void {
        const c = this.canvas;
        const box = c.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.round(box.width * dpr));
        const h = Math.max(1, Math.round(box.height * dpr));
        if (c.width !== w || c.height !== h) {
            c.width = w;
            c.height = h;
        }
        const g = c.getContext("2d");
        if (!g) return;
        g.clearRect(0, 0, w, h);
        const f = this.frameBox();
        const at = (p: readonly [number, number]): [number, number] => [
            (f.left - box.left + p[0] * f.width) * dpr,
            (f.top - box.top + p[1] * f.height) * dpr,
        ];
        const s = this.stroke;
        const all: Mark[] = s?.moved
            ? [...this.drawn, { kind: "stroke", points: s.points }]
            : this.drawn;
        paintMarks(g, all, at, f.width * dpr, dpr, this.style);
        if (this.device !== "pad") return;
        const [x, y] = at(this.cursorAt);
        g.save();
        g.strokeStyle =
            getComputedStyle(this.el).getPropertyValue("--fb-cursor").trim() || "#9fd2ff";
        g.lineWidth = 2 * dpr;
        g.beginPath();
        g.arc(x, y, 11 * dpr, 0, Math.PI * 2);
        for (const [dx, dy] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ] as const) {
            g.moveTo(x + dx * 8 * dpr, y + dy * 8 * dpr);
            g.lineTo(x + dx * 17 * dpr, y + dy * 17 * dpr);
        }
        g.stroke();
        g.restore();
    }

    private renderTell(): void {
        const typing = document.activeElement === this.box;
        const marked = this.drawn.length > 0;
        for (const el of this.el.querySelectorAll<HTMLElement>("[data-line]"))
            el.classList.toggle("fb-on", Number(el.dataset["line"]) === this.index && !typing);
        this.box.classList.toggle("fb-on", this.index === this.words && !typing);
        this.o.kinds.forEach((k, i) =>
            this.kindsEl.children[i]?.classList.toggle("fb-chosen", this.kind?.id === k.id),
        );
        for (const el of this.partsEl.querySelectorAll<HTMLElement>("[data-part]")) {
            const id = el.dataset["part"]!;
            el.textContent =
                id === "frame"
                    ? !this.snap.frame
                        ? "no frame was kept"
                        : marked
                          ? "this frame, with your marks and without"
                          : "this frame, as you paused it"
                    : (this.parts.find((p) => p.id === id)?.label ?? id);
            const off = !this.sent[id] || (id === "frame" && !this.snap.frame);
            el.classList.toggle("fb-off", off);
            el.setAttribute("aria-checked", String(!off));
        }
        const shown = marked ? (this.marked?.url ?? null) : this.frameUrl;
        if (shown && this.img.getAttribute("src") !== shown) this.img.src = shown;
        this.img.style.visibility = shown ? "visible" : "hidden";
        this.cap.textContent = !this.snap.frame
            ? "no frame was kept"
            : !this.frame || (marked && this.marked?.of !== this.version)
              ? "keeping the frame…"
              : !this.frame.blob
                ? "this browser would not give the frame"
                : `${marked ? "your frame, with your marks" : "the frame, as you paused it"}${this.frame.hud ? "" : " (this browser would not draw the HUD into it)"}`;
        this.status.textContent = this.state.text;
        const hints =
            this.device === "pad"
                ? `<span class="fb-k">left stick</span>choose<span class="fb-k">A</span>pick<span class="fb-k">Y</span>write` +
                  `<span class="fb-act" data-act="send"><span class="fb-k">Start</span>send</span>` +
                  `<span class="fb-act" data-act="back"><span class="fb-k">B</span>back</span>`
                : `click a line to choose it, and the box to write` +
                  `<span class="fb-act" data-act="send"><span class="fb-k">Ctrl+Enter</span>send</span>` +
                  `<span class="fb-act" data-act="back"><span class="fb-k">Esc</span>back</span>`;
        if (hints !== this.hintsShown) {
            this.hints.innerHTML = hints;
            this.hintsShown = hints;
        }
    }
}
