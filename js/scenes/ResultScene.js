/* =============================================================================
 * ResultScene — shown after a level is cleared. Celebrates with stars + score
 * and offers: Ulangi (repeat), Lanjut (next mission), or Peta (level select).
 * ===========================================================================*/

class ResultScene extends Phaser.Scene {
  constructor() {
    super(SCENES.RESULT);
  }

  init(data) {
    this.data = data;
  }

  create() {
    const d = this.data;
    UI.sky(this, true);
    UI.confetti(this, GAME_WIDTH / 2, 80, 110);

    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
    panel.add(UI.panel(this, 0, 0, 760, 520, { color: COLORS.panel }));

    panel.add(this.add.text(0, -196, 'Misi Selesai!', {
      fontFamily: FONT, fontSize: '48px', color: CSS.good, fontStyle: 'bold',
    }).setOrigin(0.5));

    const lv = CONTENT.levels[d.levelNo - 1];
    panel.add(this.add.text(0, -142, `${lv.icon}  ${lv.title}`, {
      fontFamily: FONT, fontSize: '26px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0.5));

    // Stars (animated)
    const stars = UI.starRow(this, 0, -50, 0, 3, 70);
    panel.add(stars);
    this.time.delayedCall(300, () => UI.animateStars(this, stars, d.stars, 200));

    // Score
    const scoreText = this.add.text(0, 60, 'Skor: 0', {
      fontFamily: FONT, fontSize: '34px', color: CSS.accentDark, fontStyle: 'bold',
    }).setOrigin(0.5);
    panel.add(scoreText);
    this._countUp(scoreText, d.score, 'Skor: ');

    // Encouraging line based on stars
    const msg = d.stars >= 3 ? 'Sempurna! Kamu ahli energi! 🌟'
      : d.stars === 2 ? 'Bagus sekali! Terus tingkatkan! 👍'
      : d.stars === 1 ? 'Kerja bagus! Coba raih lebih banyak bintang. 💪'
      : 'Selesai! Ulangi untuk hasil lebih baik. 🙂';
    panel.add(this.add.text(0, 108, msg, {
      fontFamily: FONT, fontSize: '20px', color: CSS.inkSoft,
    }).setOrigin(0.5));

    // Buttons
    panel.add(UI.button(this, -230, 200, { label: 'Ulangi', icon: '🔁', w: 210, h: 66, fontSize: 22, color: COLORS.accent,
      textColor: CSS.ink, onClick: () => this._go(d.levelKey) }));
    panel.add(UI.button(this, 0, 200, { label: 'Peta', icon: '🗺️', w: 210, h: 66, fontSize: 22, color: COLORS.inkSoft,
      onClick: () => this._go(SCENES.SELECT) }));

    if (d.isLast) {
      panel.add(UI.button(this, 230, 200, { label: 'Selesai', icon: '🏆', w: 210, h: 66, fontSize: 22, color: COLORS.good,
        onClick: () => this._go(SCENES.FINISH) }));
    } else {
      panel.add(UI.button(this, 230, 200, { label: 'Lanjut', icon: '➡️', w: 210, h: 66, fontSize: 22, color: COLORS.good,
        onClick: () => this._go(d.nextKey) }));
    }

    panel.setScale(0.75);
    this.tweens.add({ targets: panel, scale: 1, duration: 350, ease: 'Back.out' });
  }

  _countUp(textObj, target, prefix) {
    const obj = { v: 0 };
    this.tweens.add({
      targets: obj, v: target, duration: 900, ease: 'Cubic.out',
      onUpdate: () => textObj.setText(prefix + Math.round(obj.v)),
    });
  }

  _go(key) {
    this.cameras.main.fadeOut(220, 6, 50, 60);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key));
  }
}
