const config = {
  type: Phaser.AUTO,
  backgroundColor: "#87CEEB",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "game-container",
    width: window.innerWidth,
    height: window.innerHeight
  },
  physics: {
    default: "arcade",
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

let game = new Phaser.Game(config);
let player, cursors, ground, obstacles, clouds, sun, moon;
let startBox, gameOverBox, scoreBox;
let timer = 0, scoreText, gameStarted = false, isDay = true;

function preload() {
  this.load.image("ground", "https://labs.phaser.io/assets/sprites/platform.png");
  this.load.image("cloud", "https://labs.phaser.io/assets/skies/cloud1.png");
  this.load.image("sun", "https://labs.phaser.io/assets/skies/sun.png");
  this.load.image("moon", "https://labs.phaser.io/assets/skies/moon.png");
  this.load.image("obstacle", "https://labs.phaser.io/assets/sprites/spike.png");

  this.load.spritesheet("jinwoo", "https://raw.githubusercontent.com/vab-gamer/endless-runner/main/jinwoo_sprite.png", {
    frameWidth: 128,
    frameHeight: 128
  });
}

function create() {
  const w = this.scale.width;
  const h = this.scale.height;

  // Clouds
  clouds = this.add.tileSprite(0, 50, w, 200, "cloud").setOrigin(0).setScrollFactor(0);

  // Sun & Moon
  sun = this.add.image(w - 100, 80, "sun").setScale(0.5).setAlpha(1);
  moon = this.add.image(100, 80, "moon").setScale(0.5).setAlpha(0);

  // Start Message
  startBox = this.add.text(w / 2, h / 2 - 100, "Welcome to Vab-Gamer\nTap to Start", {
    fontSize: "24px",
    fill: "#ffffff",
    backgroundColor: "#000000aa",
    align: "center",
    padding: 10
  }).setOrigin(0.5);

  // Ground
  ground = this.physics.add.staticGroup();
  const tileCount = Math.ceil(w / 64);
  for (let i = 0; i <= tileCount; i++) {
    ground.create(i * 64, h - 32, "ground").setScale(0.5).refreshBody();
  }

  // Player
  player = this.physics.add.sprite(w * 0.15, h - 150, "jinwoo");
  player.setCollideWorldBounds(true).setScale(0.6).setSize(64, 100);

  this.anims.create({
    key: "jinwoo_run",
    frames: this.anims.generateFrameNumbers("jinwoo", { start: 0, end: 3 }),
    frameRate: 6, // Slower for clarity
    repeat: -1
  });

  this.input.on("pointerdown", startOrJump, this);

  cursors = this.input.keyboard.createCursorKeys();
  obstacles = this.physics.add.group();
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // Score Box
  scoreBox = this.add.rectangle(70, 30, 140, 30, 0x000000, 0.5).setScrollFactor(0);
  scoreText = this.add.text(10, 20, "Time: 0", {
    fontSize: "18px",
    fill: "#ffffff"
  }).setScrollFactor(0);

  // Game Over Box
  gameOverBox = this.add.text(w / 2, h / 2, "Game Over\nRestart Vab Gaming", {
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
    player.setVelocityY(-400);
  }
}

function spawnObstacle(scene) {
  const h = scene.scale.height;
  const obstacle = scene.physics.add.sprite(scene.scale.width + 50, h - 64, "obstacle");
  obstacle.setVelocityX(-250).setImmovable(true).setGravity(false);
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

  scene.tweens.add({ targets: sun, alpha: isDay ? 1 : 0, duration: 1000 });
  scene.tweens.add({ targets: moon, alpha: isDay ? 0 : 1, duration: 1000 });
}

function update() {
  if (!gameStarted) return;

  clouds.tilePositionX += 0.4;

  ground.children.iterate(tile => {
    tile.x -= 2;
    if (tile.x < -32) tile.x = config.scale.width + 32;
  });

  obstacles.children.iterate(obstacle => {
    if (obstacle.x < -50) obstacle.destroy();
  });
}

function hitObstacle() {
  game.scene.pause();
  gameOverBox.setVisible(true);
    }
