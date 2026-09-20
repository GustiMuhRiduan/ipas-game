/* =============================================================================
 * LevelSelectScene — Misi / pathway yang jelas (spec D.1 & D.4).
 * A winding path across Desa Terang with a node per mission. Locked missions
 * show a padlock; completed ones show earned stars. This is where the student
 * always knows "I'm at this stage, and this is what's next".
 * ===========================================================================*/

class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENES.SELECT);
  }

  create() {
    UI.sky(this);

    this.add.text(GAME_WIDTH / 2, 60, 'Peta Petualangan', {
      fontFamily: FONT, fontSize: '52px', color: CSS.primaryDark, fontStyle: 'bold',
    }).setOrigin(0.5).setStroke('#ffffff', 8);

    this.add.text(GAME_WIDTH / 2, 108, 'Pilih misi yang ingin kamu mainkan', {
      fontFamily: FONT, fontSize: '22px', color: CSS.ink,
    }).setOrigin(0.5);

    // Node positions along a gentle S-curve.
    const nodes = [
      { x: 300, y: 480 },
      { x: 640, y: 330 },
      { x: 980, y: 470 },
    ];

    // Draw the dashed path connecting the nodes.
    const path = this.add.graphics().setDepth(0);
    path.lineStyle(16, COLORS.white, 0.85);
    path.beginPath();
    path.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1], cur = nodes[i];
      const midX = (prev.x + cur.x) / 2;
      path.lineTo(midX, prev.y);
      path.lineTo(midX, cur.y);
      path.lineTo(cur.x, cur.y);
    }
    path.strokePath();

    // Mission nodes
    CONTENT.levels.forEach((lv, i) => {
      const unlocked = Progress.isUnlocked(lv.key);
      const stars = Progress.data.stars[lv.key] || 0;
      this._node(nodes[i].x, nodes[i].y, lv, unlocked, stars);
    });

    // Utility + nav
    UI.button(this, 140, 60, { label: 'Menu', icon: '🏠', w: 180, h: 54, fontSize: 22, color: COLORS.inkSoft,
      onClick: () => this._go(SCENES.MENU) });

    const audioBtn = UI.iconButton(this, GAME_WIDTH - 60, 56, {
      icon: AudioManager.isMuted() ? '🔇' : '🔊', d: 56, color: COLORS.white,
      onClick: () => { const m = AudioManager.toggleMute(); audioBtn.setIcon(m ? '🔇' : '🔊'); if (!m) AudioManager.startMusic(); },
    });
    UI.iconButton(this, GAME_WIDTH - 128, 56, { icon: '⛶', d: 56, color: COLORS.white,
      onClick: () => { if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen(); } });

    this.cameras.main.fadeIn(220);
  }

  _node(x, y, lv, unlocked, stars) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const r = 66;
    const base = unlocked ? lv.color : 0xb9c6c8;
    g.fillStyle(COLORS.shadow, 0.25); g.fillCircle(4, 8, r + 6);
    g.fillStyle(0xffffff, 1); g.fillCircle(0, 0, r + 8);
    g.fillStyle(base, 1); g.fillCircle(0, 0, r);
    g.fillStyle(0xffffff, 0.22); g.fillEllipse(0, -r * 0.4, r * 1.4, r * 0.7);
    c.add(g);

    c.add(this.add.text(0, -4, unlocked ? lv.icon : '🔒', { fontSize: '54px' }).setOrigin(0.5));

    // Mission number ribbon
    const num = this.add.container(0, -r - 14);
    const ng = this.add.graphics();
    UI.roundRect(ng, -46, -18, 92, 36, 18, unlocked ? COLORS.primaryDark : 0x8a9a9c, 1);
    num.add(ng);
    num.add(this.add.text(0, 0, `Misi ${lv.no}`, {
      fontFamily: FONT, fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));
    c.add(num);

    // Title below
    c.add(this.add.text(0, r + 34, lv.title, {
      fontFamily: FONT, fontSize: '22px', color: CSS.ink, fontStyle: 'bold', align: 'center', wordWrap: { width: 260 },
    }).setOrigin(0.5, 0));

    // Stars (only if unlocked)
    if (unlocked) {
      const sr = UI.starRow(this, 0, r + 96, stars, 3, 30);
      c.add(sr);
    } else {
      c.add(this.add.text(0, r + 90, 'Selesaikan misi sebelumnya', {
        fontFamily: FONT, fontSize: '15px', color: CSS.inkSoft, align: 'center', wordWrap: { width: 200 },
      }).setOrigin(0.5, 0));
    }

    if (unlocked) {
      const hit = this.add.circle(x, y, r + 8).setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => { this.tweens.add({ targets: c, scale: 1.06, duration: 120 }); AudioManager.hover(); });
      hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 120 }));
      hit.on('pointerup', () => { AudioManager.click(); this._go(lv.key); });
      // gentle idle pulse to invite the tap
      this.tweens.add({ targets: c, scale: 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inout' });
    } else {
      c.setAlpha(0.85);
    }
  }

  _go(key) {
    this.cameras.main.fadeOut(200, 6, 50, 60);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key));
  }
}
