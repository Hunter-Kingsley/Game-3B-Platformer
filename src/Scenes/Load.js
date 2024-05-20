class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/kenney_pixel-platformer/Tilemap/");

        // Load characters spritesheet
        this.load.spritesheet("platformer_characters", "tilemap-characters_packed.png", { frameWidth: 24, frameHeight: 24 });
        this.load.image("tilemap_background", "tilemap-background_green.png");

        // Load tilemap information
        this.load.image("tilemap_basic", "tilemap_packed.png");
        this.load.spritesheet("spritesheet_basic", "tilemap_packed.png", { frameWidth: 18, frameHeight: 18 });

        this.load.setPath("./assets/kenney_pixel-platformer-industrial-expansion/Tilemap/");
        this.load.image("tilemap_industrial", "tilemap_packed.png");

        this.load.setPath("./assets/kenney_pixel-platformer-blocks/Tilemap/");
        this.load.image("tilemap_rocks", "rock_packed.png");
        this.load.image("tilemap_stone", "stone_packed.png");
        
        this.load.setPath("./assets/");
        this.load.tilemapTiledJSON("Main_Level", "Main_Map.tmj");   // Tilemap in JSON
        this.load.bitmapFont("Minecraft", "Minecraft_1.png", "Minecraft.fnt");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('platformer_characters', {
                start: 6,
                end: 7,
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: 6 }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: 7 }
            ],
        });

        this.anims.create({
            key: 'coin_spin',
            frames: this.anims.generateFrameNumbers('spritesheet_basic', {
                start: 151,
                end: 152,
            }),
            frameRate: 5,
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}