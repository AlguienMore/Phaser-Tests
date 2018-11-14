var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var plaforms;
var player;
var cursors;
var stars;
var bombs;
var ind1;
var ind2;

var p3;
var p4;
var p5;

var keyW;
var keyA;
var keyS;
var keyD;

var mainScreen;

var score = 0;
var score2 = 0;
var scoreText;
var scoreText2;
var timer;
var bombP1;
var bombP1planted;
var bombP2;
var bombP2planted;
var gameOver;

var game = new Phaser.Game(config);


function preload ()
{
    
    this.load.image('cielo','assets/sky.png');
    this.load.image('piso','assets/platform.png');
    this.load.image('estrella','assets/personaje47x79.png');
    this.load.image('estrella2','assets/personaje47x79.png');
    this.load.image('p32','assets/personaje32x54.png');
    this.load.image('p25','assets/personaje25x42.png');
    this.load.image('bomba','assets/bomb.png');
    this.load.image('ind1','assets/ind1reduced.png');
    this.load.image('ind2','assets/ind2reduced.png');
    this.load.spritesheet('dude','assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

function create ()
{
    this.add.image(400,300, 'cielo');

    scoreText = this.add.text(16,16, 'Score P1: 0', {fontSize: '36px', fill: '#000'});
    scoreText2 = this.add.text(516, 16, 'Score P2: 0', {fontSize: '36px', fill: '#000'});
    timerTest = this.add.text(16, 100, 'timerTest');
    bombP1planted = false;
    bombP2planted = false;        

    p3 = this.physics.add.sprite(440, 450, 'p32');
    p4 = this.physics.add.sprite(330, 450, 'p25');

    platforms = this.physics.add.staticGroup();
    bombP1 = this.physics.add.staticGroup();
    bombP2 = this.physics.add.staticGroup();
    player = this.physics.add.sprite(110, 450, 'p32');
    player2 = this.physics.add.sprite(220, 450, 'p25');
    bombs = this.physics.add.group();
    ind1 = this.physics.add.staticSprite(110, player.y , 'ind1');
    ind2 = this.physics.add.staticSprite(220, player2.y, 'ind2');
    stars = this.physics.add.group({
        key: 'estrella',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70}
    });

    

    cursors = this.input.keyboard.createCursorKeys();
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    platforms.create(400,568, 'piso').setScale(2).refreshBody();
    platforms.create(600, 400, 'piso');
    platforms.create(50, 250, 'piso');
    platforms.create(750, 220, 'piso');
    
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    player2.setBounce(0.2);
    player2.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player2, platforms);
    this.physics.add.collider(player, bombs, bombCollide,null, this);
    this.physics.add.collider(player2, bombs, bombCollide,null, this);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.overlap(player2, stars, collectStar, null, this);
    this.physics.add.overlap(player, bombP2, defuseBomb, null, this);
    this.physics.add.overlap(player2, bombP1, defuseBomb, null, this);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);


    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4}],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    });

    stars.children.iterate(function (child){

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    timer = this.time.delayedCall(2000, createBomb(), [], this);
    timer.pause;
    this.physics.pause();
    
    
}

function update ()
{
    
/*
    ind1.setPosition(player.x, player.y-25);
    ind2.setPosition(player2.x, player2.y-25);

    

    if(cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if(cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-150);
    }

    if(keyF.isDown && !bombP2planted && !bombP1planted)
    {
        timer = this.time.delayedCall(2000, createBomb(player2), [], this);
        timerTest.setText('Event.progress: ' + timer.getProgress().toString());
        // timer.loop(2000, bombCreate(player), this);
        // timer.start();
        
    }
    if(keyF.isUp)
    {
        timer.pause;
    }


    if(keyEnter.isDown && !bombP2planted && !bombP1planted)
    {
        timer = this.time.delayedCall(2000, createBomb(player), [], this);
        // timer.loop(2000, bombCreate(player2), this);
        // timer.start();
    }
    if(keyF.isUp)
    {
        //timer.stop();
    }



    if(keyA.isDown)
    {
        player2.setVelocityX(-160);
        player2.anims.play('left', true);
    }
    else if(keyD.isDown)
    {
        player2.setVelocityX(160);
        player2.anims.play('right', true);
    }
    else
    {
        player2.setVelocityX(0);
        player2.anims.play('turn');
    }
    if (keyW.isDown && player2.body.touching.down)
    {
        player2.setVelocityY(-330);
    }
   
}

function collectStar(playertouch, star)
{
    star.disableBody(true, true);

    if (playertouch == player){
        score+= 10;
        scoreText.setText('Score P1: '+score);

    } else if (playertouch == player2){
        score2+= 10;
        scoreText2.setText('Score P2: '+score2);

    }

    if(stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child){
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x) < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0,400);

        var bomb = bombs.create(x, 16, 'bomba');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function bombCollide(player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

function createBomb(playertouch){
    if(playertouch == player)
    {
        bombP1.create(playertouch.x, playertouch.y+8, 'bombi');
        bombP1planted = true;
    }

    if(playertouch == player2)
    {
        bombP2.create(playertouch.x, playertouch.y+8, 'bombi');
        bombP2planted = true;
    }
}

function defuseBomb(playertouch, bomb){
    if((keyF.isDown && playertouch == player2) || (keyEnter.isDown && playertouch == player))
    {
        bomb.disableBody(true, true);
        if (bombP1planted) {bombP1planted = false;} else if(bombP2planted){bombP2planted = false;}
    }
    */
}