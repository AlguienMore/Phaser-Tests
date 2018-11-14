var Game = {};

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var player;
var speed = 150;
var soundtest;
var game = new Phaser.Game(config);
var bombCD = false;
function preload() {
    this.load.image('tiles', 'assets/source/fantasy-tileset.png');
    this.load.image('sancocho', 'assets/source/32px/sancocho.png');
    this.load.image('acordeon', 'assets/source/32px/acordeon32x32.png');
    this.load.image('ind1', 'assets/ind1reduced.png');
    this.load.spritesheet('papa','assets/source/32px/papaspritesheet.png', {frameWidth: 28, frameHeight: 20});
    this.load.audio('soundtest','assets/source/test.mp3');
    this.load.spritesheet('dude', 'assets/source/32px/PJ.png', { frameWidth: 23, frameHeight: 29 });
    this.load.tilemapTiledJSON('map', 'assets/source/bomb.json');
    this.load.spritesheet('dudeup', 'assets/source/32px/BRP1UP.png', { frameWidth: 22, frameHeight: 29 });
    this.load.spritesheet('dudedown', 'assets/source/32px/BRP1DOWN.png', { frameWidth: 23, frameHeight: 29 });
    this.load.spritesheet('dude2', 'assets/source/32px/BRP12.png', { frameWidth: 24, frameHeight: 29 });
    this.load.spritesheet('explosion', 'assets/source/32px/explosionspritesheet.png', { frameWidth: 96, frameHeight: 96 });

}

