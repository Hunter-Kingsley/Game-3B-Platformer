class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 1400;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
        this.RightWallJumpCooldown = 55;
        this.LeftWallJumpCooldown = 55;
        this.player_score = 0;
        this.player_alive = true;
        this.player_respawn_X = game.config.width/4;
        this.player_respawn_Y = game.config.height/2;
        this.game_end = false;
    }

    updateScore() {
        my.text.score.setText("Coins: " + this.player_score);
    }

    create() {

        this.RightWallJumpCooldownCounter = 0;
        this.LeftWallJumpCooldownCounter = 0;

        this.mainbackground1 = this.add.image(370, 200, 'tilemap_background');
        this.mainbackground1.scale = 15
        this.mainbackground2 = this.add.image(1080, 200, 'tilemap_background');
        this.mainbackground2.scale = 15
        this.mainbackground3 = this.add.image(1790, 200, 'tilemap_background');
        this.mainbackground3.scale = 15
        this.mainbackground4 = this.add.image(2500, 200, 'tilemap_background');
        this.mainbackground4.scale = 15

        this.mainbackground1.scrollFactorX = 0.3;
        this.mainbackground2.scrollFactorX = 0.3;
        this.mainbackground3.scrollFactorX = 0.3;
        this.mainbackground4.scrollFactorX = 0.3;

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("Main_Level", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("Kenny_Base", "tilemap_basic");
        this.tileset2 = this.map.addTilesetImage("Kenny_Industrial", "tilemap_industrial");
        this.tileset3 = this.map.addTilesetImage("Kenny_Blocks_Rock", "tilemap_rocks");
        this.tileset4 = this.map.addTilesetImage("Kenny_Blocks_Dirt", "tilemap_stone");

        // Create a layer
        this.groundLayer = this.map.createLayer("Start_Ground", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);
        this.groundLayer2 = this.map.createLayer("Ground_Walls", this.tileset2, 0, 0);
        this.groundLayer2.setScale(2.0);
        this.groundLayer3 = this.map.createLayer("Rock_Blocks", this.tileset3, 0, 0);
        this.groundLayer3.setScale(2.0);
        this.groundLayer4 = this.map.createLayer("Dirt_Blocks", this.tileset4, 0, 0);
        this.groundLayer4.setScale(2.0);
        this.Background1 = this.map.createLayer("Background_Industrial", this.tileset2, 0, 0);
        this.Background1.setScale(2.0);
        this.Background1 = this.map.createLayer("Background_Normal", this.tileset, 0, 0);
        this.Background1.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.groundLayer2.setCollisionByProperty({
            collides: true
        });
        this.groundLayer3.setCollisionByProperty({
            collides: true
        });
        this.groundLayer4.setCollisionByProperty({
            collides: true
        });

        this.coins = this.map.createFromObjects("Coins", {
            name: "Coin",
            key: "spritesheet_basic",
            frame: 151
        });

        this.coins.map((coin) => {
            coin.x *= 2.0;
            coin.y *= 2.0;
            coin.setScale(2.0);
        });

        this.enemies = this.map.createFromObjects("Enemies", {
            name: "Robot",
            key: "platformer_characters",
            frame: 21
        });

        this.enemies.map((enemy) => {
            enemy.x *= 2.0;
            enemy.y *= 2.0;
            enemy.setScale(1.7);
        });

        this.spikes = this.map.createFromObjects("Spikes", {
            name: "Spike",
            key: "spritesheet_basic",
            frame: 68
        });

        this.spikes.map((spike) => {
            spike.x *= 2.0;
            spike.y *= 2.0;
            spike.setScale(2.0);
        });

        this.checkpoints = this.map.createFromObjects("Checkpoints", {
            name: "Checkpoint",
            key: "spritesheet_basic",
            frame: 46
        });

        this.checkpoints.map((checkpoint) => {
            checkpoint.x *= 2.0;
            checkpoint.y *= 2.0;
            checkpoint.setScale(2.0);
        });

        this.end_flag = this.map.createFromObjects("End_Goal", {
            name: "Flag",
            key: "spritesheet_basic",
            frame: 112
        });

        this.end_flag.map((flag) => {
            flag.x *= 2.0;
            flag.y *= 2.0;
            flag.setScale(2.0);
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.player_respawn_X, this.player_respawn_Y, "platformer_characters").setScale(SCALE)

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.groundLayer2);
        this.physics.add.collider(my.sprite.player, this.groundLayer3);
        this.physics.add.collider(my.sprite.player, this.groundLayer4);


        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.enemies, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.physics.world.enable(this.checkpoints, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.end_flag, Phaser.Physics.Arcade.STATIC_BODY);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.coinGroup = this.add.group(this.coins);
        this.enemyGroup = this.add.group(this.enemies);
        this.checkpointGroup = this.add.group(this.checkpoints);
        this.spikeGroup = this.add.group(this.spikes);
        this.endGroup = this.add.group(this.end_flag);

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            if (this.player_alive) {
                obj2.destroy(); // remove coin on overlap
                this.player_score += 1;
                this.updateScore();
            }
                
        });

        this.coinGroup.getChildren().forEach((coin) => {
            coin.anims.play("coin_spin");
        });

        this.endGroup.getChildren().forEach((flag) => {
            flag.anims.play("flag_wave");
        });

        console.log(my.sprite.player)

        // Player Death
        this.physics.add.overlap(my.sprite.player, this.enemyGroup, (obj1, obj2) => {
            if (this.player_alive) {
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setAccelerationY(0);
                my.sprite.player.body.setFriction(0.1);
                my.sprite.player.body.setDragX(400);
                my.sprite.player.body.setBounce(0.6);

                my.sprite.player.anims.play('idle');
                my.sprite.player.body.rotation = 90;
                this.player_score = 0;

                my.text.deathMessage = this.add.bitmapText(game.config.width/2 + this.cameras.main.scrollX - 250, game.config.height/2, "Minecraft0", "          You Died!\nPress [SPACE] to Continue!");
                my.text.deathMessage.setFontSize(50);
                my.text.deathMessage.setBlendMode(Phaser.BlendModes.ADD);
            }
            this.player_alive = false;
        });

        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            if (this.player_alive) {
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setAccelerationY(0);
                my.sprite.player.body.setFriction(0.1);
                my.sprite.player.body.setDragX(400);
                my.sprite.player.body.setBounce(0.6);

                my.sprite.player.anims.play('idle');
                my.sprite.player.body.rotation = 90;
                this.player_score = 0;

                my.text.deathMessage = this.add.bitmapText(game.config.width/2 + this.cameras.main.scrollX - 250, game.config.height/2, "Minecraft0", "          You Died!\nPress [SPACE] to Continue!");
                my.text.deathMessage.setFontSize(50);
                my.text.deathMessage.setBlendMode(Phaser.BlendModes.ADD);
            }
            this.player_alive = false;
        });

        this.physics.add.overlap(my.sprite.player, this.endGroup, (obj1, obj2) => {
            if (this.player_alive) {
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setAccelerationY(0);

                my.sprite.player.anims.play('idle');
                this.player_score = 0;

                my.text.winMessage = this.add.bitmapText(obj2.x - 300, game.config.height/2, "Minecraft0", "           You Win!\nPress [SPACE] to Restart!");
                my.text.winMessage.setFontSize(50);
                my.text.winMessage.setBlendMode(Phaser.BlendModes.ADD);

                this.game_end = true;
            }
            this.player_alive = false;
        });

        this.enemyGroup.getChildren().forEach((enemy) => {
            //console.log(enemy)
            
            if (enemy.rotation < 0) {
                enemy.setFlip(true, false);
            }
            
            enemy.body.allowGravity = false;
            this.physics.add.collider(enemy, this.groundLayer);
            this.physics.add.collider(enemy, this.groundLayer2);
            this.physics.add.collider(enemy, this.groundLayer3);
            this.physics.add.collider(enemy, this.groundLayer4);

            enemy.anims.play("robot_walk");
            enemy.body.setVelocityX(-100);
        });

        this.physics.add.overlap(my.sprite.player, this.checkpointGroup, (obj1, obj2) => {
            if (!obj2.data.values.collected) {
                obj2.data.values.collected = true;
                obj2.setFrame(44);
                this.player_respawn_X = obj2.x;
                this.player_respawn_Y = obj2.y;
            }
        });

        // this.cameras.main.setBounds(0, 0, 4318, 50);
        // this.cameras.main.startFollow(my.sprite.player);

        this.cameras.main.setBounds(36, 0, 4248, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(150, 150);

        my.text.score = this.add.bitmapText(25, 30, "Minecraft1", "Coins: " + this.player_score);
        my.text.score.setFontSize(50);
        my.text.score.setBlendMode(Phaser.BlendModes.DARKEN);

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-Q', () => {
            my.sprite.player.x = 4100;
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.sprite.player.body.setMaxVelocityX(300);
        my.sprite.player.body.setMaxVelocityY(900);
    }

    update() {

        //console.log(this.cameras.main.scrollX);

        my.text.score.x = this.cameras.main.scrollX + 25;
        my.text.score.y = this.cameras.main.scrollY + 25;

        if(this.RightWallJumpCooldownCounter > 0) {
            this.RightWallJumpCooldownCounter--;
        }
        if (this.LeftWallJumpCooldownCounter > 0) {
            this.RightWallJumpCooldownCounter = 0;
        }

        if(this.LeftWallJumpCooldownCounter > 0) {
            this.LeftWallJumpCooldownCounter--;
        } 
        if (this.RightWallJumpCooldownCounter > 0) {
            this.LeftWallJumpCooldownCounter = 0;
        }

        if(this.player_alive) {
            if(cursors.left.isDown) {
                // TODO: have the player accelerate to the left
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);

                
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);

            } else if(cursors.right.isDown) {
                // TODO: have the player accelerate to the right
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);

                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);

            } else {
                // TODO: set acceleration to 0 and have DRAG take over
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);

                my.sprite.player.anims.play('idle');
            }

            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

            }
            
            if(my.sprite.player.body.blocked.right && !my.sprite.player.body.blocked.down && (this.RightWallJumpCooldownCounter < 1) && (my.sprite.player.body.velocity.y > 150)) {
                my.sprite.player.body.setVelocityY(150);
            }
            if(my.sprite.player.body.blocked.left && !my.sprite.player.body.blocked.down && (this.LeftWallJumpCooldownCounter < 1) && (my.sprite.player.body.velocity.y > 150)) {
                my.sprite.player.body.setVelocityY(150);
            }

            if(my.sprite.player.body.blocked.right && Phaser.Input.Keyboard.JustDown(cursors.up) && !(my.sprite.player.body.blocked.down) && (my.sprite.player.body.velocity.y > -100) && (this.RightWallJumpCooldownCounter < 1)) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                my.sprite.player.body.setVelocityX(-20000);
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                this.RightWallJumpCooldownCounter = this.RightWallJumpCooldown;
            }
            if(my.sprite.player.body.blocked.left && Phaser.Input.Keyboard.JustDown(cursors.up) && !(my.sprite.player.body.blocked.down) && (my.sprite.player.body.velocity.y > -100) && (this.LeftWallJumpCooldownCounter < 1)) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                my.sprite.player.body.setVelocityX(20000);
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                this.LeftWallJumpCooldownCounter = this.LeftWallJumpCooldown;
            }
        } else {
            if (this.space.isDown && (this.game_end == false)) {
                this.updateScore();
                my.text.deathMessage.destroy();
                my.sprite.player.x = this.player_respawn_X;
                my.sprite.player.y = this.player_respawn_Y;
                my.sprite.player.body.setFriction(1);
                my.sprite.player.body.setDragX(this.DRAG);
                my.sprite.player.body.setBounce(0);
                my.sprite.player.body.rotation = 0;
                this.player_alive = true;
            } else if (this.space.isDown && (this.game_end == true)) {
                this.updateScore();
                this.game_end = false;
                this.player_alive = true;
                my.sprite.player.destroy();
                this.scene.start("bufferScene");
            }
        }
            

        this.enemyGroup.getChildren().forEach((enemy) => {
            if (enemy.body.blocked.left) {
                if (enemy.flipX == false) {
                    enemy.flipX = true;
                } else {
                    enemy.flipX = false;
                }
                enemy.body.setVelocityX(100);
            } else if (enemy.body.blocked.right) {
                if (enemy.flipX == false) {
                    enemy.flipX = true;
                } else {
                    enemy.flipX = false;
                }
                enemy.body.setVelocityX(-100);
            }
        });
    }
}