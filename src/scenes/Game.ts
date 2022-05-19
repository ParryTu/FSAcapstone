import Phaser from "phaser";
import { debugDraw } from "../utils/debug";
//import data from "../tiles/overworld.json";
import data from "../../public/tiles/overworld.json";
import {
  isItClose,
  setPlayer,
  movePlayer,
  createAnims,
  interact,
  displayInventory,
  updateInventory,
  updateText,
} from "../utils/helper";
import { exit } from "process";

export const overworldExits = [
  { x: 320, y: 1140, name: "shop" },
  { x: 1234, y: 465, name: "hospital" },
  { x: 803, y: 216, name: "atlantis" },
  { x: 788, y: 1015, name: "home" },
  { x: 794, y: 1586, name: "ending" },
  // {
  //   x: 794,
  //   y: 1500,
  //   name: "nearEnd",
  //   message: "You are near the end, no going back, are you sure?",
  // },
];

const dialogue = [
  {
    properties: [
      {
        name: "message",
        value:
          "The road ahead looks daunting. You feel as though if you step ahead of this path, the consequences of your actions will come flooding forward. Are you satisfied with your progress? If you are, the road implores you to step forward.",
      },
    ],
    hasAppeared: false,
  },
  {
    x: 788,
    y: 1101,
    properties: [
      {
        name: "message",
        value:
          "I'm out! Finally. Now, about this pounding.. There's gotta be a hospital around here. Say.. what a nice town. Aren't there any people?",
      },
    ],
    hasAppeared: false,
  },
  // {x: , y: , message: "", hasAppeared: false},
  // {x: , y: , message: "", hasAppeared: false},
];

export default class Game extends Phaser.Scene {
  private parry!: "string";
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;
  private message!: Phaser.GameObjects.Text;
  private objLayer!: Phaser.Tilemaps.ObjectLayer;
  private warning!: integer;

  constructor() {
    super("game");
  }

  preload() {
    //Load graphics
    this.load.image("houses", "tiles/overworld/houses.png");
    this.load.image("outside", "tiles/overworld/outside.png");
    this.load.image("jungle", "tiles/overworld/jungle.png");
    this.load.image("beach", "tiles/overworld/beach.png");
    this.load.image("clouds", "tiles/overworld/clouds.png");
    this.load.image("icons", "tiles/icons/icons.png");

    //Load data (collisions, etc) for the map.
    this.load.tilemapTiledJSON("overworld", "tiles/overworld.json");

    //Load keyboard for player to use.
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.cameras.main.setSize(475, 300);

    //Create tile sets so that we can access Tiled data later on.
    const map = this.make.tilemap({ key: "overworld" });
    const townTileSet = map.addTilesetImage("Town", "outside");
    const houseTileSet = map.addTilesetImage("Houses", "houses");
    const jungleTileSet = map.addTilesetImage("Jungle", "jungle");
    const beachTileSet = map.addTilesetImage("Beach", "beach");
    const cloudsTileSet = map.addTilesetImage("Clouds", "clouds");
    const iconsTileSet = map.addTilesetImage("Icons", "icons");
    const allTileSet = [
      houseTileSet,
      townTileSet,
      beachTileSet,
      jungleTileSet,
      cloudsTileSet,
      iconsTileSet,
    ];

    //Create ground layer first using tile set data.
    const groundLayer = map.createLayer("Ground", allTileSet);
    const groundDeluxeLayer = map.createLayer("GroundDeluxe", allTileSet);

    //Local helper function: if player is coming from the overworld, they appear at the entrance. If they are returning form the Brain Scan, they appear by the bed.
    this.spawn();
    //Follow with camera and animate.
    setPlayer(this.player);
    this.cameras.main.startFollow(this.player);
    createAnims(this.anims);

    //Create houses and walls in this world, over the Ground and Player.
    const housesLayer = map.createLayer("Houses", allTileSet);
    const waterfallLayer = map.createLayer("Waterfall", allTileSet);
    const wallsLayer = map.createLayer("Walls", allTileSet);

    //Set walls and houses to collide with Player.
    wallsLayer.setCollisionByProperty({ collides: true });
    housesLayer.setCollisionByProperty({ collides: true });
    waterfallLayer.setCollisionByProperty({ collides: true });
    groundDeluxeLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, housesLayer);
    this.physics.add.collider(this.player, waterfallLayer);
    this.physics.add.collider(this.player, groundDeluxeLayer);

