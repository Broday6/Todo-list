"""
Procedural soundtrack generator — every sound is synthesised from math with numpy.
  python3 audio.py <video> <duration_seconds> <shots.json> <out.wav>
cav  : 120 BPM upbeat ad track, hits land on the cut points
cev/mov : 84 BPM warm, understated bed that sits under a voice-over
"""
import json
import sys
import wave

import numpy as np

SR = 44100
rs = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env_adsr(n, a, d, s, r, sus_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus = max(0, n - a - d - r) if sus_len is None else int(sus_len * SR)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(sus, s), np.linspace(s, 0, max(r, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def lowpass(x, cutoff, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** (2 * order))
    return np.fft.irfft(X, len(x))


def highpass(x, cutoff, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / np.sqrt(1 + (f / cutoff) ** (2 * order))
    return np.fft.irfft(X, len(x))


def saw(freq, n, detune=0.0, harmonics=18):
    t = np.arange(n) / SR
    out = np.zeros(n)
    f = freq * (1 + detune)
    for h in range(1, harmonics + 1):
        if f * h > 16000:
            break
        out += np.sin(2 * np.pi * f * h * t + h * 0.3) / h
    return out * 0.55


def add(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= buf.shape[1]:
        return
    j = min(buf.shape[1], i + len(sig))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += sig[: j - i] * gain * l * 1.414
    buf[1, i:j] += sig[: j - i] * gain * r * 1.414


# ── instruments ────────────────────────────────────────────────────────────
def kick(big=False):
    n = int((0.9 if big else 0.45) * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * (4 if big else 9)) + 0.15 * rs.standard_normal(n) * np.exp(-t * 120)


def snare():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    nz = highpass(rs.standard_normal(n), 1800) * np.exp(-t * 22)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return nz * 0.55 + body * 0.4


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    return highpass(rs.standard_normal(n), 7000) * np.exp(-t * (14 if open_ else 70)) * 0.5


def pluck(note, dur=1.2, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(note)
    out = np.zeros(n)
    for h, a in [(1, 1), (2, 0.5 * bright), (3, 0.25 * bright), (4, 0.12 * bright), (5, 0.06 * bright)]:
        out += a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.5 + h * 1.8))
    return out * np.minimum(1, t * 400)


def pad_chord(notes, dur, attack=0.8, release=1.2, cutoff=1800):
    n = int((dur + release) * SR)
    sig = np.zeros(n)
    for k, nt in enumerate(notes):
        for d in (-0.004, 0.0, 0.005):
            sig += saw(midi(nt), n, d, harmonics=10)
    sig = lowpass(sig, cutoff)
    return sig * env_adsr(n, attack, 0.5, 0.8, release, sus_len=max(0, dur - attack - 0.5)) / (len(notes) * 3)


def bass_note(note, dur, cutoff=600):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = saw(midi(note), n, harmonics=8) + 0.6 * np.sin(2 * np.pi * midi(note) * t)
    return lowpass(sig, cutoff) * env_adsr(n, 0.005, 0.1, 0.7, 0.06)


def riser(dur):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    nz = rs.standard_normal(n)
    # crossfade from dark to bright noise = rising sweep
    dark, bright = lowpass(nz, 600), highpass(nz, 3000)
    return (dark * (1 - t) + bright * t) * t ** 2 * 0.5


def whoosh(dur=0.5):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t) ** 2
    return lowpass(rs.standard_normal(n), 2500) * e * 0.5


def reverb(buf, decay=2.2, mix=0.25):
    n = int(decay * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(buf)
    for ch in range(2):
        ir = rs.standard_normal(n) * np.exp(-t * 6.9 / decay)
        ir = lowpass(ir, 5000)
        ir /= np.sqrt(np.sum(ir ** 2))
        L = len(buf[ch]) + n
        size = 1 << (L - 1).bit_length()
        wet = np.fft.irfft(np.fft.rfft(buf[ch], size) * np.fft.rfft(ir, size), size)[: len(buf[ch])]
        out[ch] = buf[ch] * (1 - mix) + wet * mix * 3
    return out


# ── arrangements ───────────────────────────────────────────────────────────
def track_cav(dur, cuts):
    buf = np.zeros((2, int((dur + 2) * SR)))
    bpm, beat = 120, 0.5
    bar = beat * 4
    # D major: I V vi IV
    prog = [(50, [62, 66, 69, 74]), (45, [61, 64, 69, 73]), (47, [62, 66, 71, 74]), (43, [62, 67, 71, 74])]
    drop, breakdown, end = 4.0, 33.5, 37.0
    # intro: pad swell + riser into the title drop, ticks on the macro cuts
    add(buf, pad_chord(prog[0][1], drop, attack=2.0, cutoff=900), 0, 0.5)
    add(buf, riser(drop - 0.2), 0.2, 0.35)
    for c in cuts:
        if c < drop:
            add(buf, kick(), c, 0.5)
            add(buf, hat(True), c, 0.4, 0.3)
    add(buf, kick(True), drop, 1.0)
    add(buf, whoosh(0.6), drop - 0.4, 0.4)
    # main groove
    t = drop
    k = 0
    while t < breakdown - 1e-6:
        root, chord = prog[k % 4]
        add(buf, pad_chord(chord, bar, attack=0.05, release=0.6, cutoff=2200), t, 0.33)
        for b in range(4):
            tb = t + b * beat
            if tb >= breakdown:
                break
            add(buf, kick(), tb, 0.85)
            if b % 2 == 1:
                add(buf, snare(), tb, 0.45, -0.1)
            add(buf, hat(), tb + beat / 2, 0.35, 0.35)
            add(buf, hat(), tb + beat / 4 * 3, 0.15, 0.4)
            add(buf, bass_note(root - 12 + (7 if b == 3 else 0), beat * 0.9), tb, 0.55)
            add(buf, bass_note(root - 12, beat * 0.4), tb + beat / 2, 0.35)
        # pluck arpeggio, 8ths
        for s in range(8):
            ts = t + s * beat / 2
            if ts >= breakdown:
                break
            add(buf, pluck(chord[s % 4] + 12, 0.6), ts, 0.18, 0.5 if s % 2 else -0.5)
        t += bar
        k += 1
    # cut accents
    for c in cuts:
        if drop < c < end:
            add(buf, whoosh(0.35), c - 0.25, 0.28)
    # breakdown: pad + soft plucks, riser into logo
    add(buf, pad_chord(prog[2][1], end - breakdown, attack=0.3, cutoff=1400), breakdown, 0.45)
    for s in range(7):
        add(buf, pluck(prog[2][1][s % 4] + 12, 1.0, 0.6), breakdown + s * beat, 0.15)
    add(buf, riser(end - breakdown - 0.1), breakdown + 0.1, 0.3)
    # logo hit + ring out
    add(buf, kick(True), end, 1.0)
    add(buf, pad_chord([50, 57, 62, 66, 69], 2.2, attack=0.02, release=1.5, cutoff=2600), end, 0.5)
    add(buf, pluck(74 + 12, 2.5, 0.4), end, 0.25)
    return buf


def track_bed(dur, cuts, seed=1):
    buf = np.zeros((2, int((dur + 3) * SR)))
    bpm = 84
    beat = 60 / bpm
    bar = beat * 4
    # G: Gmaj7 Em7 Cmaj7 D6
    prog = [(43, [59, 62, 66, 67]), (40, [59, 62, 64, 67]), (36, [59, 60, 64, 67]), (38, [57, 59, 62, 66])]
    rng = np.random.default_rng(seed)
    t, k = 0.0, 0
    tail = 6.0  # final bars resolve under the end card
    while t < dur - 0.01:
        root, chord = prog[k % 4]
        final = t >= dur - tail
        if final:
            root, chord = prog[0]
        L = min(bar, dur - t)
        add(buf, pad_chord(chord, L, attack=0.9, release=1.6, cutoff=1300), t, 0.42)
        add(buf, bass_note(root - 12, L * 0.95, cutoff=380), t, 0.32)
        intro = t < bar * 2
        for b in range(4):
            tb = t + b * beat
            if tb >= dur:
                break
            if not intro and not final:
                if b in (0, 2):
                    add(buf, kick() * 0.6, tb, 0.45)
                add(buf, hat(), tb + beat / 2, 0.12, 0.3)
                if b in (1, 3):
                    add(buf, snare() * 0.4, tb, 0.18)
        # gentle arpeggio with a little randomness
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for s in range(8):
            ts = t + s * beat / 2
            if ts >= dur:
                break
            if rng.random() < (0.55 if not intro else 0.35):
                add(buf, pluck(chord[pattern[s]] + 12, 1.4, 0.5), ts, 0.14, rng.uniform(-0.6, 0.6))
        t += bar
        k += 1
    # soft swells on chapter changes
    for c in cuts:
        add(buf, whoosh(0.8), max(0, c - 0.5), 0.08)
    add(buf, pluck(79, 3.0, 0.3), dur - tail + 0.5, 0.2)
    return buf


def main():
    video, dur, shots_path, out = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
    info = json.load(open(shots_path))
    cuts = [s["t0"] for s in info["shots"][1:]]
    if video == "cav":
        buf = track_cav(dur, cuts)
    else:
        chapter_cuts = [s["t0"] for s in info["shots"] if s.get("label", "").startswith("Chapter")]
        buf = track_bed(dur, chapter_cuts, seed=3 if video == "mov" else 1)
    buf = reverb(buf, 2.4 if video != "cav" else 1.6, 0.22)
    buf = buf[:, : int(dur * SR)]
    # master: fades, soft clip, normalise to about -1 dBFS
    n = buf.shape[1]
    fade = np.ones(n)
    fi, fo = int(0.05 * SR), int(1.2 * SR)
    fade[:fi] = np.linspace(0, 1, fi)
    fade[-fo:] = np.linspace(1, 0, fo)
    buf *= fade
    buf = np.tanh(buf / (np.max(np.abs(buf)) + 1e-9) * 1.4)
    buf = buf / np.max(np.abs(buf)) * 0.89
    pcm = (buf.T * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("audio ->", out)


if __name__ == "__main__":
    main()
