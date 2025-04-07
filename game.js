// Endless Runner Game with Custom Assets

const config = { type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight, physics: { default: 'arcade', arcade: { gravity: { y: 600 }, debug: false } }, scene: { preload: preload, create: create, update: update } };

const game = new Phaser.Game(config);

let jinwoo, obstacles, cursors, scoreText, gameStarted = false, gameOver = false; let startText, gameOverText, restartText; let clouds, sun, moon, score = 0, startTime;

function preload() { this.load.image('cloud', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/refs/heads/main/cloud.png'); this.load.image('sun', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/refs/heads/main/sun.png'); this.load.image('moon', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/refs/heads/main/moon.png'); this.load.image('ant', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/refs/heads/main/ant.png'); this.load.spritesheet('jinwoo', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/refs/heads/main/jinwoo_sprite.png', { frameWidth: 128, frameHeight: 128 }); }

function create() { // Background elements sun = this.add.image(this.scale.width - 60, 60, 'sun').setScrollFactor(0).setScale(0.5); moon = this.add.image(this.scale.width - 60, 60, 'moon').setScrollFactor(0).setScale(0.5).setVisible(false);

clouds = this.add.group();
clouds.add(this.add.image(100, 80, 'cloud').setScrollFactor(0.5));
clouds.add(this.add.image(300, 150, 'cloud').setScrollFactor(0.5));

// Jinwoo sprite
jinwoo = this.physics.add.sprite(50, this.scale.height - 150, 'jinwoo').setScale(0.7);
jinwoo.setCollideWorldBounds(true);
this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('jinwoo', { start: 0, end: 3 }),
    frameRate: 1,
    repeat: -1
});
jinwoo.play('run');

// Obstacle group
obstacles = this.physics.add.group();

// Tap to start screen
startText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Welcome to Vab-Gamer\nTap to Start', {
    fontSize: '28px',
    fill: '#ffffff',
    align: 'center',
    backgroundColor: '#000000aa',
    padding: { x: 20, y: 10 }
}).setOrigin(0.5);

// Score text
scoreText = this.add.text(10, 10, 'Score: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000cc',
    padding: { x: 10, y: 5 }
}).setScrollFactor(0);

// Input
this.input.on('pointerdown', () => {
    if (!gameStarted) {
        startGame.call(this);
    } else if (!gameOver && jinwoo.body.touching.down) {
        jinwoo.setVelocityY(-400);
    }
});

// Collision with obstacles
this.physics.add.collider(jinwoo, obstacles, () => {
    endGame.call(this);
}, null, this);

}

function startGame() { gameStarted = true; startText.setVisible(false); startTime = this.time.now;

// Start spawning obstacles
this.time.addEvent({
    delay: 2000,
    loop: true,
    callback: () => {
        const ant = obstacles.create(this.scale.width + 50, this.scale.height - 100, 'ant');
        ant.setVelocityX(-200);
        ant.setScale(0.5);
    }
});

}

function endGame() { gameOver = true; jinwoo.setTint(0xff0000);

gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'Game Over', {
    fontSize: '32px',
    fill: '#ffffff',
    backgroundColor: '#000000aa',
    padding: { x: 20, y: 10 }
}).setOrigin(0.5);

restartText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 20, 'Restart Vab Gaming', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000aa',
    padding: { x: 15, y: 8 }
}).setOrigin(0.5).setInteractive();

restartText.on('pointerdown', () => window.location.reload());

}

function update(time, delta) { if (!gameStarted || gameOver) return;

// Update clouds
clouds.children.iterate(cloud => {
    cloud.x -= 0.2;
    if (cloud.x < -cloud.width) cloud.x = this.scale.width + cloud.width;
});

// Update score
score = Math.floor((time - startTime) / 1000);
scoreText.setText('Score: ' + score);

// Day-night cycle
const dayLength = 60; // seconds
const cycle = Math.floor(score / dayLength) % 2;
sun.setVisible(cycle === 0);
moon.setVisible(cycle === 1);

}

    
