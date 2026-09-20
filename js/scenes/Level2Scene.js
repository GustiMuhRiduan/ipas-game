/* =============================================================================
 * Level2Scene — "Energi Alternatif".
 * Mechanic: drag & drop matching. Drag each renewable ENERGY SOURCE (left) onto
 * the TECHNOLOGY that harvests it (right). Teaches solar/wind/water/biomass.
 * ===========================================================================*/

class Level2Scene extends LevelBase {
  constructor() {
    super(SCENES.LEVEL2);
  }

  create() {
    this.meta = CONTENT.levels[1];
    this.pairs = CONTENT.level2.pairs;
    this.matched = 0;
    this.pointsPer = 100;
    this.maxScore = this.pairs.length * this.pointsPer;

    UI.sky(this, true);

    this.add.text(GAME_WIDTH / 2, 110, 'Seret sumber energi ke teknologi yang tepat.', {
      fontFamily: FONT, fontSize: '20px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Column headings
    this.add.text(320, 150, '⚡ Sumber Energi', {
      fontFamily: FONT, fontSize: '24px', color: CSS.primaryDark, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(940, 150, '🏭 Teknologi', {
      fontFamily: FONT, fontSize: '24px', color: CSS.primaryDark, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.startHud({ levelNo: 2, maxProgress: this.pairs.length, mission: this.meta.goal });

    this.layer = this.add.container(0, 0).setAlpha(0);
    this._build();

    this.showIntro(this.meta, CONTENT.level2.intro, () => {
      this.tweens.add({ targets: this.layer, alpha: 1, duration: 300 });
    });
  }

  _build() {
    const ys = [220, 350, 480, 610];
    const sources = Phaser.Utils.Array.Shuffle(this.pairs.slice());
    const targets = Phaser.Utils.Array.Shuffle(this.pairs.slice());

    // Target slots (drop zones) on the right.
    this.slots = [];
    targets.forEach((p, i) => {
      const x = 940, y = ys[i];
      const w = 300, h = 108;
      const g = this.add.graphics();
      g.lineStyle(4, this.meta.color, 0.9);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 18);
      UI.roundRect(g, x - w / 2, y - h / 2, w, h, 18, this.meta.color, 0.10);
      this.layer.add(g);

      this.layer.add(this.add.text(x - w / 2 + 34, y, p.targetEmoji, { fontSize: '44px' }).setOrigin(0.5));
      this.layer.add(this.add.text(x - w / 2 + 70, y, p.target, {
        fontFamily: FONT, fontSize: '22px', color: CSS.ink, fontStyle: 'bold',
      }).setOrigin(0, 0.5));

      const zone = this.add.zone(x, y, w, h).setRectangleDropZone(w, h);
      zone.slotId = p.id;
      zone.slotX = x; zone.slotY = y;
      zone.filled = false;
      zone.frame = g;
      this.slots.push(zone);
    });

    // Draggable source cards on the left.
    sources.forEach((p, i) => {
      const x = 320, y = ys[i];
      this.layer.add(this._sourceCard(p, x, y));
    });
  }

  _sourceCard(p, x, y) {
    const w = 240, h = 92;
    const c = this.add.container(x, y);
    c.homeX = x; c.homeY = y; c.pairId = p.id; c.placed = false;

    const g = this.add.graphics();
    const draw = () => {
      g.clear();
      UI.roundRect(g, -w / 2, -h / 2 + 5, w, h, 18, UI._darken(this.meta.color, 0.3), 1);
      UI.roundRect(g, -w / 2, -h / 2, w, h, 18, COLORS.white, 1, this.meta.color, 4);
    };
    draw();
    c.add(g);
    c.add(this.add.text(-w / 2 + 40, 0, p.source, { fontSize: '46px' }).setOrigin(0.5));
    c.add(this.add.text(-w / 2 + 74, 0, p.sourceLabel, {
      fontFamily: FONT, fontSize: '24px', color: CSS.ink, fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    c.add(this.add.text(w / 2 - 22, -h / 2 + 16, '✋', { fontSize: '20px' }).setOrigin(0.5).setAlpha(0.6));

    c.setSize(w, h);
    c.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(c);

    c.on('pointerover', () => { if (!c.placed) AudioManager.hover(); });

    this.input.on('dragstart', (pointer, obj) => {
      if (obj !== c || c.placed) return;
      this.layer.bringToTop(c);
      this.tweens.add({ targets: c, scale: 1.08, duration: 120 });
      AudioManager.click();
    });
    this.input.on('drag', (pointer, obj, dragX, dragY) => {
      if (obj !== c || c.placed) return;
      c.x = dragX; c.y = dragY;
    });
    this.input.on('drop', (pointer, obj, zone) => {
      if (obj !== c || c.placed) return;
      this._handleDrop(c, zone, draw);
    });
    this.input.on('dragend', (pointer, obj, dropped) => {
      if (obj !== c || c.placed) return;
      if (!dropped) this._snapHome(c);
      this.tweens.add({ targets: c, scale: 1, duration: 120 });
    });

    return c;
  }

  _handleDrop(card, zone, redraw) {
    if (zone.filled) { this._snapHome(card); return; }
    const correct = zone.slotId === card.pairId;
    const pair = this.pairs.find((p) => p.id === card.pairId);

    if (correct) {
      card.placed = true;
      zone.filled = true;
      card.disableInteractive();
      // snap into the slot, shrink to sit beside the tech label
      this.tweens.add({ targets: card, x: zone.slotX, y: zone.slotY, scale: 0.001, duration: 260, ease: 'Back.in',
        onComplete: () => card.setVisible(false) });
      // mark the slot as satisfied
      zone.frame.clear();
      zone.frame.lineStyle(4, COLORS.good, 1);
      const w = 300, h = 108;
      zone.frame.strokeRoundedRect(zone.slotX - w / 2, zone.slotY - h / 2, w, h, 18);
      UI.roundRect(zone.frame, zone.slotX - w / 2, zone.slotY - h / 2, w, h, 18, COLORS.good, 0.16);
      const check = this.add.text(zone.slotX + w / 2 - 26, zone.slotY, '✅', { fontSize: '30px' }).setOrigin(0.5);
      this.layer.add(check);
      this.tweens.add({ targets: check, scale: { from: 0.2, to: 1 }, duration: 300, ease: 'Back.out' });

      const hud = this.hud();
      hud.addScore(this.pointsPer);
      this.matched++;
      hud.updateProgress(this.matched);
      AudioManager.pop();

      this.showFeedback(true, pair.tip, () => {
        if (this.matched >= this.pairs.length) this.completeLevel(hud.getScore(), this.maxScore);
      });
    } else {
      const hud = this.hud();
      hud.loseLife();
      this._snapHome(card);
      this.showFeedback(false, 'Pasangan itu belum cocok. ' + pair.sourceLabel + ' tidak dipanen oleh alat itu. Coba lagi ya!', () => {
        if (hud.getLives() <= 0) this.failLevel();
      });
    }
  }

  _snapHome(card) {
    this.tweens.add({ targets: card, x: card.homeX, y: card.homeY, scale: 1, duration: 240, ease: 'Back.out' });
  }
}
