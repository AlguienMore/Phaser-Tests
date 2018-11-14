

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 640,
    parent: "gamescreen",
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let cursors;
let keyM;
let player;
let debug = true;
let sound;
let aculiarTrigger;
let tierraTrigger;
let boostioTrigger;
let playerMap;
let touchingBoostio = false;

function preload() {
    this.load.image("tiles", "/static/assets/processed/tileset/tuxmon-sample-32px.png");
    this.load.image('p25', '/static/assets/personaje25x42.png');
    this.load.tilemapTiledJSON("map", "/static/assets/processed/tilemap/sin nombre2.json");
    this.load.audio('culiar', '/static/assets/processed/sounds/aculiarsound.mp3');
    this.load.audio('tierra', '/static/assets/processed/sounds/tierrasound.mp3');
}

function create() {
    const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32 });

    const tileset = map.addTilesetImage("tuxmon-sample-32px", "tiles");

    const capaDebajo = map.createStaticLayer("Debajo de Jugador", tileset, 0, 0);
    const capaMundo = map.createStaticLayer("Mundo", tileset, 0, 0);
    const capaEncima = map.createStaticLayer("Encima de jugador", tileset, 0, 0);

    capaMundo.setCollisionByProperty({ collides: true });

    capaEncima.setDepth(10);

    playerMap = {};

    const spawnPoint = map.findObject("Objetos", obj => obj.name === "Spawn Point");
    const aculiarRef = map.findObject("Objetos", obj => obj.name === "aculiarTrigger");
    const tierraRef = map.findObject("Objetos", obj => obj.name === "tierraTrigger");
    const boostioRef = map.findObject("Objetos", obj => obj.name === "boostio");

    aculiarTrigger = this.add.zone(aculiarRef.x, aculiarRef.y, aculiarRef.witdh, aculiarRef.height).setOrigin(0, 0);
    tierraTrigger = this.add.zone(tierraRef.x, tierraRef.y, tierraRef.witdh, tierraRef.height).setOrigin(0, 0);
    boostioTrigger = this.add.zone(boostioRef.x,boostioRef.y,boostioRef.width,boostioRef.height).setOrigin(0,0);
    this.physics.world.enable(aculiarTrigger);
    this.physics.world.enable(tierraTrigger);
    this.physics.world.enable(boostioTrigger);

    cursors = this.input.keyboard.createCursorKeys();
    keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'p25');
    this.physics.add.collider(player, capaMundo);
    this.physics.add.overlap(player, aculiarTrigger, playSound, null, this);
    this.physics.add.overlap(player, tierraTrigger, playSound, null, this);
    this.physics.add.overlap(player, boostioTrigger, speedMax, null, this);
   // Client.askNewPlayer();
}
let speed;
function update() {
    if (!touchingBoostio){
        speed = 175;

    }else {

        speed = 500;
    }
    
    const prevVelocity = player.body.velocity.clone();

    // Stop any previous movement from the last frame
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
    }

    // Vertical movement
    if (cursors.up.isDown) {
        player.body.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
        player.body.setVelocityY(speed);
    }

    if (keyM.isDown){
        salvamepls = false;
        n = false;
        touchingBoostio = false;
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    /* if (cursors.left.isDown) {
      player.anims.play("misa-left-walk", true);
    } else if (cursors.right.isDown) {
      player.anims.play("misa-right-walk", true);
    } else if (cursors.up.isDown) {
      player.anims.play("misa-back-walk", true);
    } else if (cursors.down.isDown) {
      player.anims.play("misa-front-walk", true);
    } else {
      player.anims.stop(); */

    // If we were moving, pick and idle frame to use
    /* if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front"); */
}
let salvamepls = false;
function playSound(playert, trigger) {
    if(salvamepls == false){
    if (trigger === aculiarTrigger) {
        sound = this.sound.add('culiar');
    } else if (trigger === tierraTrigger) {
        sound = this.sound.add('tierra');
    }
    sound.play();
    salvamepls = true;
    }

}
let n = false;
function speedMax(){
    if(!n){touchingBoostio = true; n = true;}
    

}

function boostioEnd(){


}
