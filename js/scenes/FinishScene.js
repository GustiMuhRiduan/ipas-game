/* =============================================================================
 * FinishScene — final celebration after all three missions are cleared.
 * Recaps the total stars and reinforces the big idea of the game.
 * ===========================================================================*/

class FinishScene extends Phaser.Scene {
  constructor() {
    super(SCENES.FINISH);
  }

  create() {
    UI.sky(this, true);
    AudioManager.fanfare();

    // Repeated confetti bursts
    this.confettiTimer = this.time.addEvent({
      delay: 900, loop: true,
      callback: () => UI.confetti(this, Phaser.Math.Between(200, GAME_WIDTH - 200), 60, 60),
    });

    this.add.text(GAME_WIDTH / 2, 110, '🏆 Selamat! 🏆', {
      fontFamily: FONT, fontSize: '72px', color: CSS.accentDark, fontStyle: 'bold',
    }).setOrigin(0.5).setStroke('#ffffff', 10);

    this.add.text(GAME_WIDTH / 2, 180, 'Kamu berhasil menyelamatkan Desa Terang!', {
      fontFamily: FONT, fontSize: '28px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Trophy mascot
    const hero = this.add.text(GAME_WIDTH / 2, 300, '🦸', { fontSize: '120px' }).setOrigin(0.5);
    this.tweens.add({ targets: hero, y: 285, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inout' });

    // Total stars
    const total = Progress.totalStars();
    const stars = UI.starRow(this, GAME_WIDTH / 2, 410, 0, 9, 40);
    this.time.delayedCall(400, () => UI.animateStars(this, stars, total, 120));
    this.add.text(GAME_WIDTH / 2, 470, `Bintang terkumpul: ${total} / 9`, {
      fontFamily: FONT, fontSize: '26px', color: CSS.accentDark, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Takeaway message
    UI.panel(this, GAME_WIDTH / 2, 560, 980, 96, { color: COLORS.panelSoft });
    this.add.text(GAME_WIDTH / 2, 560,
      'Ingat: menghemat energi dan memakai energi alternatif (matahari, angin, air, biomassa)\nmembantu menjaga bumi dan membuat usaha warga lebih hemat dan menguntungkan.', {
        fontFamily: FONT, fontSize: '20px', color: CSS.ink, align: 'center', lineSpacing: 6, fontStyle: 'bold',
      }).setOrigin(0.5);

    // Buttons
    UI.button(this, GAME_WIDTH / 2 - 160, 662, { label: 'Main Lagi', icon: '🔁', w: 280, h: 66, fontSize: 24, color: COLORS.primary,
      onClick: () => { this.confettiTimer.remove(); this._go(SCENES.SELECT); } });
    UI.button(this, GAME_WIDTH / 2 + 160, 662, { label: 'Menu Utama', icon: '🏠', w: 280, h: 66, fontSize: 24, color: COLORS.good,
      onClick: () => { this.confettiTimer.remove(); this._go(SCENES.MENU); } });
  }

  _go(key) {
    this.cameras.main.fadeOut(240, 6, 50, 60);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key));
  }
}
