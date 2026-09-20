/* =============================================================================
 * UI.js — Reusable, child-friendly UI widgets built on Phaser Graphics + Text.
 *
 * No image assets: buttons, panels, stars and effects are all drawn with
 * rounded rectangles, circles and emoji so the look stays crisp at any size and
 * the download stays tiny. Every interactive widget gives visual + audio
 * feedback (spec D.5 & D.6).
 * ===========================================================================*/

const UI = {
  /**
   * Attach a FORGIVING press interaction to an already-interactive game object.
   *
   * Touch devices (tablets/IFPs — our targets) rarely release exactly where the
   * finger landed, so binding an action to `pointerup` alone means small drifts
   * fire nothing and the button feels dead. Here we arm on `pointerdown` and
   * fire on release whether it lands on the object (`pointerup`) or just off it
   * (`pointerupoutside`, within a margin). This makes every button feel snappy.
   *
   * opts: { onDown, onUp, onFire, margin }
   */
  press(scene, obj, opts) {
    const o = Object.assign({ onDown() {}, onUp() {}, onFire() {}, margin: 48 }, opts);
    let armed = false;

    const disarm = () => { armed = false; o.onUp(); };

    obj.on('pointerdown', () => {
      armed = true;
      o.onDown();
      if (AudioManager && AudioManager.resume) AudioManager.resume(); // unlock audio on any tap
    });
    // Released directly over the object — the simple, common case.
    obj.on('pointerup', () => { if (!armed) return; disarm(); o.onFire(); });

    // The forgiving case: the scene emits pointerup for EVERY release, wherever
    // it lands. If this button was armed and the release is near it (finger
    // drift on touch), fire it too. Whichever handler runs first disarms, so we
    // never double-fire.
    const sceneUp = (pointer) => {
      if (!armed) return;
      let near = true;
      try {
        const b = obj.getBounds();
        near = pointer.x >= b.x - o.margin && pointer.x <= b.right + o.margin &&
               pointer.y >= b.y - o.margin && pointer.y <= b.bottom + o.margin;
      } catch (e) { near = true; }
      disarm();
      if (near) o.onFire();
    };
    scene.input.on('pointerup', sceneUp);
    scene.events.once('shutdown', () => scene.input.off('pointerup', sceneUp));
    scene.events.once('destroy', () => scene.input.off('pointerup', sceneUp));

    // Dragging the finger off only resets the press visual (stays armed).
    obj.on('pointerout', () => { if (armed) o.onUp(); });
    return obj;
  },

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
      // Generous hit area (a little larger than the visible button) for easy taps.
      c.setInteractive(new Phaser.Geom.Rectangle(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
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
      this.press(scene, c, {
        onDown: () => { redraw(6, dark); label.y = 3; },
        onUp: () => { redraw(0, o.color); label.y = 0; },
        onFire: () => {
          if (o.sound && AudioManager[o.sound]) AudioManager[o.sound]();
          o.onClick();
        },
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
    // Square, generously-sized tap target (touch-friendly). A rectangular hit
    // area on a container is the most reliable across devices.
    const hr = r + 10;
    c.setInteractive(new Phaser.Geom.Rectangle(-hr, -hr, hr * 2, hr * 2), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    c.on('pointerover', () => { scene.tweens.add({ targets: c, scale: 1.1, duration: 100 }); AudioManager.hover(); });
    c.on('pointerout', () => { scene.tweens.add({ targets: c, scale: 1, duration: 100 }); redraw(0); ic.y = 0; });
    this.press(scene, c, {
      onDown: () => { redraw(5); ic.y = 3; },
      onUp: () => { redraw(0); ic.y = 0; },
      onFire: () => { AudioManager.click(); o.onClick(); },
    });

    c.setIcon = (t) => ic.setText(t);
    return c;
  },

  /**
   * Toggle fullscreen robustly. Prefers Phaser's Scale Manager (which handles
   * vendor prefixes) and falls back to the native Fullscreen API on the page
   * element if Phaser reports it unavailable. Must be called from within a
   * user-gesture handler (it is — from a button's onFire).
   * Returns the resulting fullscreen state (best effort).
   */
  toggleFullscreen(scene) {
    const scale = scene.scale;
    try {
      if (scale.isFullscreen) {
        scale.stopFullscreen();
        this._nativeExitFullscreen();
        return false;
      }
      const supported = scene.sys.game.device.fullscreen &&
        scene.sys.game.device.fullscreen.available;
      if (supported) {
        scale.startFullscreen();
        return true;
      }
      // Native fallback (older/iOS Safari etc.)
      return this._nativeRequestFullscreen();
    } catch (e) {
      // Last-ditch native attempt.
      try { return this._nativeRequestFullscreen(); } catch (e2) { return scale.isFullscreen; }
    }
  },

  _nativeRequestFullscreen() {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen ||
      el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) { req.call(el); return true; }
    return false;
  },

  _nativeExitFullscreen() {
    const ex = document.exitFullscreen || document.webkitExitFullscreen ||
      document.mozCancelFullScreen || document.msExitFullscreen;
    if (ex && (document.fullscreenElement || document.webkitFullscreenElement)) ex.call(document);
  },

  isFullscreenNow(scene) {
    return !!(scene.scale.isFullscreen || document.fullscreenElement || document.webkitFullscreenElement);
  },

  /**
   * A ready-made fullscreen icon button whose icon always reflects the real
   * fullscreen state (it listens to Scale Manager + DOM fullscreen changes).
   */
  fullscreenButton(scene, x, y, d = 56) {
    const icon = () => (this.isFullscreenNow(scene) ? '🗗' : '⛶');
    const btn = this.iconButton(scene, x, y, {
      icon: icon(), d, color: COLORS.white,
      onClick: () => { this.toggleFullscreen(scene); scene.time.delayedCall(60, sync); },
    });
    const sync = () => btn.setIcon(icon());
    scene.scale.on('enterfullscreen', sync);
    scene.scale.on('leavefullscreen', sync);
    const domSync = () => sync();
    document.addEventListener('fullscreenchange', domSync);
    document.addEventListener('webkitfullscreenchange', domSync);
    scene.events.once('shutdown', () => {
      scene.scale.off('enterfullscreen', sync);
      scene.scale.off('leavefullscreen', sync);
      document.removeEventListener('fullscreenchange', domSync);
      document.removeEventListener('webkitfullscreenchange', domSync);
    });
    return btn;
  },

  /**
   * A ready-made audio on/off icon button. Toggles the mute state, updates its
   * icon, and (re)starts the background music when un-muting.
   */
  audioButton(scene, x, y, d = 56) {
    const btn = this.iconButton(scene, x, y, {
      icon: AudioManager.isMuted() ? '🔇' : '🔊', d, color: COLORS.white,
      onClick: () => {
        AudioManager.resume();
        const muted = AudioManager.toggleMute();
        btn.setIcon(muted ? '🔇' : '🔊');
        if (!muted) AudioManager.startMusic();
      },
    });
    return btn;
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
