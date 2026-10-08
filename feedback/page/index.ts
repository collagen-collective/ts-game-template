/**
 * The feedback page, for any game: import it from here.
 *
 *   const feedback = new FeedbackPage({ build: __BUILD__, onClose: () => resumeMenu() });
 *   // At the pause, before a menu covers the HUD:
 *   feedback.keep(canvas, { title: "The Bridge", parts: [...] }, hudElement);
 *   // From the pause menu, offered only when `feedback.available`:
 *   feedback.open();
 *
 * `feedback/README.md` has the rest.
 */
export { FeedbackPage, browserPart, PROMPT, type FeedbackOptions } from "./page.ts";
export { captureFrame, CAPTURE, type CaptureOptions, type Frame } from "./capture.ts";
export { type Mark, markData, paintMarks } from "./marks.ts";
export {
    KINDS,
    reportFiles,
    reportMarkdown,
    reportState,
    stampOf,
    type Draft,
    type Kind,
    type Part,
    type Snapshot,
} from "./report.ts";
export { endpoint, post, takeKey, type Answer } from "./send.ts";
export { Trace } from "./trace.ts";
