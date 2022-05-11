import Phaser from "phaser";

import Game from "./scenes/Game";
import Preloader from "./scenes/Preloader";

//import GameUI from "./scenes/GameUI";

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 1600,
  height: 1600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [Preloader, Game],
  scale: {
    zoom: 8,
  },
});
