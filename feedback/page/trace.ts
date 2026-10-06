/**
 * The last few seconds of the game, for a report: what a game samples as it
 * steps, kept for as long as it is wanted and no longer. Extra Sapien sent the
 * last ten seconds, ten times a second, as `trace.json`, and its function took
 * the file unchanged.
 *
 *   const trace = new Trace<Sample>(10, 0.1);
 *   // each step: trace.offer(simSeconds, () => sampleOf(world));
 *   // at the pause: { id: "trace", label: "the last ten seconds", file: { name: "trace.json", data: trace.all() } }
 */
export class Trace<T> {
    private readonly kept: { t: number; v: T }[] = [];
    private next = -Infinity;

    /** @param seconds how far back it keeps @param every how often it samples, in the game's seconds */
    constructor(
        readonly seconds = 10,
        readonly every = 0.1,
    ) {}

    /** At time `t`, a sample if one is due: `sample` is called only then. */
    offer(t: number, sample: () => T): void {
        if (t < this.next) return;
        this.next = t + this.every;
        this.kept.push({ t, v: sample() });
        while (this.kept.length > 0 && this.kept[0]!.t < t - this.seconds) this.kept.shift();
    }

    /** What it holds, oldest first, each with its time. */
    all(): { t: number; v: T }[] {
        return this.kept.slice();
    }

    clear(): void {
        this.kept.length = 0;
        this.next = -Infinity;
    }
}
