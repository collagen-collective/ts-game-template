/**
 * What a take of the game's sound measures as, in Node, from its samples:
 * plain numbers a person's ear can be checked against, and a session can
 * compare before and after. Nothing here knows any game.
 *
 * Every function takes `channels` (an array of Float32Array, one per channel,
 * all the same length) and the sample rate in hertz.
 *
 * - Loudness is ITU-R BS.1770-4's: K-weighted, in 400 ms blocks a quarter
 *   apart, gated at -70 LUFS and then 10 LU under the ungated mean. It is the
 *   number streaming services level music by, and the one Extra Sapien matched
 *   its listening pairs on "so that the level does not decide".
 * - Peak is the largest sample (not the true peak between samples).
 * - The envelope is 10 ms windows of the channels' mean square.
 * - The bands are octaves, as shares of the take's power; the centroid is the
 *   power-weighted mean frequency.
 * - Correlation is between the first two channels: 1 is the same signal in
 *   both, 0 unrelated, -1 one the other upside down.
 * - Between two trees, `compare` says from when two takes of one sound
 *   differ, and which octaves changed after that.
 */

const dB = (x) => (x > 0 ? 10 * Math.log10(x) : -Infinity);

/** The two biquads of K-weighting at any sample rate (as libebur128 derives them). */
export function kWeighting(rate) {
    // Stage 1, the head's high shelf.
    let f0 = 1681.974450955533;
    const G = 3.999843853973347;
    let Q = 0.7071752369554196;
    let K = Math.tan((Math.PI * f0) / rate);
    const Vh = Math.pow(10, G / 20);
    const Vb = Math.pow(Vh, 0.4996667741545416);
    let a0 = 1 + K / Q + K * K;
    const shelf = {
        b: [
            (Vh + (Vb * K) / Q + K * K) / a0,
            (2 * (K * K - Vh)) / a0,
            (Vh - (Vb * K) / Q + K * K) / a0,
        ],
        a: [1, (2 * (K * K - 1)) / a0, (1 - K / Q + K * K) / a0],
    };
    // Stage 2, the RLB high-pass.
    f0 = 38.13547087602444;
    Q = 0.5003270373238773;
    K = Math.tan((Math.PI * f0) / rate);
    a0 = 1 + K / Q + K * K;
    const highPass = {
        b: [1, -2, 1],
        a: [1, (2 * (K * K - 1)) / a0, (1 - K / Q + K * K) / a0],
    };
    return [shelf, highPass];
}

function biquad(x, { b, a }) {
    const y = new Float64Array(x.length);
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;
    for (let i = 0; i < x.length; i++) {
        const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
        x2 = x1;
        x1 = x[i];
        y2 = y1;
        y1 = v;
        y[i] = v;
    }
    return y;
}

/**
 * Integrated loudness in LUFS, and the loudest three seconds (short-term,
 * ungated). A take shorter than one block is measured as one block.
 */
export function loudness(channels, rate) {
    const [shelf, highPass] = kWeighting(rate);
    const weighted = channels.map((c) => biquad(biquad(c, shelf), highPass));
    const n = channels[0].length;
    const meanSquares = (from, len) =>
        weighted.map((w) => {
            let s = 0;
            for (let i = from; i < from + len; i++) s += w[i] * w[i];
            return s / len;
        });
    // Surround channels (the fourth and fifth of five) weigh 1.41; the rest 1.
    const weights = channels.map((_, i) => (channels.length === 5 && i >= 3 ? 1.41 : 1));
    const lk = (z) => -0.691 + dB(z.reduce((s, zi, i) => s + weights[i] * zi, 0));
    const block = Math.round(0.4 * rate);
    const step = Math.round(0.1 * rate);
    const blocks = [];
    if (n < block) blocks.push(meanSquares(0, n));
    else for (let at = 0; at + block <= n; at += step) blocks.push(meanSquares(at, block));
    const level = blocks.map(lk);
    const mean = (bs) => bs[0].map((_, i) => bs.reduce((s, b) => s + b[i], 0) / bs.length);
    const loud = blocks.filter((_, j) => level[j] > -70);
    let integrated = -Infinity;
    if (loud.length) {
        const relative = lk(mean(loud)) - 10;
        const kept = blocks.filter((_, j) => level[j] > -70 && level[j] > relative);
        if (kept.length) integrated = lk(mean(kept));
    }
    // Short-term: 3 s windows, a tenth of a second apart.
    const three = Math.round(3 * rate);
    let shortTerm = -Infinity;
    if (n <= three) shortTerm = lk(meanSquares(0, n));
    else
        for (let at = 0; at + three <= n; at += step)
            shortTerm = Math.max(shortTerm, lk(meanSquares(at, three)));
    return { integrated, shortTerm };
}

