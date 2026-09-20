/* =============================================================================
 * BootScene — first scene. Initialises managers, hides the HTML preloader,
 * wires the fullscreen/mute state, then hands off to the main menu.
 * There are no external assets to load (all art is drawn, all audio synth'd),
 * so booting is instant.
 * ===========================================================================*/

class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    AudioManager.init(); // installs a global gesture listener that unlocks audio
    Progress.load();

    // Remove the HTML loading splash now that Phaser is running.
    const pre = document.getElementById('preloader');
    if (pre) {
      pre.classList.add('hidden');
      setTimeout(() => pre.remove(), 500);
    }

    this.scene.start(SCENES.MENU);
  }
}
