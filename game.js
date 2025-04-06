const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let player, cursors, startText, gameStarted = false;
let obstacles, score = 0, scoreText, gameOver = false;
let sun, moon, clouds;
let isDay = true;
let startTime;
let switchInterval = 60000;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('jinwoo', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/jinwoo_sprite.png');
    this.load.image('cloud', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/cloud.png');
    this.load.image('sun', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/sun.png');
    this.load.image('moon', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/moon.png');
    this.load.image('ant', 'https://raw.githubusercontent.com/vab-gamer/endless-runner/main/ant.png');
}

function create() {
    startTime = this.time.now;

    this.sky = this.add.rectangle(0, 0, config.width * 2, config.height, 0x87CEEB).setOrigin(0, 0);

    sun = this.add.image(config.width - 100, 100, 'sun').setScale(0.3);
    moon = this.add.image(config.width - 100, 100, 'moon').setScale(0.3).setVisible(false);
    clouds = this.add.group();
    for (let i = 0; i < 3; i++) {
        let cloud = this.add.image(i * 300, 100 + i * 30, 'cloud').setScale(0.4);
        clouds.add(cloud);
    }

    player = this.physics.add.sprite(100, config.height - 150, 'jinwoo').setScale(0.4);
    player.setCollideWorldBounds(true);

    obstacles = this.physics.add.group();

    scoreText = this.add.text(10, 10, 'Time: 0s', {
        fontSize: '20px',
        fill: '#000',
        backgroundColor: '#ffffff',
        padding: { x: 6, y: 4 }
    });

    startText = this.add.text(config.width / 2, config.height / 2, 'Welcome to Vab-Gamer\nTap to Start', {
        fontSize: '28px',
        fill: '#fff',
        align: 'center',
        backgroundColor: '#000'
    }).setOrigin(0.5);

    this.input.on('pointerdown', () => {
        if (!gameStarted) {
            gameStarted = true;
            startText.setVisible(false);
            this.time.addEvent({ delay: 1500, callback: spawnObstacle, callbackScope: this, loop: true });
        } else if (gameOver) {
            location.reload();
        } else {
            if (player.body.touching.down) {
                player.setVelocityY(-450);
            }
        }
    });

    this.physics.add.collider(player, obstacles, hitObstacle, null, this);
}

function update(time, delta) {
    if (!gameStarted || gameOver) return;

    // Scroll clouds
    clouds.children.iterate(cloud => {
        cloud.x -= 0.5;
        if (cloud.x < -100) cloud.x = config.width + 100;
    });

    // Move obstacles
    obstacles.children.iterate(obstacle => {
        obstacle.x -= 4;
        if (obstacle.x < -50) obstacle.destroy();
    });

    // Update score
    score = Math.floor((this.time.now - startTime) / 1000);
    scoreText.setText(`Time: ${score}s`);

    // Day/Night Switch
    if (score % 60 === 0 && score !== 0) {
        if (isDay) {
            this.sky.fillColor = 0x001d3d;
            sun.setVisible(false);
            moon.setVisible(true);
            scoreText.setStyle({ fill: '#fff', backgroundColor: '#000' });
        } else {
            this.sky.fillColor = 0x87CEEB;
            sun.setVisible(true);
            moon.setVisible(false);
            scoreText.setStyle({ fill: '#000', backgroundColor: '#fff' });
        }
        isDay = !isDay;
    }
}

function spawnObstacle() {
    const obstacle = obstacles.create(config.width + 50, config.height - 100, 'ant').setScale(0.3);
    obstacle.setImmovable();
    obstacle.body.allowGravity = false;
}

function hitObstacle() {
    gameOver = true;
    this.physics.pause();
    const overText = this.add.text(config.width / 2, config.height / 2, 'Game Over\nRestart Vab Gaming', {
        fontSize: '26px',
        fill: '#fff',
        backgroundColor: '#000',
        align: 'center'
    }).setOrigin(0.5);
                                   }