    //Initialize message and item sound.
    this.message = this.add.text(400, 300, "", {
      color: "white",
      backgroundColor: "black",
      fontSize: "12px",
      align: "center",
      baselineX: 0,
      baselineY: 0,
      wordWrap: { width: 250 },
    });
    let item = this.sound.add("item");

    this.warning = 0;

    // Hit spacebar to interact with objects.
    this.cursors.space.on("down", () => {
      console.log(data);

      interact(this.message, this.player, data.layers[5].objects, item);
    }),
      // Hit shift to view Inventory.
      this.cursors.shift.on("down", () => {
        displayInventory(this.message, this.player);
      });
    //debugDraw(wallsLayer, this);
  }

  update(t: number, dt: number) {
    if (!this.cursors || !this.player) {
      return;
    }

    this.playDialogue();
    this.message.x = this.player.x + 20;
    this.message.y = this.player.y + 100;

    // Enter a scene when near.
    this.exits();

    // Camera that follows
    this.cameras.main.scrollX = this.player.x - 400;
    this.cameras.main.scrollY = this.player.y - 300;

    // movement
    let speed = this.message.text ? 0 : 120;
    movePlayer(this.player, speed, this.cursors);
  }

  spawn() {
    /* Add Player sprite to the game.
      In the sprite json file, for any png of sprites,
      the first set of sprites is called "green"
      the second set is called "teal"
      the third set is called "brown"
      and the fourth set is called "doc"
    */
    if (localStorage.from === "hospital") {
      localStorage.removeItem("from");
      this.player = this.physics.add.sprite(
        1250,
        526,
        "player",
        "doc-walk-down-0"
      );
    } else if (localStorage.from === "shop") {
      localStorage.removeItem("from");
      this.player = this.physics.add.sprite(
        32,
        1206,
        "player",
        "doc-walk-down-0"
      );
    } else if (localStorage.from === "home") {
      localStorage.removeItem("from");
      this.player = this.physics.add.sprite(
        788,
        1077,
        "player",
        "doc-walk-down-0"
      );
    } else if (localStorage.from === "atlantis") {
      localStorage.removeItem("from");
      this.player = this.physics.add.sprite(
        808,
        240,
        "player",
        "doc-walk-down-0"
      );
    } else {
      this.player = this.physics.add.sprite(
        800,
        800,
        "player",
        "doc-walk-down-0"
      );
    }
  }

  playDialogue() {
    const goToEnd = dialogue[0];
    if (goToEnd.hasAppeared && this.player.y < 1455) {
      goToEnd.hasAppeared = false;
    }

    if (
      this.player.y > 1490 &&
      this.player.x > 749 &&
      this.player.x < 842 &&
      !goToEnd.hasAppeared
    ) {
      if (this.message.text) this.message.text = "";
      updateText(this.player, dialogue[0], this.message);
      dialogue[0].hasAppeared = true;
    } else {
      let dialogueSpot = isItClose(this.player, dialogue);
      if (dialogueSpot && !dialogueSpot.hasAppeared) {
        if (this.message.text) this.message.text = "";
        updateText(this.player, dialogueSpot, this.message);
        dialogueSpot.hasAppeared = true;
      }
    }
  }

  exits() {
    if (this.player.x < 20 && this.player.y < 785 && this.player.y > 680)
      this.player.setPosition(1575, 790);

    if (this.player.x > 1585 && this.player.y > 745 && this.player.y < 840)
      this.player.setPosition(25, 728);

    let exit = isItClose(this.player, overworldExits);
    if (exit) {
      localStorage.setItem("from", `overworld`);
      this.scene.stop("game");
      this.scene.start(exit.name);
    }
  }
}
