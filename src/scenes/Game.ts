import Phaser from "phaser";
import { debugDraw } from "../utils/debug";
//import data from "../tiles/overworld.json";
import data from "../../public/tiles/overworld.json";
import {
  isItClose,
  setPlayer,
  movePlayer,
  overworldExits,
  overworldObjs,
  createAnims,
  interact,
  displayInventory,
  updateInventory,
  updateText,
} from "../utils/helper";

const dialogue = [
  {
    x: 0,
    y: 0,
    properties: [{ name: "message", value: "Hello World" }],
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
    // const overworld = map.addTilesetImage("overworld", "Ground");
    const groundLayer = map.createLayer("Ground", allTileSet);
    const groundDeluxeLayer = map.createLayer("GroundDeluxe", allTileSet);
    /* Add Player sprite to the game.
      In the sprite json file, for any png of sprites,
      the first set of sprites is called "green"
      the second set is called "teal"
      the third set is called "brown"
      and the fourth set is called "doc"
    */
    //map.create
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
        322,
        1240,
        "player",
        "doc-walk-down-0"
      );
    } else if (localStorage.from === "home") {
      localStorage.removeItem("from");
      this.player = this.physics.add.sprite(
        788,
        1101,
        "player",
        "doc-walk-down-0"
      );
    } else if (localStorage.from === "cave") {
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

    setPlayer(this.player);

    //adds and configs music

    // let music = this.sound.add("music");
    // let musicConfig = {
    //   mute: false,
    //   volume: 0.5,
    //   rate: 1,
    //   detune: 0,
    //   seek: 0,
    //   loop: true,
    //   delay: 0,
    // };
    // music.play(musicConfig);
    let item = this.sound.add("item");

    //Create animations
    createAnims(this.anims);

    //Create houses and walls in this world, over the Ground and Player.
    const housesLayer = map.createLayer("Houses", allTileSet);
    const waterfallLayer = map.createLayer("Waterfall", allTileSet);
    const wallsLayer = map.createLayer("Walls", allTileSet);

    // this.cameras.main.startFollow(this.player, true);
    // this.cameras.main.setBounds(0, 0, 1600, 1600);
    // this.cameras.main.centerOn(600, 600);
    //Set walls and houses to collide with Player.
    wallsLayer.setCollisionByProperty({ collides: true });
    housesLayer.setCollisionByProperty({ collides: true });
    waterfallLayer.setCollisionByProperty({ collides: true });
    groundDeluxeLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, housesLayer);
    this.physics.add.collider(this.player, waterfallLayer);
    this.physics.add.collider(this.player, groundDeluxeLayer);

    this.message = this.add.text(800, 750, "", {
      color: "white",
      backgroundColor: "black",
      fontSize: "12px",
      align: "center",
      baselineX: 0,
      baselineY: 0,
      wordWrap: { width: 250 },
    });

    this.warning = 0;

    // Hit spacebar to interact with objects.
    this.cursors.space.on("down", () => {
      console.log(data);

      interact(this.message, this.player, data.layers[5].objects, item);

    }),
      // Hit shift to view Inventory.
      this.cursors.shift.on("down", () => {
        displayInventory(this.message, this.player);
      }),
      debugDraw(wallsLayer, this);
  }
  update(t: number, dt: number) {
    if (!this.cursors || !this.player) {
      return;
    }

    this.message.x = this.player.x + 20;
    this.message.y = this.player.y + 100;

    // Enter a scene when near
    let nextToTarget = isItClose(this.player, overworldExits);

    if (nextToTarget) {

      localStorage.setItem("from", `overworld`);
      this.scene.start(nextToTarget.name);
    }

    let closeToDialogueObj = isItClose(this.player, dialogue);
    if (closeToDialogueObj && !closeToDialogueObj.hasAppeared) {
      console.log("close to obj");
      if (this.message.text) this.message.text = "";
      else {
        console.log("updating");
        updateText(this.player, closeToDialogueObj, this.message);
        closeToDialogueObj.hasAppeared = true;
        // let i = 1;
        // localStorage.setItem(`taken${i}`, closeToDialogueObj);
        // console.log(localStorage);
        // i++;
      }
    }

    // Camera that follows
    this.cameras.main.scrollX = this.player.x - 400;
    this.cameras.main.scrollY = this.player.y - 300;

    // movement
    let speed = this.message.text ? 0 : 120;
    movePlayer(this.player, speed, this.cursors);
  }
}
