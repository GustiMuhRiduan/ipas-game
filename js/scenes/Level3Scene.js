/* =============================================================================
 * Level3Scene — "Ekonomi Hijau Desa".
 * Mechanic: decision-making / multiple choice. Each scenario asks the player to
 * pick the choice that saves energy, uses alternative energy, and helps the
 * villager's livelihood — connecting energy literacy to community economy.
 * ===========================================================================*/

class Level3Scene extends LevelBase {
  constructor() {
    super(SCENES.LEVEL3);
  }

  create() {
    this.meta = CONTENT.levels[2];
    this.questions = Phaser.Utils.Array.Shuffle(CONTENT.level3.questions.slice());
    this.index = 0;
    this.pointsPer = 100;
    this.maxScore = this.questions.length * this.pointsPer;

    UI.sky(this, true);

    this.startHud({ levelNo: 3, maxProgress: this.questions.length, mission: this.meta.goal });

    this.stage = this.add.container(0, 0).setAlpha(0);

    this.showIntro(this.meta, CONTENT.level3.intro, () => {
      this.tweens.add({ targets: this.stage, alpha: 1, duration: 300 });
      this._showQuestion();
    });
  }

  _showQuestion() {
    this.stage.removeAll(true);
    const q = this.questions[this.index];

    // Question counter
    this.stage.add(this.add.text(GAME_WIDTH / 2, 128, `Soal ${this.index + 1} / ${this.questions.length}`, {
      fontFamily: FONT, fontSize: '22px', color: CSS.primaryDark, fontStyle: 'bold',
    }).setOrigin(0.5));

    // Villager + question bubble
    this.stage.add(this.add.text(180, 300, '🧑‍🌾', { fontSize: '110px' }).setOrigin(0.5));

    const panelG = this.add.graphics();
    UI.roundRect(panelG, 280, 176, 900, 168, 24, COLORS.panel, 1, this.meta.color, 4);
    // little pointer triangle toward villager
    panelG.fillStyle(COLORS.panel, 1);
    panelG.fillTriangle(280, 250, 240, 280, 280, 300);
    this.stage.add(panelG);
    this.stage.add(this.add.text(730, 260, q.q, {
      fontFamily: FONT, fontSize: '25px', color: CSS.ink, fontStyle: 'bold',
      align: 'center', lineSpacing: 6, wordWrap: { width: 840 },
    }).setOrigin(0.5));

    // Options
    const startY = 420;
    const gap = 92;
    const shuffled = Phaser.Utils.Array.Shuffle(q.options.map((o, i) => ({ ...o, i })));
    this.optionButtons = [];
    shuffled.forEach((opt, row) => {
      const y = startY + row * gap;
      const btn = this._option(GAME_WIDTH / 2, y, String.fromCharCode(65 + row), opt.t, () => this._answer(opt, q));
      this.optionButtons.push(btn);
      this.stage.add(btn);
    });
  }

  _option(x, y, letter, text, onClick) {
    const w = 820, h = 76;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const base = COLORS.white;
    const draw = (yo, fill, stroke) => {
      g.clear();
      UI.roundRect(g, -w / 2, -h / 2 + 5, w, h, 18, UI._darken(COLORS.primary, 0.35), 1);
      UI.roundRect(g, -w / 2, -h / 2 + yo, w, h, 18, fill, 1, stroke, 4);
    };
    draw(0, base, COLORS.primary);
    c.add(g);

    // letter badge
    const badge = this.add.graphics();
    badge.fillStyle(COLORS.primary, 1);
    badge.fillCircle(-w / 2 + 44, 0, 26);
    c.add(badge);
    c.add(this.add.text(-w / 2 + 44, 0, letter, {
      fontFamily: FONT, fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));

    const label = this.add.text(-w / 2 + 90, 0, text, {
      fontFamily: FONT, fontSize: '23px', color: CSS.ink, fontStyle: 'bold', wordWrap: { width: w - 130 },
    }).setOrigin(0, 0.5);
    c.add(label);

    c.setSize(w, h);
    c.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    c.on('pointerover', () => { draw(0, UI._lighten(COLORS.primary, 0.85), COLORS.primary); AudioManager.hover(); });
    c.on('pointerout', () => draw(0, base, COLORS.primary));
    UI.press(this, c, {
      onDown: () => { draw(5, base, COLORS.primary); AudioManager.click(); },
      onUp: () => { draw(0, base, COLORS.primary); },
      onFire: () => onClick(),
    });
    c._setColors = draw;
    c._w = w; c._h = h;
    return c;
  }

  _answer(opt, q) {
    if (this._answering) return; // guard against a double-tap
    this._answering = true;
    // lock all options
    this.optionButtons.forEach((b) => b.disableInteractive());
    const hud = this.hud();

    if (opt.ok) {
      hud.addScore(this.pointsPer);
      AudioManager.pop();
    } else {
      hud.loseLife();
    }

    this.showFeedback(opt.ok, q.tip, () => {
      this._answering = false;
      if (hud.getLives() <= 0) { this.failLevel(); return; }
      this.index++;
      hud.updateProgress(this.index);
      if (this.index >= this.questions.length) {
        this.completeLevel(hud.getScore(), this.maxScore);
      } else {
        this._showQuestion();
      }
    });
  }
}
