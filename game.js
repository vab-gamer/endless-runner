const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: "#87CEEB", // Day sky color
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update
  }
};

let player, cursors, ground, obstacles, clouds;
let gameStarted = false;
let scoreText, timer = 0;
let sun, moon, isDay = true;
let startBox, gameOverBox;

const game = new Phaser.Game(config);

function preload() {
  this.load.image("ground", "https://labs.phaser.io/assets/sprites/platform.png");
  this.load.spritesheet("jinwoo", "https://raw.githubusercontent.com/vab-gamer/endless-runner/refs/heads/main/jinwoo_sprite.png", {
    frameWidth: 128,
    frameHeight: 128
  });
  this.load.image("obstacle", "https://labs.phaser.io/assets/sprites/spike.png");
  this.load.image("cloud", "https://labs.phaser.io/assets/skies/cloud1.png");
  this.load.image("sun", "https://labs.phaser.io/assets/skies/sun.png");
  this.load.image("moon", "https://labs.phaser.io/assets/skies/moon.png");
}

function create() {
  // Background objects
  clouds = this.add.tileSprite(0, 100, 800, 200, "cloud").setOrigin(0, 0).setScrollFactor(0);
  sun = this.add.image(700, 80, "sun").setScale(0.5).setScrollFactor(0);
  moon = this.add.image(100, 80, "moon").setScale(0.5).setScrollFactor(0).setAlpha(0);

  // Start box
  startBox = this.add.text(400, 160, "Welcome to Vab-Gamer\nTap to Start", {
    fontSize: "24px",
    fill: "#ffffff",
    backgroundColor: "#000000aa",
    align: "center",
    padding: 10
  }).setOrigin(0.5);

  // Ground
  ground = this.physics.add.staticGroup();
  for (let x = 0; x < config.width; x += 64) {
    ground.create(x, config.height - 32, "ground").setScale(0.5).refreshBody();
  }

  // Jinwoo
  player = this.physics.add.sprite(100, config.height - 150, "jinwoo");
  player.setCollideWorldBounds(true).setSize(64, 100).setScale(0.8);

  // Animation
  this.anims.create({
    key: "jinwoo_run",
    frames: this.anims.generateFrameNumbers("jinwoo", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
  this.input.on("pointerdown", startOrJump, this);

  obstacles = this.physics.add.group();
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // Score
  scoreText = this.add.text(10, 10, "Time: 0", {
    fontSize: "18px",
    fill: "#ffffff"
  }).setScrollFactor(0);

  // Game Over Box
  gameOverBox = this.add.text(400, 180, "Game Over\nRestart Vab Gaming", {
    fontSize: "22px",
    fill: "#ffffff",
    backgroundColor: "#000000aa",
    align: "center",
    padding: 10
  }).setOrigin(0.5).setVisible(false).setInteractive();

  gameOverBox.on("pointerdown", () => location.reload());
}

function startOrJump() {
  if (!gameStarted) {
    gameStarted = true;
    startBox.setVisible(false);
    player.play("jinwoo_run");
    spawnObstacle(this);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        timer++;
        scoreText.setText("Time: " + timer + "s");

        if (timer % 60 === 0) toggleDayNight(this);
      }
    });
  } else if (player.body.touching.down) {
    player.setVelocityY(-350);
  }
}

function spawnObstacle(scene) {
  const obstacle = scene.physics.add.sprite(config.width, config.height - 64, "obstacle");
  obstacle.setVelocityX(-200).setImmovable(true).setGravity(false);
  obstacles.add(obstacle);

  scene.time.addEvent({
    delay: 2000,
    callback: () => spawnObstacle(scene),
    callbackScope: scene
  });
}

function toggleDayNight(scene) {
  isDay = !isDay;
  const bgColor = isDay ? "#87CEEB" : "#1e1e2f";
  scene.cameras.main.setBackgroundColor(bgColor);

  scene.tweens.add({
    targets: sun,
    alpha: isDay ? 1 : 0,
    duration: 1000
  });

  scene.tweens.add({
    targets: moon,
    alpha: isDay ? 0 : 1,
    duration: 1000
  });
}

function update() {
  if (!gameStarted) return;

  clouds.tilePositionX += 0.5;

  ground.children.iterate(tile => {
    tile.x -= 2;
    if (tile.x < -32) tile.x = config.width + 32;
  });

  obstacles.children.iterate(obstacle => {
    if (obstacle.x < -50) obstacle.destroy();
  });
}

function hitObstacle() {
  game.scene.pause();
  gameOverBox.setVisible(true);
    }
