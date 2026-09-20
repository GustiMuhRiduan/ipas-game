/* =============================================================================
 * HudScene — Indikator perkembangan pemain (spec D.1 & D.7) + navigation.
 *
 * Runs as an overlay ON TOP of the active level scene, so every level shares
 * the same heads-up display: LEVEL x/3, score, lives (hearts), a mission
 * progress bar, and the utility buttons (pause, home, audio, fullscreen).
 *
 * A level scene launches it with:
 *   this.scene.launch(SCENES.HUD, { levelKey, levelNo, lives, maxProgress, mission })
 * and then drives it via the public setters below (setScore/setLives/…).
 * ===========================================================================*/

class HudScene extends Phaser.Scene {
  constructor() {
    super(SCENES.HUD);
  }

  init(data) {
    this.levelKey = data.levelKey;
    this.levelNo = data.levelNo || 1;
    this.lives = data.lives != null ? data.lives : START_LIVES;
    this.maxLives = this.lives;
    this.score = 0;
    this.maxProgress = data.maxProgress || 1;
    this.progress = 0;
    this.missionText = data.mission || '';
  }

  create() {
    // ---- Top bar background ----
    const barG = this.add.graphics();
    UI.roundRect(barG, 12, 10, GAME_WIDTH - 24, 78, 22, COLORS.deep, 0.9);

    // Level indicator (far left)
    this.add.text(40, 26, 'LEVEL', { fontFamily: FONT, fontSize: '15px', color: '#bfe9ee', fontStyle: 'bold' });
    this.levelLabel = this.add.text(40, 44, `${this.levelNo} / ${TOTAL_LEVELS}`, {
      fontFamily: FONT, fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
    });

    // Score (left cluster, next to level)
    this.scoreLabel = this.add.text(178, 26, '⭐ SKOR', {
      fontFamily: FONT, fontSize: '15px', color: '#bfe9ee', fontStyle: 'bold',
    }).setOrigin(0, 0);
    this.scoreValue = this.add.text(178, 42, '0', {
      fontFamily: FONT, fontSize: '30px', color: CSS.accent, fontStyle: 'bold',
    }).setOrigin(0, 0);

    // Mission progress bar (centre)
    this.add.text(GAME_WIDTH / 2, 22, 'MISI', {
      fontFamily: FONT, fontSize: '14px', color: '#bfe9ee', fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.barX = GAME_WIDTH / 2 - 190;
    this.barY = 48;
    this.barW = 380;
    this.barH = 22;
    this.barFill = this.add.graphics();
    this.barBg = this.add.graphics();
    this.barBg.fillStyle(0x0a3a42, 1);
    this.barBg.fillRoundedRect(this.barX, this.barY, this.barW, this.barH, 11);
    this.progressText = this.add.text(GAME_WIDTH / 2, this.barY + this.barH / 2, '0%', {
      fontFamily: FONT, fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    // Lives / hearts (between the progress bar and the utility cluster)
    this.add.text(this.barX + this.barW + 28, 26, 'NYAWA', {
      fontFamily: FONT, fontSize: '14px', color: '#bfe9ee', fontStyle: 'bold',
    });
    this.heartsX = this.barX + this.barW + 28;
    this.heartsY = 46;
    this.heartsContainer = this.add.container(0, 0);
    this._drawHearts();

    // ---- Utility buttons (top-right cluster) ----
    let bx = GAME_WIDTH - 52;
    const by = 49;
    this.fsBtn = UI.iconButton(this, bx, by, { icon: '⛶', d: 52, color: COLORS.white,
      onClick: () => this._toggleFullscreen() });
    bx -= 62;
    this.audioBtn = UI.iconButton(this, bx, by, {
      icon: AudioManager.isMuted() ? '🔇' : '🔊', d: 52, color: COLORS.white,
      onClick: () => { const m = AudioManager.toggleMute(); this.audioBtn.setIcon(m ? '🔇' : '🔊'); if (!m) AudioManager.startMusic(); },
    });
    bx -= 62;
    this.pauseBtn = UI.iconButton(this, bx, by, { icon: '⏸️', d: 52, color: COLORS.accent,
      onClick: () => this._pause() });
    bx -= 62;
    this.homeBtn = UI.iconButton(this, bx, by, { icon: '🏠', d: 52, color: COLORS.white,
      onClick: () => this._pause(true) });

    this.updateProgress(0);
  }

  // ---------------- Public API used by level scenes ----------------
  setMission(text) { this.missionText = text; }

  addScore(points) {
    this.score += points;
    this.scoreValue.setText(String(this.score));
    this.tweens.add({ targets: this.scoreValue, scale: { from: 1.4, to: 1 }, duration: 300, ease: 'Back.out' });
  }

  getScore() { return this.score; }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this._drawHearts();
    this.cameras.main.shake(200, 0.006);
    return this.lives;
  }

  getLives() { return this.lives; }

  // progress: number of steps completed (0..maxProgress)
  updateProgress(step) {
    this.progress = Phaser.Math.Clamp(step, 0, this.maxProgress);
    const pct = this.progress / this.maxProgress;
    this.barFill.clear();
    if (pct > 0) {
      this.barFill.fillStyle(COLORS.good, 1);
      this.barFill.fillRoundedRect(this.barX, this.barY, Math.max(this.barH, this.barW * pct), this.barH, 11);
    }
    this.progressText.setText(Math.round(pct * 100) + '%');
  }

  _drawHearts() {
    this.heartsContainer.removeAll(true);
    for (let i = 0; i < this.maxLives; i++) {
      const alive = i < this.lives;
      const h = this.add.text(this.heartsX + i * 34, this.heartsY, alive ? '❤️' : '🖤', { fontSize: '26px' })
        .setOrigin(0, 0.5);
      if (!alive) h.setAlpha(0.4);
      this.heartsContainer.add(h);
    }
  }

  _toggleFullscreen() {
    if (this.scale.isFullscreen) this.scale.stopFullscreen();
    else this.scale.startFullscreen();
  }

  // ---------------- Pause menu ----------------
  _pause(goHomeAfter = false) {
    if (this._paused) return;
    this._paused = true;
    if (this.levelKey) this.scene.pause(this.levelKey);

    const scrim = UI.scrim(this, 0.6, 950);
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(960);
    panel.add(UI.panel(this, 0, 0, 520, 420, { color: COLORS.panel }));
    panel.add(this.add.text(0, -150, goHomeAfter ? 'Keluar ke Menu?' : '⏸️  Jeda', {
      fontFamily: FONT, fontSize: '36px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0.5));

    const cleanup = () => { this._paused = false; scrim.destroy(); panel.destroy(); };
    const resume = () => { cleanup(); if (this.levelKey) this.scene.resume(this.levelKey); };

    if (goHomeAfter) {
      panel.add(this.add.text(0, -80, 'Kemajuan level ini tidak tersimpan.', {
        fontFamily: FONT, fontSize: '18px', color: CSS.inkSoft, align: 'center', wordWrap: { width: 440 },
      }).setOrigin(0.5));
      panel.add(UI.button(this, 0, -10, { label: 'Ya, ke Menu', icon: '🏠', w: 320, h: 66, fontSize: 24, color: COLORS.primary,
        onClick: () => { cleanup(); this._exitTo(SCENES.SELECT); } }));
      panel.add(UI.button(this, 0, 80, { label: 'Lanjut Bermain', icon: '▶', w: 320, h: 66, fontSize: 24, color: COLORS.good,
        onClick: resume }));
    } else {
      panel.add(UI.button(this, 0, -70, { label: 'Lanjutkan', icon: '▶', w: 340, h: 66, fontSize: 24, color: COLORS.good,
        onClick: resume }));
      panel.add(UI.button(this, 0, 10, { label: 'Ulangi Level', icon: '🔁', w: 340, h: 66, fontSize: 24, color: COLORS.accent,
        textColor: CSS.ink, onClick: () => { cleanup(); this._restart(); } }));
      panel.add(UI.button(this, 0, 90, { label: 'Menu Utama', icon: '🏠', w: 340, h: 66, fontSize: 24, color: COLORS.primary,
        onClick: () => { cleanup(); this._exitTo(SCENES.SELECT); } }));
      const audioLabel = AudioManager.isMuted() ? 'Suara: MATI' : 'Suara: NYALA';
      const ab = UI.button(this, 0, 168, { label: audioLabel, icon: '🔊', w: 340, h: 54, fontSize: 20, color: COLORS.inkSoft,
        onClick: () => { const m = AudioManager.toggleMute(); ab.setLabelText(m ? 'Suara: MATI' : 'Suara: NYALA'); if (!m) AudioManager.startMusic(); this.audioBtn.setIcon(m ? '🔇' : '🔊'); } });
      panel.add(ab);
    }
  }

  _restart() {
    const key = this.levelKey;
    this.scene.stop(key);
    this.scene.stop();
    this.scene.start(key);
  }

  _exitTo(key) {
    this.scene.stop(this.levelKey);
    this.scene.stop();
    this.scene.start(key);
  }
}
