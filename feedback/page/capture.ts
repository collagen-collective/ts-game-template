/**
 * The frame the player is looking at, HUD and all, as a JPEG.
 *
 * Call it at the moment of the pause, before any menu covers the HUD: what it
 * reads, it reads then. A WebGL canvas keeps its last frame to be read only if
 * it was made with `preserveDrawingBuffer: true`, or if this is called in the
 * same task as the draw; otherwise the frame comes back black. The HTML over
 * the canvas is drawn in through an SVG foreignObject, with every `<style>` on
 * the page; where the browser will not draw it, the frame goes without it, and
 * says so (`hud: false`). In Extra Sapien, in Chromium, against the browser's
 * own screenshot, 473 pixels of 921,600 differed by more than 2%, every one on
 * the edge of a ring or a letter.
 */
export interface Frame {
    blob: Blob | null;
    width: number;
    height: number;
    /** Whether the HTML over the canvas could be drawn into it. */
    hud: boolean;
}

export interface CaptureOptions {
    /** The HTML drawn over the canvas (the HUD), drawn into the frame too. */
    overlay?: HTMLElement | null;
    /** Selectors for what under the overlay is left out: menus, this page. */
    exclude?: readonly string[];
    /** The widest frame kept, in pixels; a wider screen's is scaled down to it. */
    width?: number;
    /** JPEG's quality: at 0.85 a 1280×720 frame was 110–164 kB and took 35 ms, in Extra Sapien. */
    quality?: number;
}

export const CAPTURE = { width: 1920, quality: 0.85 };

export function captureFrame(canvas: HTMLCanvasElement, o: CaptureOptions = {}): Promise<Frame> {
    const quality = o.quality ?? CAPTURE.quality;
    const scale = Math.min(1, (o.width ?? CAPTURE.width) / Math.max(1, canvas.width));
    const width = Math.max(1, Math.round(canvas.width * scale));
    const height = Math.max(1, Math.round(canvas.height * scale));
    const plain = document.createElement("canvas");
    plain.width = width;
    plain.height = height;
    const ctx = plain.getContext("2d");
    if (!ctx) return Promise.resolve({ blob: null, width, height, hud: false });
    ctx.drawImage(canvas, 0, 0, width, height);
    const overlay = o.overlay;
    if (!overlay) return jpeg(plain, quality).then((blob) => ({ blob, width, height, hud: true }));
    // The overlay's own canvases do not serialize: copied now, in place.
    const box = canvas.getBoundingClientRect();
    const sx = width / Math.max(1, box.width);
    const sy = height / Math.max(1, box.height);
    const panes = document.createElement("canvas");
    panes.width = width;
    panes.height = height;
    const pctx = panes.getContext("2d");
    const exclude = o.exclude ?? [];
    for (const c of overlay.querySelectorAll("canvas")) {
        const b = c.getBoundingClientRect();
        if (b.width === 0 || b.height === 0 || !shown(c)) continue;
        if (exclude.some((s) => c.closest(s))) continue;
        pctx?.drawImage(
            c,
            (b.left - box.left) * sx,
            (b.top - box.top) * sy,
            b.width * sx,
            b.height * sy,
        );
    }
    const svg = overlaySvg(overlay, exclude, box.width, box.height, width, height);
    return new Promise((resolve) => {
        const done = (blob: Blob | null, hud: boolean): void =>
            resolve({ blob, width, height, hud });
        const alone = (): void => {
            jpeg(plain, quality).then(
                (b) => done(b, false),
                () => done(null, false),
            );
        };
        const img = new Image();
        img.onload = () => {
            const out = document.createElement("canvas");
            out.width = width;
            out.height = height;
            const g = out.getContext("2d");
            if (!g) return alone();
            g.drawImage(plain, 0, 0);
            g.drawImage(img, 0, 0, width, height);
            g.drawImage(panes, 0, 0);
            // A browser that will not read back what it drew (a "tainted" canvas) throws here.
            jpeg(out, quality).then((b) => done(b, true), alone);
        };
        img.onerror = alone;
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
}

function shown(el: Element): boolean {
    return typeof el.checkVisibility === "function"
        ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
        : true;
}

/** The overlay as it stands, as an SVG the browser can draw, with every style on the page. */
function overlaySvg(
    overlay: HTMLElement,
    exclude: readonly string[],
    cssW: number,
    cssH: number,
    w: number,
    h: number,
): string {
    const clone = overlay.cloneNode(true) as HTMLElement;
    for (const s of exclude) for (const el of clone.querySelectorAll(s)) el.remove();
    for (const c of clone.querySelectorAll("canvas")) c.remove();
    const css = [...document.querySelectorAll("style")]
        .map((s) => s.textContent ?? "")
        .join("\n")
        // An overlay the viewport's height is, in the SVG, the frame's.
        .replace(/100vh/g, `${cssH}px`)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;");
    const html = new XMLSerializer().serializeToString(clone);
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${cssW} ${cssH}">` +
        `<foreignObject x="0" y="0" width="${cssW}" height="${cssH}">` +
        `<div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${cssW}px;height:${cssH}px;overflow:hidden">` +
        `<style>${css}</style>${html}</div></foreignObject></svg>`
    );
}

export function jpeg(c: HTMLCanvasElement, quality = CAPTURE.quality): Promise<Blob | null> {
    return new Promise((ok, fail) => {
        try {
            c.toBlob((b) => ok(b), "image/jpeg", quality);
        } catch (e) {
            fail(e);
        }
    });
}