function create() {
    const map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });

    const tileset = map.addTilesetImage('fantasy-tileset', 'tiles');

    const capaDebajo = map.createStaticLayer('Below Player', tileset, 0, 0);
    const capaMundo = map.createStaticLayer('World', tileset, 0, 0);
    //const capaDebajo = map.createStaticLayer();

    capaMundo.setCollisionByProperty({ collide: true });

    const sancochoref = map.findObject("Objetos", obj => obj.name === "sancocho");
    const arcodeonref = map.findObject("Objetos", obj => obj.name === "arcodeon");
    let sancocho = this.physics.add.image(sancochoref.x, sancochoref.y, 'sancocho');
    let acordeon = this.physics.add.image(arcodeonref.x+ (arcodeonref.width/2), arcodeonref.y +(arcodeonref.height/2), "acordeon");

    soundtest = this.sound.add('soundtest');

    cursors = this.input.keyboard.createCursorKeys();

    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    let self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    this.bombs = this.physics.add.group();
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (Id) {
            if (players[Id].id === self.socket.id) {
                addNewPlayer(self, players[Id]);
                self.physics.add.collider(player, capaMundo);
                self.physics.add.overlap(player, sancocho, sendSanPowerup, null, self);
                self.physics.add.overlap(player, acordeon, sendArcPowerup, null, self);
            } else {
                addOtherPlayer(self, players[Id]);
            }
        });
    });
    this.socket.on('newplayer', function (playerInfo) {
        addOtherPlayer(self, playerInfo);
    });
    this.socket.on('disconnect', function (id) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (id === otherPlayer.id) {
                otherPlayer.destroy();
            }
        });
    });
    this.socket.on('jugMovido', function (playerInfo) {
        console.log('jugmovido');
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.id === otherPlayer.id) {
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });
    this.socket.on('sancochito', function (players) {
        sancocho.destroy();
    });
    this.socket.on('acordeonmani', function () {
        acordeon.destroy();
        soundtest.play();
    });
    this.socket.on('cuidao', function(bombap){
        console.log('cuidao, cachon');

        let timer = self.time.delayedCall(0, addBomb, [self, bombap], this);
    });
    this.socket.on('bomMovida', function (bombi){
      
        let timer = self.time.delayedCall(0, moveBombi, [self, bombi], this);
    });
    this.socket.on('animartest', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.id === otherPlayer.id) {
                otherPlayer.anims.play(playerInfo.anim);
            }
        });
    });
    
    self.anims.create({
        key: 'up',
        frames: self.anims.generateFrameNumbers('dude', { start: 6, end: 9 }),
        frameRate: 10,
        repeat: -1

    });

    self.anims.create({
        key: 'down',
        frames: self.anims.generateFrameNumbers('dudedown', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1

    });

    self.anims.create({
        key: 'left',
        frames: self.anims.generateFrameNumbers('dude', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1

    });

    self.anims.create({
        key: 'right',
        frames: self.anims.generateFrameNumbers('dude', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1

    });

    self.anims.create({
        key: 'quietou',
        frames: [{ key: 'dude', frame: 6}],
        frameRate: 10,
        repeat: -1
    });

    self.anims.create({
        key: 'quietod',
        frames: [{ key: 'dudedown', frame: 0}],
        frameRate: 10,
        repeat: -1
    });

    self.anims.create({
        key: 'quietol',
        frames: [{ key: 'dude', frame: 2}],
        frameRate: 10,
        repeat: -1
    });

    self.anims.create({
        key: 'quietor',
        frames: [{ key: 'dude', frame: 3}],
        frameRate: 10,
        repeat: -1
    });


    self.anims.create({
        key: 'bomba',
        frames: self.anims.generateFrameNumbers('papa', { start: 0, end: 2 }),
        frameRate: 3,
        repeat: -1

    });

    self.anims.create({
        key: 'boomu',
        frames: self.anims.generateFrameNumbers('explosion', { start: 0, end: 6 }),
        frameRate: 7,
        repeat: -1

    });


}

function update() {
    if (self.player) {
        const pv = player.body.velocity.clone();
        ind1.setPosition(player.x, player.y - 40);
        if (cursors.left.isDown) {
            player.setVelocityX(-speed);
            player.anims.play('left', true);
            this.socket.emit('animacionpls', { velocityx: self.player.velocityX, velocityy: self.player.velocityY });
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(speed);
            player.anims.play('right', true);
            this.socket.emit('animacionpls', { velocityx: self.player.velocityX, velocityy: self.player.velocityY });
        }
        else if (cursors.up.isDown) {
            player.setVelocityY(-speed);
            player.anims.play('up', true);
            this.socket.emit('animacionpls', { velocityx: self.player.velocityX, velocityy: self.player.velocityY });
        }
        else if (cursors.down.isDown) {
            player.setVelocityY(speed);
            player.anims.play('down', true);
            this.socket.emit('animacionpls', { velocityx: self.player.velocityX, velocityy: self.player.velocityY });
        }
        else {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.stop();
        }
        let bombita;
        if(spacebar.isDown){
            console.log('poner bombas');
            if (!bombCD){
                bombita = this.physics.add.sprite(self.player.x, self.player.y, 'papa');
                bombita.anims.play('bomba');
                bombCD = true;
                
                let timer = this.time.delayedCall(2000, cooldownBomb, [bombita], this);
                this.socket.emit('bombapuesta', {x: self.player.x, y: self.player.y});
                this.physics.add.collider(player, bombita);
            }
        }

        if(bombita){
            var px = bombita.x;
        var py = bombita.y;
        if (bombita.oldPosition && (px !== bombita.oldPosition.x || py !== bombita.oldPosition.y)) {

            this.socket.emit('bombamovida', { px: bombita.x, py: bombita.y });
        }
        bombita.oldPosition = {
            x: bombita.x,
            y: bombita.y
        };
        }
        if (pv.y < 0 && cursors.up.isUp){
            player.anims.play('quietou');
        }
        else if(pv.y > 0 && cursors.down.isUp){
            player.anims.play('quietod');
        }
        else if(pv.x < 0 && cursors.left.isUp){
            player.anims.play('quietol');}
            else if(pv.x > 0 && cursors.right.isUp){
                player.anims.play('quietor');}
                player.body.velocity.normalize().scale(speed);
                var x = self.player.x;

                var y = self.player.y;
                if (self.player.oldPosition && (x !== self.player.oldPosition.x || y !== self.player.oldPosition.y)) {

                    this.socket.emit('movimiento', { x: self.player.x, y: self.player.y });
                }
                self.player.oldPosition = {
                    x: self.player.x,
                    y: self.player.y
                };
        //console.log(self.player);
    }
}

function addNewPlayer(self, playerInfo) {
    player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude');
    ind1 = self.physics.add.image(playerInfo.x, playerInfo.y - 50, 'ind1');
    //var name =  prompt("Please enter your name:");
    //this.socket.emit('nombrejugador', name);
}

function addOtherPlayer(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'dude');
    otherPlayer.id = playerInfo.id;
    /*self.anims.create({
        key: 'left',
        frames: self.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    self.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    self.anims.create({
        key: 'right',
        frames: self.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });*/

    self.otherPlayers.add(otherPlayer);
    // self.physics.add.collider(otherPlayers, capaMundo);

}
function addBomb(self, bombita){
    self.anims.create({
        key: 'bombao',
        frames: self.anims.generateFrameNumbers('papa', { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1

    });
    let bombtmp = self.physics.add.staticSprite(bombita.x, bombita.y, 'papa');
    self.bombs.add(bombtmp);
    bombtmp.id = self.socket.id;
    //self.physics.add.collider(self.bombs, self.otherPlayers);
    bombtmp.anims.play('bombao');
    let timer = self.time.delayedCall(2000, cooldownBombserver, [self, bombtmp], this);
    //bombs.add(bombita);
}

function sendSanPowerup(player, sancocho) {
    this.socket.emit('sanPowerupPicked');
    sancocho.destroy();
}
function sendArcPowerup(player, acordeon) {
    this.socket.emit('acorPowerupPicked');
    self.speed = 300;
    let timer = this.time.delayedCall(10000, stopSpeed, [], this);
    acordeon.destroy();

}

function cooldownBomb(bombita){
    bombita.destroy();
    bombCD = false;
    let caboom = this.physics.add.sprite(bombita.x, bombita.y, 'explosion');
    caboom.anims.play('boomu');
    let timer = this.time.delayedCall(1000, destroyboom, [caboom], this);
}

function destroyboom(catabum){
    catabum.destroy();
}

function moveBombi(self,bombi){
    self.bombs.getChildren().forEach(function (b){
        console.log(b.id);
        if (b.id === bombi.id) {
            b.setPosition(bombi.x, bombi.y);
        }
    });
}


function cooldownBombserver(self, bombita){
    console.log('bomba eliminada');
    self.bombs.kill(bombita);
    bombita.destroy();
    bombita = null;
}
function stopSpeed() {
    self.speed = 150;
}