/** The largest sample, in dBFS, and how many samples reach full scale. */
export function peak(channels) {
    let max = 0;
    let clipped = 0;
    for (const c of channels)
        for (const v of c) {
            const a = Math.abs(v);
            if (a > max) max = a;
            if (a >= 1) clipped++;
        }
    return { peak: 20 * Math.log10(max || 1e-12), clipped };
}

/** The channels' mean square in 10 ms windows, as dB, and the window's length in seconds. */
export function envelope(channels, rate, window = 0.01) {
    const len = Math.max(1, Math.round(window * rate));
    const n = channels[0].length;
    const out = [];
    for (let at = 0; at < n; at += len) {
        let s = 0;
        let k = 0;
        for (const c of channels)
            for (let i = at; i < Math.min(n, at + len); i++) {
                s += c[i] * c[i];
                k++;
            }
        out.push(dB(s / k));
    }
    return { db: out, window: len / rate };
}

/**
 * Where the sound is in time: when it starts (the first window within 40 dB of
 * the loudest), when it is loudest, and how long it rings after that before
 * it stays more than 40 dB down. All in seconds.
 */
export function shape(channels, rate) {
    const { db, window } = envelope(channels, rate);
    let top = 0;
    for (let i = 1; i < db.length; i++) if (db[i] > db[top]) top = i;
    const floor = db[top] - 40;
    const start = db.findIndex((v) => v > floor);
    let end = top;
    for (let i = top; i < db.length; i++) if (db[i] > floor) end = i;
    return {
        start: Math.max(0, start) * window,
        loudestAt: top * window,
        ringsFor: (end - top + 1) * window,
    };
}

/** In-place radix-2 FFT of re/im (length a power of two). */
function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
            [re[i], re[j]] = [re[j], re[i]];
            [im[i], im[j]] = [im[j], im[i]];
        }
    }
    for (let len = 2; len <= n; len <<= 1) {
        const ang = (-2 * Math.PI) / len;
        for (let i = 0; i < n; i += len)
            for (let k = 0; k < len / 2; k++) {
                const wr = Math.cos(ang * k);
                const wi = Math.sin(ang * k);
                const a = i + k;
                const b = a + len / 2;
                const tr = re[b] * wr - im[b] * wi;
                const ti = re[b] * wi + im[b] * wr;
                re[b] = re[a] - tr;
                im[b] = im[a] - ti;
                re[a] += tr;
                im[a] += ti;
            }
    }
}

/** Power spectra of Hann-windowed frames of the channels' mean, `size` long, half overlapping. */
export function spectra(channels, rate, size = 4096) {
    const n = channels[0].length;
    const mono = new Float64Array(n);
    for (const c of channels) for (let i = 0; i < n; i++) mono[i] += c[i] / channels.length;
    const hann = Float64Array.from(
        { length: size },
        (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / size),
    );
    const frames = [];
    for (let at = 0; at === 0 || at + size <= n; at += size / 2) {
        const re = new Float64Array(size);
        const im = new Float64Array(size);
        for (let i = 0; i < size && at + i < n; i++) re[i] = mono[at + i] * hann[i];
        fft(re, im);
        const p = new Float64Array(size / 2);
        for (let k = 0; k < size / 2; k++) p[k] = re[k] * re[k] + im[k] * im[k];
        frames.push(p);
        if (at + size >= n) break;
    }
    return { frames, binHz: rate / size };
}

