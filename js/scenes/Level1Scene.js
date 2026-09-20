/* =============================================================================
 * Level1Scene — "Hemat Energi di Rumah".
 * Mechanic: exploration + decision-making. The player inspects each household
 * item and decides MATIKAN (turn off the wasteful ones) or BIARKAN (leave the
 * ones already used wisely). Teaches everyday energy-saving habits.
 * ===========================================================================*/

class Level1Scene extends LevelBase {
  constructor() {
    super(SCENES.LEVEL1);
  }

  create() {
    this.meta = CONTENT.levels[0];
    this.items = Phaser.Utils.Array.Shuffle(CONTENT.level1.items.slice());
    this.decided = 0;
    this.pointsPerItem = 100;
    this.maxScore = this.items.length * this.pointsPerItem;

    UI.sky(this, true);
    this._drawHouse();

    this.add.text(GAME_WIDTH / 2, 108, 'Ketuk pilihan pada tiap benda: matikan yang boros, biarkan yang hemat.', {
      fontFamily: FONT, fontSize: '20px', color: CSS.ink, fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);

    this.startHud({ levelNo: 1, maxProgress: this.items.length, mission: this.meta.goal });

    // Build the item grid but keep it hidden until intro dismissed.
    this.cardsLayer = this.add.container(0, 0).setAlpha(0);
    this._buildCards();

    this.showIntro(this.meta, CONTENT.level1.intro, () => {
      this.tweens.add({ targets: this.cardsLayer, alpha: 1, duration: 300 });
    });
  }

  _drawHouse() {
    // subtle house-interior tint band behind the cards
    const g = this.add.graphics().setDepth(-5);
    UI.roundRect(g, 60, 130, GAME_WIDTH - 120, 470, 30, 0xffffff, 0.35);
  }

  _buildCards() {
    const cardW = 260, cardH = 200;
    const centersX = [220, 500, 780, 1060];
    const rowsY = [250, 476];

    this.items.forEach((item, i) => {
      const cx = centersX[i % 4];
      const cy = rowsY[Math.floor(i / 4)];
      this.cardsLayer.add(this._card(item, cx, cy, cardW, cardH));
    });
  }

  _card(item, cx, cy, w, h) {
    const c = this.add.container(cx, cy);
    const g = this.add.graphics();
    const drawFrame = (stroke) => {
      g.clear();
      UI.roundRect(g, -w / 2, -h / 2, w, h, 20, COLORS.panel, 1, stroke, stroke ? 5 : 0);
    };
    drawFrame(null);
    c.add(g);

    c.add(this.add.text(0, -h / 2 + 46, item.emoji, { fontSize: '52px' }).setOrigin(0.5));
    c.add(this.add.text(0, -h / 2 + 96, item.label, {
      fontFamily: FONT, fontSize: '16px', color: CSS.ink, align: 'center', wordWrap: { width: w - 30 },
    }).setOrigin(0.5, 0));

    // action buttons
    const offBtn = this._mini(-64, h / 2 - 34, '⏻ Matikan', COLORS.bad);
    const keepBtn = this._mini(64, h / 2 - 34, '✓ Biarkan', COLORS.good);
    c.add(offBtn);
    c.add(keepBtn);

    const stamp = this.add.text(w / 2 - 26, -h / 2 + 24, '', { fontSize: '34px' }).setOrigin(0.5);
    c.add(stamp);

    const decide = (choice) => {
      // disable further input on this card
      offBtn.disableInteractive();
      keepBtn.disableInteractive();
      offBtn.setAlpha(0.35);
      keepBtn.setAlpha(0.35);

      const correct = (choice === 'off' && item.waste) || (choice === 'keep' && !item.waste);
      drawFrame(correct ? COLORS.good : COLORS.bad);
      stamp.setText(correct ? '✅' : '❌');
      this.tweens.add({ targets: stamp, scale: { from: 0.2, to: 1 }, duration: 300, ease: 'Back.out' });

      const hud = this.hud();
      if (correct) {
        hud.addScore(this.pointsPerItem);
        UI.pop && AudioManager.pop();
      } else {
        hud.loseLife();
      }
      this.decided++;
      hud.updateProgress(this.decided);

      this.showFeedback(correct, item.tip, () => {
        if (hud.getLives() <= 0) { this.failLevel(); return; }
        if (this.decided >= this.items.length) {
          this.completeLevel(hud.getScore(), this.maxScore);
        }
      });
    };

    offBtn.on('pointerup', () => decide('off'));
    keepBtn.on('pointerup', () => decide('keep'));

    return c;
  }

  // small pill button used inside a card
  _mini(x, y, label, color) {
    const w = 116, h = 46;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const redraw = (yo, col) => {
      g.clear();
      UI.roundRect(g, -w / 2, -h / 2 + 4, w, h, 14, UI._darken(color, 0.25), 1);
      UI.roundRect(g, -w / 2, -h / 2 + yo, w, h, 14, col, 1);
    };
    redraw(0, color);
    c.add(g);
    const t = this.add.text(0, 0, label, {
      fontFamily: FONT, fontSize: '17px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    c.add(t);
    c.setSize(w, h);
    c.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    c.on('pointerover', () => { this.tweens.add({ targets: c, scale: 1.06, duration: 100 }); AudioManager.hover(); });
    c.on('pointerout', () => { this.tweens.add({ targets: c, scale: 1, duration: 100 }); redraw(0, color); t.y = 0; });
    c.on('pointerdown', () => { redraw(4, UI._darken(color, 0.25)); t.y = 3; AudioManager.click(); });
    return c;
  }
}
