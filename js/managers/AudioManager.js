/* =============================================================================
 * AudioManager.js — Procedural sound using the Web Audio API.
 *
 * The game ships with no audio files: every sound effect and the gentle
 * background pad are synthesised with oscillators. This keeps the game tiny and
 * fully self-contained, and still gives players clear audio feedback that can
 * be muted (spec D.6: "Audio ON/OFF", "dapat dimatikan oleh pengguna").
 * ===========================================================================*/

const AudioManager = {
  ctx: null,
  master: null,
  musicGain: null,
  muted: false,
  _musicNodes: null,

  init() {
    // Restore mute preference.
    try {
      this.muted = localStorage.getItem('pe_muted') === '1';
    } catch (e) { this.muted = false; }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return; // Graceful: game still works silently.
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.0;
      this.musicGain.connect(this.master);
    } catch (e) {
      this.ctx = null;
    }

    this._installUnlock();
  },

  // Browsers (especially iOS/Safari) keep a new AudioContext "suspended" until a
  // real user gesture, and do NOT auto-resume it — you must call resume() from
  // inside the gesture. We listen globally so the very first tap/click/key press
  // anywhere unlocks audio, then remove the listeners once it's running.
  _installUnlock() {
    if (this._unlockInstalled) return;
    this._unlockInstalled = true;
    const events = ['pointerdown', 'touchstart', 'mousedown', 'keydown'];
    const handler = () => {
      this.resume();
      // Kick the ambient pad going once we're unlocked (unless muted).
      if (this.ctx && this.ctx.state === 'running') {
        if (!this.muted) this.startMusic();
        events.forEach((ev) => window.removeEventListener(ev, handler, true));
        this._unlockInstalled = false;
      }
    };
    events.forEach((ev) => window.addEventListener(ev, handler, true));
  },

  // Browsers block audio until a user gesture; call this on first tap.
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  isMuted() { return this.muted; },

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('pe_muted', m ? '1' : '0'); } catch (e) {}
    if (this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(m ? 0 : 0.9, now, 0.05);
    }
  },

  toggleMute() { this.setMuted(!this.muted); return this.muted; },

  // --- low-level tone helper -------------------------------------------------
  _tone(freq, start, dur, { type = 'sine', gain = 0.25, glideTo = null } = {}) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  // --- named effects ---------------------------------------------------------
  click() { this._tone(520, 0, 0.09, { type: 'triangle', gain: 0.18 }); },

  hover() { this._tone(680, 0, 0.05, { type: 'sine', gain: 0.08 }); },

  correct() {
    // Rising happy arpeggio C-E-G-C
    [523, 659, 784, 1046].forEach((f, i) =>
      this._tone(f, i * 0.08, 0.18, { type: 'triangle', gain: 0.22 }));
  },

  wrong() {
    this._tone(220, 0, 0.22, { type: 'sawtooth', gain: 0.16, glideTo: 130 });
  },

  pop() { this._tone(880, 0, 0.08, { type: 'sine', gain: 0.16, glideTo: 1200 }); },

  star() {
    [1046, 1318, 1568].forEach((f, i) =>
      this._tone(f, i * 0.09, 0.22, { type: 'sine', gain: 0.2 }));
  },

  fanfare() {
    const seq = [523, 523, 523, 659, 784, 1046];
    const times = [0, 0.14, 0.28, 0.42, 0.58, 0.78];
    seq.forEach((f, i) =>
      this._tone(f, times[i], 0.3, { type: 'triangle', gain: 0.24 }));
  },

  whoosh() { this._tone(300, 0, 0.25, { type: 'sine', gain: 0.1, glideTo: 900 }); },

  // --- gentle ambient background pad ----------------------------------------
  startMusic() {
    if (!this.ctx || this._musicNodes) return;
    const notes = [130.81, 196.0, 261.63]; // low C, G, C chord
    const nodes = [];
    notes.forEach((f) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = 0.06;
      // slow tremolo so the pad breathes
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.12 + Math.random() * 0.08;
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start();
      lfo.start();
      nodes.push(osc, lfo);
    });
    this._musicNodes = nodes;
    const now = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(0.5, now, 1.5);
  },
};
