/* =============================================================================
 * UI.js — Reusable, child-friendly UI widgets built on Phaser Graphics + Text.
 *
 * No image assets: buttons, panels, stars and effects are all drawn with
 * rounded rectangles, circles and emoji so the look stays crisp at any size and
 * the download stays tiny. Every interactive widget gives visual + audio
 * feedback (spec D.5 & D.6).
 * ===========================================================================*/

const UI = {
  // Draw a rounded rectangle into a Graphics object (fill + optional stroke).
  roundRect(g, x, y, w, h, r, fill, alpha = 1, stroke = null, strokeW = 0) {
    if (fill !== null && fill !== undefined) {
      g.fillStyle(fill, alpha);
      g.fillRoundedRect(x, y, w, h, r);
    }
    if (stroke !== null && stroke !== undefined && strokeW > 0) {
      g.lineStyle(strokeW, stroke, 1);
      g.strokeRoundedRect(x, y, w, h, r);
    }
  },

  /**
   * A big tactile button.
   * opts: { label, icon, w, h, color, textColor, fontSize, onClick, sound }
   * Returns a Container positioned at (x, y) (its centre).
   */
  button(scene, x, y, opts) {
    const o = Object.assign(
      {
        label: 'OK', icon: null, w: 240, h: 74, color: COLORS.primary,
        textColor: '#ffffff', fontSize: 26, onClick: () => {}, sound: 'click',
        disabled: false,
      },
      opts
    );

    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    const w = o.w, h = o.h, r = Math.min(22, h / 2);
    const dark = this._darken(o.color, 0.22);

    const redraw = (offset, top) => {
      g.clear();
      // drop shadow / 3D base
      this.roundRect(g, -w / 2, -h / 2 + 6, w, h, r, dark, 1);
      // top face
      this.roundRect(g, -w / 2, -h / 2 + offset, w, h, r, top, 1);
      // glossy highlight
      this.roundRect(g, -w / 2 + 8, -h / 2 + offset + 6, w - 16, h * 0.36, r * 0.7, 0xffffff, 0.18);
    };
    redraw(0, o.color);
    c.add(g);

    const txt = (o.icon ? o.icon + '  ' : '') + o.label;
    const label = scene.add
      .text(0, 0, txt, {
        fontFamily: FONT,
        fontSize: o.fontSize + 'px',
        color: o.textColor,
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5);
    c.add(label);

    c.setSize(w, h);
    if (!o.disabled) {
      c.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
      c.on('pointerover', () => {
        if (!scene.sys.isActive()) return;
        scene.tweens.add({ targets: c, scale: 1.05, duration: 120, ease: 'Back.out' });
        AudioManager.hover();
      });
      c.on('pointerout', () => {
        scene.tweens.add({ targets: c, scale: 1, duration: 120 });
        redraw(0, o.color);
        label.y = 0;
      });
      c.on('pointerdown', () => {
        redraw(6, dark);
        label.y = 3;
      });
      c.on('pointerup', () => {
        redraw(0, o.color);
        label.y = 0;
        if (o.sound && AudioManager[o.sound]) AudioManager[o.sound]();
        o.onClick();
      });
    } else {
      c.setAlpha(0.55);
    }

    c.setLabelText = (t) => label.setText((o.icon ? o.icon + '  ' : '') + t);
    return c;
  },

  /**
   * A round icon button (home, pause, audio, fullscreen, next, etc.).
   * opts: { icon, d (diameter), color, onClick, tip }
   */
  iconButton(scene, x, y, opts) {
    const o = Object.assign(
      { icon: '❓', d: 58, color: COLORS.white, iconColor: null, onClick: () => {} },
      opts
    );
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    const r = o.d / 2;
    const dark = this._darken(o.color, 0.18);

    const redraw = (yoff) => {
      g.clear();
      g.fillStyle(dark, 1); g.fillCircle(0, 5, r);
      g.fillStyle(o.color, 1); g.fillCircle(0, yoff, r);
      g.fillStyle(0xffffff, 0.22); g.fillEllipse(0, yoff - r * 0.35, r * 1.3, r * 0.7);
    };
    redraw(0);
    c.add(g);

    const ic = scene.add
      .text(0, 0, o.icon, { fontFamily: FONT, fontSize: Math.round(o.d * 0.5) + 'px', color: o.iconColor || '#173e44' })
      .setOrigin(0.5);
    c.add(ic);

    c.setSize(o.d, o.d);
    c.setInteractive(new Phaser.Geom.Circle(0, 0, r), Phaser.Geom.Circle.Contains);
    c.on('pointerover', () => { scene.tweens.add({ targets: c, scale: 1.1, duration: 100 }); AudioManager.hover(); });
    c.on('pointerout', () => { scene.tweens.add({ targets: c, scale: 1, duration: 100 }); redraw(0); ic.y = 0; });
    c.on('pointerdown', () => { redraw(5); ic.y = 3; });
    c.on('pointerup', () => { redraw(0); ic.y = 0; AudioManager.click(); o.onClick(); });

    c.setIcon = (t) => ic.setText(t);
    return c;
  },

  // A soft white content panel with a coloured header bar.
  panel(scene, x, y, w, h, opts = {}) {
    const o = Object.assign({ color: COLORS.panel, radius: 26, stroke: COLORS.primaryDark, strokeW: 0, shadow: true }, opts);
    const g = scene.add.graphics();
    if (o.shadow) this.roundRect(g, x - w / 2 + 6, y - h / 2 + 10, w, h, o.radius, COLORS.shadow, 0.25);
    this.roundRect(g, x - w / 2, y - h / 2, w, h, o.radius, o.color, 1, o.stroke, o.strokeW);
    return g;
  },

  // Row of star outlines that can be "filled" one by one.
  starRow(scene, x, y, filled, total = 3, size = 46) {
    const c = scene.add.container(x, y);
    const gap = size * 1.15;
    const startX = -((total - 1) * gap) / 2;
    c.stars = [];
    for (let i = 0; i < total; i++) {
      const on = i < filled;
      const s = scene.add
        .text(startX + i * gap, 0, '★', {
          fontFamily: FONT, fontSize: size + 'px',
          color: on ? CSS.accent : '#c9d6d8',
        })
        .setOrigin(0.5);
      if (on) s.setStroke(CSS.accentDark, Math.max(2, size * 0.06));
      c.add(s);
      c.stars.push(s);
    }
    return c;
  },

  // Animate stars filling in sequence, with sound.
  animateStars(scene, container, count, delay = 300) {
    container.stars.forEach((s, i) => {
      s.setColor('#c9d6d8').setStroke('#00000000', 0);
      if (i < count) {
        scene.time.delayedCall(delay + i * 420, () => {
          s.setColor(CSS.accent).setStroke(CSS.accentDark, 3);
          scene.tweens.add({ targets: s, scale: { from: 0.2, to: 1 }, duration: 380, ease: 'Back.out' });
          AudioManager.star();
        });
      }
    });
  },

  // A transient message that floats up and fades.
  toast(scene, text, color = COLORS.ink) {
    const y = GAME_HEIGHT - 120;
    const t = scene.add
      .text(GAME_WIDTH / 2, y, text, {
        fontFamily: FONT, fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#' + color.toString(16).padStart(6, '0'),
        padding: { x: 22, y: 12 }, align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(1000);
    scene.tweens.add({
      targets: t, y: y - 60, alpha: { from: 1, to: 0 }, duration: 1600, ease: 'Cubic.in',
      onComplete: () => t.destroy(),
    });
    return t;
  },

  // Quick celebratory confetti burst using little rectangles.
  confetti(scene, x = GAME_WIDTH / 2, y = 120, amount = 90) {
    const palette = [COLORS.accent, COLORS.good, COLORS.primary, COLORS.bad, COLORS.wind, COLORS.sun];
    for (let i = 0; i < amount; i++) {
      const g = scene.add.graphics().setDepth(999);
      const col = palette[i % palette.length];
      const size = Phaser.Math.Between(6, 13);
      g.fillStyle(col, 1);
      g.fillRect(-size / 2, -size / 2, size, size * 0.6);
      g.x = x + Phaser.Math.Between(-60, 60);
      g.y = y;
      const angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
      const speed = Phaser.Math.Between(200, 520);
      scene.tweens.add({
        targets: g,
        x: g.x + Math.cos(angle) * speed,
        y: g.y + Math.abs(Math.sin(angle)) * speed + Phaser.Math.Between(200, 460),
        angle: Phaser.Math.Between(-360, 360),
        alpha: { from: 1, to: 0 },
        duration: Phaser.Math.Between(1100, 1900),
        ease: 'Cubic.in',
        onComplete: () => g.destroy(),
      });
    }
  },

  // Word-wrapped body text helper.
  bodyText(scene, x, y, text, opts = {}) {
    const o = Object.assign({ fontSize: 22, color: CSS.ink, wrap: 700, align: 'left', bold: false }, opts);
    return scene.add.text(x, y, text, {
      fontFamily: FONT,
      fontSize: o.fontSize + 'px',
      color: o.color,
      fontStyle: o.bold ? 'bold' : 'normal',
      align: o.align,
      lineSpacing: 6,
      wordWrap: { width: o.wrap },
    });
  },

  // Standard sunny sky + grass backdrop used across scenes. Returns nothing;
  // draws directly at depth -10 so content sits on top.
  sky(scene, withGround = true) {
    const g = scene.add.graphics().setDepth(-10);
    // vertical sky gradient (drawn as horizontal bands)
    const bands = 24;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const col = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(COLORS.skyTop),
        Phaser.Display.Color.ValueToColor(COLORS.skyBottom),
        bands - 1,
        i
      );
      g.fillStyle(Phaser.Display.Color.GetColor(col.r, col.g, col.b), 1);
      g.fillRect(0, (GAME_HEIGHT / bands) * i, GAME_WIDTH, GAME_HEIGHT / bands + 2);
    }
    // sun
    g.fillStyle(COLORS.sun, 0.9);
    g.fillCircle(GAME_WIDTH - 130, 120, 70);
    g.fillStyle(COLORS.sun, 0.3);
    g.fillCircle(GAME_WIDTH - 130, 120, 100);
    // clouds
    const cloud = (cx, cy, s) => {
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(cx, cy, 26 * s);
      g.fillCircle(cx + 34 * s, cy + 6 * s, 22 * s);
      g.fillCircle(cx - 32 * s, cy + 8 * s, 20 * s);
      g.fillRoundedRect(cx - 46 * s, cy + 6 * s, 92 * s, 22 * s, 12 * s);
    };
    cloud(220, 110, 1.1);
    cloud(560, 70, 0.8);
    if (withGround) {
      g.fillStyle(COLORS.groundDark, 1);
      g.fillRect(0, GAME_HEIGHT - 120, GAME_WIDTH, 120);
      g.fillStyle(COLORS.ground, 1);
      g.fillRect(0, GAME_HEIGHT - 120, GAME_WIDTH, 40);
    }
    return g;
  },

  // Dark translucent overlay for modal panels / pause.
  scrim(scene, alpha = 0.55, depth = 900) {
    return scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.shadow, alpha)
      .setDepth(depth)
      .setInteractive();
  },

  _darken(color, amt) {
    const r = (color >> 16) & 0xff, g = (color >> 8) & 0xff, b = color & 0xff;
    const d = (v) => Math.max(0, Math.round(v * (1 - amt)));
    return (d(r) << 16) | (d(g) << 8) | d(b);
  },

  _lighten(color, amt) {
    const r = (color >> 16) & 0xff, g = (color >> 8) & 0xff, b = color & 0xff;
    const l = (v) => Math.min(255, Math.round(v + (255 - v) * amt));
    return (l(r) << 16) | (l(g) << 8) | l(b);
  },
};