/** Octave bands from 31.5 Hz to 16 kHz as percentages of the take's power, and the centroid in Hz. */
export const BANDS = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export function bands(channels, rate) {
    const { frames, binHz } = spectra(channels, rate);
    const total = new Float64Array(frames[0].length);
    for (const f of frames) for (let k = 0; k < f.length; k++) total[k] += f[k];
    let all = 0;
    let weighted = 0;
    const share = BANDS.map(() => 0);
    for (let k = 1; k < total.length; k++) {
        const hz = k * binHz;
        all += total[k];
        weighted += total[k] * hz;
        const b = BANDS.findIndex((c) => hz >= c / Math.SQRT2 && hz < c * Math.SQRT2);
        if (b >= 0) share[b] += total[k];
    }
    return {
        bands: share.map((s) => (all > 0 ? (100 * s) / all : 0)),
        centroid: all > 0 ? weighted / all : 0,
    };
}

/** The correlation of the first two channels; 1 for one channel. */
export function correlation(channels) {
    if (channels.length < 2) return 1;
    const [l, r] = channels;
    let lr = 0;
    let ll = 0;
    let rr = 0;
    for (let i = 0; i < l.length; i++) {
        lr += l[i] * r[i];
        ll += l[i] * l[i];
        rr += r[i] * r[i];
    }
    return ll > 0 && rr > 0 ? lr / Math.sqrt(ll * rr) : 1;
}

/** Each octave's level in dB, from the mean power spectrum. */
function octaveLevels(channels, rate) {
    const { frames, binHz } = spectra(channels, rate);
    const level = BANDS.map(() => 0);
    for (const f of frames)
        for (let k = 1; k < f.length; k++) {
            const hz = k * binHz;
            const b = BANDS.findIndex((c) => hz >= c / Math.SQRT2 && hz < c * Math.SQRT2);
            if (b >= 0) level[b] += f[k] / frames.length;
        }
    return level.map(dB);
}

/**
 * Two takes of one sound, before and after: the second from which they differ
 * by more than `floor` dBFS in any sample (null if never), and how much each
 * octave changed from there to the end, in dB. Renders of the same code agree
 * to about -117 dBFS, not to the bit, so -100 is the default floor. This is
 * what both agents in the trial before this shipped worked out by hand: the
 * cut tam-tam's renders matched to -130 dBFS until 3.00 s, where its
 * oscillators had stopped, and after that six partials between 300 Hz and
 * 2 kHz were 22 to 38 dB louder in the fixed one. A cut layer under another
 * that holds on shows here, and in no number for the whole take: the mix's
 * ring-out moved by 0.03 s.
 */
export function compare(before, after, rate, floor = -100) {
    const n = Math.min(before[0].length, after[0].length);
    const nc = Math.min(before.length, after.length);
    const lim = Math.pow(10, floor / 20);
    let from = -1;
    for (let i = 0; i < n && from < 0; i++)
        for (let c = 0; c < nc; c++)
            if (Math.abs(before[c][i] - after[c][i]) > lim) {
                from = i;
                break;
            }
    if (from < 0 && before[0].length === after[0].length) return { from: null, octaves: [] };
    if (from < 0) from = n;
    const tail = (ch) => ch.map((c) => c.subarray(from));
    if (Math.min(before[0].length, after[0].length) - from < 1024)
        return { from: from / rate, octaves: [] };
    const a = octaveLevels(tail(before), rate);
    const b = octaveLevels(tail(after), rate);
    return {
        from: from / rate,
        octaves: BANDS.map((band, i) => ({
            band,
            change: Number.isFinite(a[i]) && Number.isFinite(b[i]) ? b[i] - a[i] : 0,
        })),
    };
}

