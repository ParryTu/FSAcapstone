import Phaser from "phaser";

//import Preloader from "./scenes/Preloader";
import Game from "./scenes/Game";
import Preloader from "./scenes/Preloader";
import Hospital from "./scenes/Hospital";
import Maze from "./scenes/Puzzles/Maze";
import Shop from "./scenes/Buildings/Shop";
import Home from "./scenes/Buildings/Home";
import Scan from "./scenes/Puzzles/Scan";
import Atlantis from "./scenes/Buildings/Atlantis";
import ScanBackground from "./scenes/puzzles/ScanBackground";
import TitleScreen from "./scenes/TitleScreen";
import ending from "./scenes/ending";
import start from "./scenes/start";

// import GameUI from "./scenes/GameUI";

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 1600,
  height: 1600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [
    Preloader,
    Game,
    Home,
    Hospital,
    Shop,
    Maze,
    Scan,
    Atlantis,
    TitleScreen,
    ScanBackground,
    ending,
    start,
  ],
  scale: {
    zoom: 3,
  },
});
