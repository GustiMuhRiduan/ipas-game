/* =============================================================================
 * Progress.js — Persistent player progress.
 *
 * Tracks which levels are unlocked/completed, the best star rating per level,
 * and the total score. Persisted to localStorage so a student can close the
 * tab and come back to their pathway (spec D.1 & D.7: indicator perkembangan).
 * ===========================================================================*/

const Progress = {
  KEY: 'pe_progress_v1',
  data: null,

  _default() {
    return {
      stars: { Level1Scene: 0, Level2Scene: 0, Level3Scene: 0 },
      completed: { Level1Scene: false, Level2Scene: false, Level3Scene: false },
      bestScore: { Level1Scene: 0, Level2Scene: 0, Level3Scene: 0 },
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      this.data = raw ? Object.assign(this._default(), JSON.parse(raw)) : this._default();
    } catch (e) {
      this.data = this._default();
    }
    return this.data;
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {}
  },

  reset() {
    this.data = this._default();
    this.save();
  },

  // A level is unlocked if it's the first, or the previous one is completed.
  isUnlocked(levelKey) {
    const idx = CONTENT.levels.findIndex((l) => l.key === levelKey);
    if (idx <= 0) return true;
    const prev = CONTENT.levels[idx - 1].key;
    return !!this.data.completed[prev];
  },

  // Record a level result; keeps the best stars/score achieved.
  recordResult(levelKey, stars, score) {
    if (!this.data) this.load();
    this.data.completed[levelKey] = true;
    if (stars > (this.data.stars[levelKey] || 0)) this.data.stars[levelKey] = stars;
    if (score > (this.data.bestScore[levelKey] || 0)) this.data.bestScore[levelKey] = score;
    this.save();
  },

  totalStars() {
    return Object.values(this.data.stars).reduce((a, b) => a + b, 0);
  },

  allCompleted() {
    return CONTENT.levels.every((l) => this.data.completed[l.key]);
  },
};