/** Everything above, for one take. */
export function measure(channels, rate) {
    const { integrated, shortTerm } = loudness(channels, rate);
    return {
        seconds: channels[0].length / rate,
        channels: channels.length,
        rate,
        lufs: integrated,
        loudest3s: shortTerm,
        ...peak(channels),
        ...shape(channels, rate),
        ...bands(channels, rate),
        correlation: correlation(channels),
    };
}

/**
 * A spectrogram small enough to draw: `cols` frames in time by `rows` bands
 * spaced evenly in log frequency from 30 Hz to 16 kHz, in dB.
 */
export function spectrogram(channels, rate, cols = 360, rows = 96) {
    const size = 2048;
    const n = channels[0].length;
    const mono = new Float64Array(n);
    for (const c of channels) for (let i = 0; i < n; i++) mono[i] += c[i] / channels.length;
    const hann = Float64Array.from(
        { length: size },
        (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / size),
    );
    const binHz = rate / size;
    const lo = Math.log(30);
    const hi = Math.log(16000);
    const grid = [];
    for (let c = 0; c < cols; c++) {
        const at = Math.round((c / cols) * Math.max(0, n - size));
        const re = new Float64Array(size);
        const im = new Float64Array(size);
        for (let i = 0; i < size && at + i < n; i++) re[i] = mono[at + i] * hann[i];
        fft(re, im);
        const col = [];
        for (let r = 0; r < rows; r++) {
            const f0 = Math.exp(lo + ((hi - lo) * r) / rows);
            const f1 = Math.exp(lo + ((hi - lo) * (r + 1)) / rows);
            let s = 0;
            let k0 = Math.max(1, Math.floor(f0 / binHz));
            const k1 = Math.max(k0 + 1, Math.ceil(f1 / binHz));
            for (let k = k0; k < k1 && k < size / 2; k++) s += re[k] * re[k] + im[k] * im[k];
            col.push(Math.max(-120, dB(s / (k1 - k0) / ((size * size) / 4))));
        }
        grid.push(col);
    }
    return grid;
}

/** A 32-bit float WAV of the channels. */
export function wav(channels, rate) {
    const n = channels[0].length;
    const nc = channels.length;
    const b = Buffer.alloc(44 + n * nc * 4);
    b.write("RIFF", 0);
    b.writeUInt32LE(36 + n * nc * 4, 4);
    b.write("WAVEfmt ", 8);
    b.writeUInt32LE(16, 16);
    b.writeUInt16LE(3, 20);
    b.writeUInt16LE(nc, 22);
    b.writeUInt32LE(rate, 24);
    b.writeUInt32LE(rate * nc * 4, 28);
    b.writeUInt16LE(nc * 4, 32);
    b.writeUInt16LE(32, 34);
    b.write("data", 36);
    b.writeUInt32LE(n * nc * 4, 40);
    let o = 44;
    for (let i = 0; i < n; i++)
        for (let c = 0; c < nc; c++) {
            b.writeFloatLE(channels[c][i], o);
            o += 4;
        }
    return b;
}

/**
 * The channels scaled so that the take's loudest three seconds measure
 * `target` LUFS, for a listening pair. Not the integrated loudness: its gate
 * lets more quiet blocks in when a tail grows, so a pair that differs only in
 * its tail would be levelled apart, and the identical start of the two would
 * play 1.4 dB apart (found in the trial before this shipped).
 */
export function matched(channels, rate, target) {
    const { shortTerm } = loudness(channels, rate);
    if (!Number.isFinite(shortTerm)) return channels;
    const g = Math.pow(10, (target - shortTerm) / 20);
    return channels.map((c) => c.map((v) => v * g));
}
