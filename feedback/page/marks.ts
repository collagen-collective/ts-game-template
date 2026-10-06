/**
 * A mark on the frame, in the frame's own fractions from its top left, 0 to
 * 1: a ring, its radius a share of the frame's width, or a stroke.
 */
export type Mark =
    | { kind: "ring"; x: number; y: number; r: number }
    | { kind: "stroke"; points: [number, number][] };

/** How marks are drawn: the page's colour, read from its `--fb-mark` when it has one. */
export interface MarkStyle {
    color: string;
    glow: string;
}

export const MARK_STYLE: MarkStyle = { color: "#f2d58a", glow: "rgba(255, 210, 120, 0.55)" };

/**
 * The marks as the page shows them and as the marked frame keeps them: one
 * drawing for both. `at` places a fraction of the frame, `width` is the
 * frame's width there, and `scale` is the pixels there to a pixel the player saw.
 */
export function paintMarks(
    ctx: CanvasRenderingContext2D,
    marks: readonly Mark[],
    at: (p: readonly [number, number]) => [number, number],
    width: number,
    scale: number,
    style: MarkStyle = MARK_STYLE,
): void {
    ctx.save();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 6 * scale;
    for (const m of marks) {
        ctx.beginPath();
        if (m.kind === "ring") {
            const [x, y] = at([m.x, m.y]);
            ctx.arc(x, y, m.r * width, 0, Math.PI * 2);
        } else
            m.points.forEach((p, i) => {
                const [x, y] = at(p);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
        ctx.stroke();
    }
    ctx.restore();
}

const r4 = (n: number): number => Math.round(n * 1e4) / 1e4;

/** A mark as `state.json` keeps it: fractions to four places. */
export function markData(m: Mark): Mark {
    return m.kind === "ring"
        ? { kind: "ring", x: r4(m.x), y: r4(m.y), r: r4(m.r) }
        : { kind: "stroke", points: m.points.map(([x, y]): [number, number] => [r4(x), r4(y)]) };
}
