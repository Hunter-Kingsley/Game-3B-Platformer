class Buffer extends Phaser.Scene {
    constructor() {
        super("bufferScene");
    }

    create() {
        this.scene.start("platformerScene");
    }
}