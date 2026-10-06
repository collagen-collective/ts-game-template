import { describe, expect, it } from "vitest";
import {
    bands,
    BANDS,
    correlation,
    compare,
    kWeighting,
    loudness,
    matched,
    peak,
    shape,
} from "../lib/listen.mjs";

const rate = 48000;
const sine = (hz, amp, seconds, sr = rate) =>
    Float32Array.from(
        { length: Math.round(seconds * sr) },
        (_, i) => amp * Math.sin((2 * Math.PI * hz * i) / sr),
    );

describe("the measures takes.mjs reports", () => {
    it("derives BS.1770's own K-weighting coefficients at 48 kHz", () => {
        const [shelf, highPass] = kWeighting(48000);
        // The standard's table for 48 kHz.
        const want = [
            [1.53512485958697, -2.69169618940638, 1.19839281085285],
            [1, -1.69065929318241, 0.73248077421585],
            [1, -1.99004745483398, 0.99007225036621],
        ];
        shelf.b.forEach((v, i) => expect(v).toBeCloseTo(want[0][i], 6));
        shelf.a.forEach((v, i) => expect(v).toBeCloseTo(want[1][i], 6));
        highPass.a.forEach((v, i) => expect(v).toBeCloseTo(want[2][i], 6));
    });

    it("measures a 997 Hz sine at -20 dBFS in one channel as -23 LUFS, at 48 and 44.1 kHz", () => {
        expect(loudness([sine(997, 0.1, 5)], 48000).integrated).toBeCloseTo(-23.01, 1);
        expect(loudness([sine(997, 0.1, 5, 44100)], 44100).integrated).toBeCloseTo(-23.01, 1);
        // The same in both channels of a pair is 3 LU louder.
        const s = sine(997, 0.1, 5);
        expect(loudness([s, s], rate).integrated).toBeCloseTo(-20.0, 1);
    });

    it("gates out silence: a tone with a long silence after it measures as the tone", () => {
        const tone = sine(997, 0.1, 3);
        const withSilence = new Float32Array(tone.length * 4);
        withSilence.set(tone);
        expect(loudness([withSilence], rate).integrated).toBeCloseTo(-23.01, 0);
        expect(loudness([new Float32Array(rate)], rate).integrated).toBe(-Infinity);
    });

    it("finds the peak and counts samples at full scale", () => {
        const s = sine(500, 0.5, 1);
        expect(peak([s]).peak).toBeCloseTo(-6.02, 1);
        expect(peak([s]).clipped).toBe(0);
        const loud = s.map((v) => v * 3);
        expect(peak([loud]).clipped).toBeGreaterThan(0);
    });

    it("puts a 1 kHz tone in the 1 kHz band and its centroid near 1 kHz", () => {
        const b = bands([sine(1000, 0.3, 2)], rate);
        expect(b.bands[BANDS.indexOf(1000)]).toBeGreaterThan(99);
        expect(b.centroid).toBeGreaterThan(950);
        expect(b.centroid).toBeLessThan(1050);
    });

    it("tells the same signal in both channels from unrelated ones", () => {
        const s = sine(300, 0.3, 1);
        expect(correlation([s, s])).toBeCloseTo(1, 6);
        expect(correlation([s, s.map((v) => -v)])).toBeCloseTo(-1, 6);
        let x = 1;
        const noise = () =>
            Float32Array.from(
                { length: rate },
                () => ((x = (x * 16807) % 2147483647) / 2147483647) * 2 - 1,
            );
        expect(Math.abs(correlation([noise(), noise()]))).toBeLessThan(0.05);
    });

    it("times a sound: where it starts, where it is loudest, and how long it rings", () => {
        // Half a second of silence, then a tone dying 60 dB a second.
        const n = rate * 3;
        const x = new Float32Array(n);
        for (let i = rate / 2; i < n; i++) {
            const t = (i - rate / 2) / rate;
            x[i] = 0.5 * Math.pow(10, (-60 * t) / 20) * Math.sin(2 * Math.PI * 440 * t);
        }
        const s = shape([x], rate);
        expect(s.start).toBeCloseTo(0.5, 1);
        expect(s.loudestAt).toBeCloseTo(0.5, 1);
        // 40 dB down at 60 dB a second is two thirds of a second.
        expect(s.ringsFor).toBeGreaterThan(0.6);
        expect(s.ringsFor).toBeLessThan(0.75);
    });

    it("scales a take to a loudness for a listening pair, by its loudest three seconds", () => {
        const m = matched([sine(997, 0.1, 3)], rate, -20);
        expect(loudness(m, rate).shortTerm).toBeCloseTo(-20, 1);
        // Two takes that differ only in a quiet tail are scaled alike.
        const head = sine(997, 0.1, 3);
        const long = new Float32Array(rate * 8);
        long.set(head);
        for (let i = head.length; i < long.length; i++)
            long[i] = 0.003 * Math.sin((2 * Math.PI * 997 * i) / rate);
        const [a] = matched([head], rate, -20);
        const [b] = matched([long], rate, -20);
        expect(Math.abs(a[1000] - b[1000])).toBeLessThan(1e-3 * Math.abs(a[1000]) + 1e-9);
    });

    it("says from when two takes differ, and which octaves changed after", () => {
        // A low hum all through; in the second, a 1 kHz ring goes on past 1 s, where the first cuts it.
        const n = rate * 2;
        const hum = (i) => 0.4 * Math.sin((2 * Math.PI * 60 * i) / rate);
        const ring = (i) => 0.2 * Math.sin((2 * Math.PI * 1000 * i) / rate);
        const cut = Float32Array.from({ length: n }, (_, i) => hum(i) + (i < rate ? ring(i) : 0));
        const whole = Float32Array.from({ length: n }, (_, i) => hum(i) + ring(i));
        const c = compare([cut], [whole], rate);
        expect(c.from).toBeCloseTo(1.0, 2);
        const at = (hz) => c.octaves.find((o) => o.band === hz).change;
        expect(at(1000)).toBeGreaterThan(30);
        expect(Math.abs(at(63))).toBeLessThan(0.5);
        // The same take twice, and one moved by a hair under the floor, do not differ.
        expect(compare([cut], [cut], rate).from).toBeNull();
        expect(compare([cut], [cut.map((v) => v + 1e-6)], rate).from).toBeNull();
    });
});
