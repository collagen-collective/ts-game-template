/**
 * A stand-in game for the feedback page, to try it and to see it: `npm run
 * dev`, then `/feedback/demo/`. Escape, P or Start pauses; FEEDBACK opens the
 * page; a report lands in `feedback-inbox/`. Everything a real game does to
 * use the page is here, and nothing else.
 */
import { FeedbackPage, Trace } from "../page/index.ts";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const hud = document.getElementById("hud")!;
const menu = document.getElementById("menu")!;
const g = canvas.getContext("2d")!;

let t = 0;
let paused = false;
const ship = { x: 0.5, y: 0.5 };
const trace = new Trace<{ x: number; y: number }>(10, 0.1);

const feedback = new FeedbackPage({
    build: "demo",
    onClose: () => (menu.querySelector("button") as HTMLButtonElement).focus(),
});
(menu.querySelector('[data-do="feedback"]') as HTMLButtonElement).disabled = !feedback.available;

function draw(): void {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    const { width: w, height: h } = canvas;
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#1b2a44");
    sky.addColorStop(1, "#3f2a3a");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#0b0f18";
    g.fillRect(0, h * 0.7, w, h * 0.3);
    for (let i = 0; i < 12; i++) {
        g.fillStyle = "#2a3550";
        g.fillRect(
            ((i * 0.09 + t * 0.02) % 1.1) * w - 40,
            h * 0.7 - 30 - (i % 3) * 25,
            30,
            30 + (i % 3) * 25,
        );
    }
    g.fillStyle = "#ffd27a";
    g.beginPath();
    g.arc(ship.x * w, ship.y * h, 18 * devicePixelRatio, 0, Math.PI * 2);
    g.fill();
}

function loop(now: number): void {
    if (!paused) {
        t = now / 1000;
        ship.x = 0.5 + 0.3 * Math.sin(t * 0.7);
        ship.y = 0.45 + 0.12 * Math.sin(t * 1.3);
        trace.offer(t, () => ({ x: +ship.x.toFixed(3), y: +ship.y.toFixed(3) }));
        draw();
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function pause(): void {
    paused = true;
    draw();
    // The frame, kept before the menu covers the HUD.
    feedback.keep(
        canvas,
        {
            title: "The Bridge",
            subtitle: `${t.toFixed(1)} s in · the world is paused`,
            parts: [
                {
                    id: "where",
                    label: `the bridge, ${t.toFixed(1)} s in, and the last ten seconds`,
                    lines: [`**Where:** the bridge, ${t.toFixed(1)} s in`],
                    data: { ship: { ...ship }, t },
                    file: {
                        name: "trace.json",
                        data: trace.all(),
                        note: "the ship, ten times a second",
                    },
                },
            ],
        },
        hud,
    );
    menu.classList.add("open");
}

function resume(): void {
    paused = false;
    menu.classList.remove("open");
}

window.addEventListener("keydown", (e) => {
    if (feedback.isOpen) return;
    if (e.code === "Escape" || e.code === "KeyP") (paused ? resume : pause)();
});
menu.addEventListener("click", (e) => {
    const d = (e.target as HTMLElement).dataset["do"];
    if (d === "resume") resume();
    if (d === "feedback" && feedback.available) feedback.open();
});
let start = false;
(function poll(): void {
    const pad = navigator.getGamepads?.().find((p) => p);
    const now = !!pad?.buttons[9]?.pressed;
    if (now && !start && !feedback.isOpen) (paused ? resume : pause)();
    start = now;
    requestAnimationFrame(poll);
})();

// For the end-to-end test and the shots: the page, and whether the game is paused.
Object.assign(window, { __feedbackDemo: { feedback, paused: () => paused, pause } });
