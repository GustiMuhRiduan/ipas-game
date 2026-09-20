/* =============================================================================
 * LevelBase — shared behaviour for the three mission scenes.
 *
 * Handles the pieces every level needs the same way: the intro briefing modal,
 * launching/looking up the HUD, the correct/wrong feedback popup with a learning
 * tip, and the win/lose transitions. Concrete levels extend this and implement
 * their own puzzle in create().
 * ===========================================================================*/

class LevelBase extends Phaser.Scene {
  // Launch the HUD overlay for this level.
  startHud({ levelNo, maxProgress, mission }) {
    this.scene.launch(SCENES.HUD, {
      levelKey: this.scene.key,
      levelNo,
      lives: START_LIVES,
      maxProgress,
      mission,
    });
    // HUD renders after this level, so it appears on top.
    this.scene.bringToTop(SCENES.HUD);
  }

  hud() {
    return this.scene.get(SCENES.HUD);
  }

  /**
   * Intro briefing shown before play. Calls onStart when the child taps Mulai.
   */
  showIntro(levelMeta, bodyText, onStart) {
    const scrim = UI.scrim(this, 0.55, 800);
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(810);
    panel.add(UI.panel(this, 0, 0, 820, 440, { color: COLORS.panel }));

    // header strip
    const hg = this.add.graphics();
    UI.roundRect(hg, -410, -220, 820, 96, 26, levelMeta.color, 1);
    UI.roundRect(hg, -410, -160, 820, 40, 0, levelMeta.color, 1);
    panel.add(hg);
    panel.add(this.add.text(-360, -172, levelMeta.icon, { fontSize: '58px' }).setOrigin(0.5));
    panel.add(this.add.text(-300, -196, `Misi ${levelMeta.no}`, {
      fontFamily: FONT, fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    panel.add(this.add.text(-300, -160, levelMeta.title, {
      fontFamily: FONT, fontSize: '34px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0, 0.5));

    panel.add(this.add.text(0, -50, bodyText, {
      fontFamily: FONT, fontSize: '23px', color: CSS.ink, align: 'center',
      lineSpacing: 8, wordWrap: { width: 720 },
    }).setOrigin(0.5));

    panel.add(UI.button(this, 0, 150, {
      label: 'Mulai Misi', icon: '▶', w: 300, h: 76, fontSize: 28, color: COLORS.good,
      onClick: () => {
        this.tweens.add({
          targets: [panel, scrim], alpha: 0, duration: 220,
          onComplete: () => { panel.destroy(); scrim.destroy(); onStart(); },
        });
      },
    }));

    // entrance animation
    panel.setScale(0.7);
    this.tweens.add({ targets: panel, scale: 1, duration: 300, ease: 'Back.out' });
  }

  /**
   * Correct/wrong feedback with a learning tip. Calls onNext after the child
   * taps Lanjut (or after auto-advance).
   */
  showFeedback(correct, tip, onNext) {
    if (correct) AudioManager.correct(); else AudioManager.wrong();

    const scrim = UI.scrim(this, 0.4, 820);
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(830);
    const col = correct ? COLORS.good : COLORS.bad;
    panel.add(UI.panel(this, 0, 0, 720, 340, { color: COLORS.panel }));

    const badge = this.add.text(0, -110, correct ? '✅' : '💡', { fontSize: '76px' }).setOrigin(0.5);
    panel.add(badge);
    panel.add(this.add.text(0, -34, correct ? 'Hebat, benar!' : 'Belum tepat', {
      fontFamily: FONT, fontSize: '34px', color: '#' + col.toString(16).padStart(6, '0'), fontStyle: 'bold',
    }).setOrigin(0.5));
    panel.add(this.add.text(0, 30, tip, {
      fontFamily: FONT, fontSize: '21px', color: CSS.ink, align: 'center',
      lineSpacing: 6, wordWrap: { width: 620 },
    }).setOrigin(0.5));

    panel.add(UI.button(this, 0, 118, {
      label: 'Lanjut', icon: '➡️', w: 240, h: 62, fontSize: 24, color: COLORS.primary,
      onClick: () => { panel.destroy(); scrim.destroy(); if (onNext) onNext(); },
    }));

    panel.setScale(0.8);
    this.tweens.add({ targets: panel, scale: 1, duration: 240, ease: 'Back.out' });
    this.tweens.add({ targets: badge, scale: { from: 0.3, to: 1 }, duration: 400, ease: 'Back.out' });
  }

  /** All missions solved: record progress and move to the result screen. */
  completeLevel(score, maxScore) {
    const stars = starsFor(score, maxScore);
    Progress.recordResult(this.scene.key, stars, score);
    const idx = CONTENT.levels.findIndex((l) => l.key === this.scene.key);
    const nextMeta = CONTENT.levels[idx + 1] || null;

    AudioManager.fanfare();
    this.scene.stop(SCENES.HUD);
    this.scene.start(SCENES.RESULT, {
      levelKey: this.scene.key,
      levelNo: idx + 1,
      score, maxScore, stars,
      nextKey: nextMeta ? nextMeta.key : null,
      isLast: !nextMeta,
    });
  }

  /** Out of lives: offer retry / menu. */
  failLevel() {
    AudioManager.wrong();
    const scrim = UI.scrim(this, 0.65, 840);
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(850);
    panel.add(UI.panel(this, 0, 0, 620, 400, { color: COLORS.panel }));
    panel.add(this.add.text(0, -130, '💔', { fontSize: '70px' }).setOrigin(0.5));
    panel.add(this.add.text(0, -50, 'Nyawa habis!', {
      fontFamily: FONT, fontSize: '38px', color: CSS.bad, fontStyle: 'bold',
    }).setOrigin(0.5));
    panel.add(this.add.text(0, 4, 'Jangan menyerah — kamu pasti bisa.\nAyo coba lagi!', {
      fontFamily: FONT, fontSize: '22px', color: CSS.ink, align: 'center', lineSpacing: 6,
    }).setOrigin(0.5));
    panel.add(UI.button(this, -140, 120, { label: 'Menu', icon: '🏠', w: 220, h: 66, fontSize: 24, color: COLORS.inkSoft,
      onClick: () => { this.scene.stop(SCENES.HUD); this.scene.start(SCENES.SELECT); } }));
    panel.add(UI.button(this, 140, 120, { label: 'Ulangi', icon: '🔁', w: 220, h: 66, fontSize: 24, color: COLORS.accent,
      textColor: CSS.ink, onClick: () => { this.scene.stop(SCENES.HUD); this.scene.restart(); } }));

    panel.setScale(0.8);
    this.tweens.add({ targets: panel, scale: 1, duration: 260, ease: 'Back.out' });
  }
}
