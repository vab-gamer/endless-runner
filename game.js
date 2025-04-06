const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let player, cursors, ground, obstacles, scoreText, score = 0, gameOver = false;
let background, clouds, sun, moon, startText, welcomeText, gameOverText, restartText;
let started = false;
let dayMode = true;
let dayTimer = 0;

function preload() {
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('cloud', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/cloud.png');
    this.load.image('sun', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/sun.png');
    this.load.image('moon', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/moon.png');
    this.load.image('ant', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/ant.png');
    this.load.spritesheet('jinwoo', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/jinwoo_sprite.png', {
        frameWidth: 64,
        frameHeight: 64
    });
}

function create() {
    background = this.add.rectangle(0, 0, config.width * 2, config.height * 2, 0x87ceeb).setOrigin(0);

    clouds = this.add.image(100, 100, 'cloud').setScrollFactor(0.2).setScale(0.5);
    sun = this.add.image(config.width - 100, 100, 'sun').setScale(0.5);
    moon = this.add.image(config.width - 100, 100, 'moon').setVisible(false).setScale(0.5);

    ground = this.physics.add.staticGroup();
    for (let i = 0; i < config.width; i += 128) {
        ground.create(i, config.height - 32, 'ground').setScale(2).refreshBody();
    }

    player = this.physics.add.sprite(100, config.height - 150, 'jinwoo').setScale(2).setCollideWorldBounds(true);

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('jinwoo', { start: 0, end: 0 }), // Still frame (1 FPS)
        frameRate: 1,
        repeat: -1
    });
    player.anims.play('idle', true);

    obstacles = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', () => {
        if (!started) {
            started = true;
            startText.setVisible(false);
            welcomeText.setVisible(false);
            scoreText.setVisible(true);
        } else if (!gameOver && player.body.touching.down) {
            player.setVelocityY(-600);
        }
    });

    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    scoreText = this.add.text(10, 10, 'Score: 0', {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#000',
        padding: { x: 10, y: 5 }
    }).setScrollFactor(0).setVisible(false);

    startText = this.add.text(config.width / 2, config.height / 2 + 40, 'Tap to Start', {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#000'
    }).setOrigin(0.5);

    welcomeText = this.add.text(config.width / 2, config.height / 2 - 20, 'Welcome to Vab-Gamer', {
        fontSize: '28px',
        fill: '#fff',
        backgroundColor: '#000'
    }).setOrigin(0.5);

    gameOverText = this.add.text(config.width / 2, config.height / 2 - 20, 'Game Over', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#000'
    }).setOrigin(0.5).setVisible(false);

    restartText = this.add.text(config.width / 2, config.height / 2 + 20, 'Restart Vab Gaming', {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#000'
    }).setOrigin(0.5).setVisible(false).setInteractive();

    restartText.on('pointerdown', () => {
        this.scene.restart();
        score = 0;
        gameOver = false;
    });
}

function update(time, delta) {
    if (!started || gameOver) return;

    dayTimer += delta;

    // Switch day/night every 60 seconds
    if (dayTimer > 60000) {
        dayMode = !dayMode;
        dayTimer = 0;
        background.fillColor = dayMode ? 0x87ceeb : 0x000033;
        sun.setVisible(dayMode);
        moon.setVisible(!dayMode);
    }

    // Clouds move
    clouds.x += 0.3;
    if (clouds.x > config.width + 100) clouds.x = -100;

    // Auto scroll obstacles
    Phaser.Actions.IncX(obstacles.getChildren(), -5);
    obstacles.children.iterate(obstacle => {
        if (obstacle && obstacle.x < -50) obstacle.destroy();
    });

    // Spawn new obstacle
    if (Phaser.Math.Between(0, 100) < 2) {
        const ant = obstacles.create(config.width + 50, config.height - 80, 'ant').setScale(0.5);
        ant.body.setAllowGravity(false);
        ant.setImmovable(true);
    }

    // Increase score
    score += delta / 1000;
    scoreText.setText('Score: ' + Math.floor(score));
}

function hitObstacle(player, obstacle) {
    gameOver = true;
    gameOverText.setVisible(true);
    restartText.setVisible(true);
    scoreText.setVisible(true);
                      }
