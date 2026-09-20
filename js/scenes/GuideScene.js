/* =============================================================================
 * GuideScene — Panduan permainan (spec D.1 & D.4).
 * Explains the goal, the controls, and the three missions so a student can
 * play independently without a teacher.
 * ===========================================================================*/

class GuideScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GUIDE);
  }

  create() {
    UI.sky(this, false);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.deep, 0.18);

    // Header
    this.add.text(GAME_WIDTH / 2, 62, '📖  Panduan Bermain', {
      fontFamily: FONT, fontSize: '46px', color: CSS.primaryDark, fontStyle: 'bold',
    }).setOrigin(0.5).setStroke('#ffffff', 8);

    // Main panel
    UI.panel(this, GAME_WIDTH / 2, 400, 1080, 560, { color: COLORS.panel });

    const left = 220;
    let y = 168;
    this.add.text(left, y, 'Tujuanmu', { fontFamily: FONT, fontSize: '28px', color: CSS.ink, fontStyle: 'bold' }).setOrigin(0, 0.5);
    y += 42;
    UI.bodyText(this, left, y - 14,
      'Bantu warga Desa Terang menghemat energi, memakai energi alternatif, dan\nmembuat usaha yang ramah lingkungan. Selesaikan 3 misi untuk memenangkan game!',
      { fontSize: 21, wrap: 900 });

    // Controls row
    y = 300;
    this.add.text(left, y, 'Tombol yang akan kamu temui', {
      fontFamily: FONT, fontSize: '24px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    const controls = [
      ['🏠', 'Home — kembali ke menu'],
      ['⏸️', 'Jeda — istirahat sejenak'],
      ['🔁', 'Ulangi — main level lagi'],
      ['🔊', 'Suara — nyala / matikan'],
      ['⛶', 'Layar penuh (fullscreen)'],
      ['➡️', 'Lanjut — ke misi berikutnya'],
    ];
    controls.forEach((c, i) => {
      const cx = left + (i % 3) * 300;
      const cy = 348 + Math.floor(i / 3) * 58;
      this.add.text(cx, cy, c[0], { fontSize: '30px' }).setOrigin(0, 0.5);
      this.add.text(cx + 44, cy, c[1], { fontFamily: FONT, fontSize: '19px', color: CSS.ink }).setOrigin(0, 0.5);
    });

    // Missions row
    y = 500;
    this.add.text(left, y, '3 Misi Petualanganmu', {
      fontFamily: FONT, fontSize: '24px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    CONTENT.levels.forEach((lv, i) => {
      const cx = 280 + i * 360;
      const cy = 592;
      const card = this.add.container(cx, cy);
      const g = this.add.graphics();
      UI.roundRect(g, -160, -46, 320, 96, 18, lv.color, 0.18, lv.color, 3);
      card.add(g);
      card.add(this.add.text(-135, 0, lv.icon, { fontSize: '40px' }).setOrigin(0.5));
      card.add(this.add.text(-100, -20, `Misi ${lv.no}: ${lv.title}`, {
        fontFamily: FONT, fontSize: '18px', color: CSS.ink, fontStyle: 'bold', wordWrap: { width: 250 },
      }).setOrigin(0, 0.5));
      card.add(this.add.text(-100, 16, lv.goal, {
        fontFamily: FONT, fontSize: '14px', color: CSS.inkSoft, wordWrap: { width: 250 },
      }).setOrigin(0, 0.5));
    });

    // Nav buttons
    UI.button(this, 150, 62, { label: 'Kembali', icon: '⬅', w: 200, h: 56, fontSize: 22, color: COLORS.inkSoft,
      onClick: () => this._go(SCENES.MENU) });
    UI.button(this, GAME_WIDTH - 190, 62, { label: 'Mulai Main', icon: '▶', w: 240, h: 56, fontSize: 22, color: COLORS.good,
      onClick: () => this._go(SCENES.SELECT) });
  }

  _go(key) {
    this.cameras.main.fadeOut(200, 6, 50, 60);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key));
  }
}
