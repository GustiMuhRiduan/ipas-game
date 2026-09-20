/* =============================================================================
 * MenuScene — Laman muka / halaman utama (spec D.1 & D.4).
 * Big title, a bouncing mascot, and the primary navigation: Mulai, Panduan,
 * plus Audio and Fullscreen toggles.
 * ===========================================================================*/

class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create() {
    UI.sky(this);
    AudioManager.startMusic();

    // Little energy characters floating in the sky.
    this._floaters(['☀️', '💡', '🌬️', '💧', '🍃', '🔆']);

    // Title card
    const title = this.add
      .text(GAME_WIDTH / 2, 150, CONTENT.game.title, {
        fontFamily: FONT, fontSize: '84px', color: CSS.primaryDark, fontStyle: 'bold',
      })
      .setOrigin(0.5);
    title.setStroke('#ffffff', 10);
    title.setShadow(0, 6, 'rgba(10,58,66,0.35)', 8, true, true);
    this.tweens.add({ targets: title, y: 140, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inout' });

    this.add
      .text(GAME_WIDTH / 2, 232, CONTENT.game.subtitle, {
        fontFamily: FONT, fontSize: '28px', color: CSS.ink, fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 278, 'Game Edukasi IPAS • Fase C • Kelas 5–6 SD', {
        fontFamily: FONT, fontSize: '20px', color: CSS.inkSoft,
      })
      .setOrigin(0.5);

    // Mascot: a friendly light-bulb hero
    const mascot = this.add.text(GAME_WIDTH / 2, 400, '💡', { fontSize: '110px' }).setOrigin(0.5);
    this.tweens.add({ targets: mascot, scale: 1.08, angle: 4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inout' });

    // Primary buttons
    UI.button(this, GAME_WIDTH / 2, 540, {
      label: 'MULAI', icon: '▶', w: 300, h: 84, fontSize: 34, color: COLORS.accent,
      textColor: CSS.ink,
      onClick: () => this._go(SCENES.SELECT),
    });

    UI.button(this, GAME_WIDTH / 2, 636, {
      label: 'PANDUAN', icon: '📖', w: 260, h: 66, fontSize: 24, color: COLORS.primary,
      onClick: () => this._go(SCENES.GUIDE),
    });

    // Total stars badge (progress indicator on the front page)
    const total = Progress.totalStars();
    const badge = this.add.container(GAME_WIDTH / 2, 690);
    const bg = this.add.graphics();
    UI.roundRect(bg, -110, -20, 220, 40, 20, COLORS.white, 0.9);
    badge.add(bg);
    badge.add(this.add.text(0, 0, `⭐ Bintang terkumpul: ${total} / ${TOTAL_LEVELS * 3}`, {
      fontFamily: FONT, fontSize: '20px', color: CSS.accentDark, fontStyle: 'bold',
    }).setOrigin(0.5));

    // Top-right utility buttons
    this._utilityButtons();

    // Reset-progress (small, bottom-left) — handy for classrooms/teachers.
    UI.iconButton(this, 60, GAME_HEIGHT - 56, {
      icon: '🗑️', d: 50, color: COLORS.panelSoft,
      onClick: () => this._confirmReset(),
    });
    this.add.text(60, GAME_HEIGHT - 22, 'Reset', {
      fontFamily: FONT, fontSize: '14px', color: CSS.ink,
    }).setOrigin(0.5);
  }

  _utilityButtons() {
    UI.audioButton(this, GAME_WIDTH - 60, 56, 58);
    UI.fullscreenButton(this, GAME_WIDTH - 130, 56, 58);
  }

  _floaters(emojis) {
    emojis.forEach((e, i) => {
      const x = 120 + (i * (GAME_WIDTH - 240)) / (emojis.length - 1);
      const t = this.add.text(x, Phaser.Math.Between(320, 470), e, { fontSize: '46px' }).setOrigin(0.5).setAlpha(0.85);
      this.tweens.add({
        targets: t, y: t.y - Phaser.Math.Between(20, 40), duration: Phaser.Math.Between(1600, 2600),
        yoyo: true, repeat: -1, ease: 'Sine.inout', delay: i * 150,
      });
    });
  }

  _confirmReset() {
    const scrim = UI.scrim(this);
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(910);
    panel.add(UI.panel(this, 0, 0, 560, 300, { color: COLORS.panel }));
    panel.add(this.add.text(0, -90, 'Hapus semua kemajuan?', {
      fontFamily: FONT, fontSize: '30px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0.5));
    panel.add(this.add.text(0, -36, 'Bintang dan level yang terbuka akan kembali ke awal.', {
      fontFamily: FONT, fontSize: '20px', color: CSS.inkSoft, align: 'center', wordWrap: { width: 480 },
    }).setOrigin(0.5));

    const close = () => { scrim.destroy(); panel.destroy(); };
    panel.add(UI.button(this, -130, 70, {
      label: 'Batal', w: 200, h: 64, fontSize: 22, color: COLORS.inkSoft, onClick: close,
    }));
    panel.add(UI.button(this, 130, 70, {
      label: 'Hapus', w: 200, h: 64, fontSize: 22, color: COLORS.bad, onClick: () => {
        Progress.reset(); close(); this.scene.restart();
      },
    }));
  }

  _go(key) {
    this.cameras.main.fadeOut(220, 6, 50, 60);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key));
  }
}
