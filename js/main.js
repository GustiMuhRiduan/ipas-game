/* =============================================================================
 * main.js — Phaser game bootstrap.
 *
 * Fixed 16:9 design resolution (1280x720) scaled with Scale.FIT so it fills
 * laptops, desktops, tablets and Interactive Flat Panels while keeping the
 * aspect ratio and staying centred (spec C). CENTER_BOTH letterboxes cleanly.
 * ===========================================================================*/

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#d6f6ff',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // The Scale Manager also drives the Fullscreen API when we call
    // scale.startFullscreen()/stopFullscreen() from the UI buttons.
  },
  dom: { createContainer: false },
  scene: [
    BootScene,
    MenuScene,
    GuideScene,
    LevelSelectScene,
    HudScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    ResultScene,
    FinishScene,
  ],
};

window.addEventListener('load', () => {
  // eslint-disable-next-line no-new
  window.game = new Phaser.Game(gameConfig);
});
