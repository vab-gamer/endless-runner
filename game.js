const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: "#1e1e2f",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let player;
let cursors;
let ground;
let obstacles;
let gameStarted = false;
let startText;

const game = new Phaser.Game(config);

function preload() {
  this.load.image("ground", "https://labs.phaser.io/assets/sprites/platform.png");

  this.load.spritesheet("jinwoo", "https://raw.githubusercontent.com/vab-gamer/endless-runner/refs/heads/main/jinwoo_sprite.png", {
    frameWidth: 32,
    frameHeight: 32
  });

  this.load.image("obstacle", "https://labs.phaser.io/assets/sprites/spike.png");
}

function create() {
  // Tap to start text
  startText = this.add.text(config.width / 2, config.height / 2, "Tap to Start", {
    fontSize: "24px",
    fill: "#ffffff"
  }).setOrigin(0.5);

  // Ground group
  ground = this.physics.add.staticGroup();
  for (let x = 0; x < config.width; x += 64) {
    ground.create(x, config.height - 32, "ground").setScale(0.5).refreshBody();
  }

  // Jinwoo character
  player = this.physics.add.sprite(100, config.height - 100, "jinwoo");
  player.setCollideWorldBounds(true);
  player.setSize(20, 30); // Adjust to fit the sprite

  this.anims.create({
    key: "jinwoo_run",
    frames: this.anims.generateFrameNumbers("jinwoo", { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1
  });

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  this.input.on("pointerdown", startOrJump, this);

  obstacles = this.physics.add.group();
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);
}

function startOrJump() {
  if (!gameStarted) {
    gameStarted = true;
    startText.setVisible(false);
    player.play("jinwoo_run");
    spawnObstacle(this);
  } else if (player.body.touching.down) {
    player.setVelocityY(-350);
  }
}

function spawnObstacle(scene) {
  const obstacle = scene.physics.add.sprite(config.width, config.height - 64, "obstacle");
  obstacle.setVelocityX(-200);
  obstacle.setImmovable(true);
  obstacle.body.allowGravity = false;
  obstacles.add(obstacle);

  // Repeat spawn
  scene.time.addEvent({
    delay: 2000,
    callback: () => spawnObstacle(scene),
    callbackScope: scene
  });
}

function update() {
  if (!gameStarted) return;

  // Scroll ground
  ground.children.iterate(function (tile) {
    tile.x -= 2;
    if (tile.x < -32) {
      tile.x = config.width + 32;
    }
  });

  // Remove off-screen obstacles
  obstacles.children.iterate(function (obstacle) {
    if (obstacle.x < -50) {
      obstacle.destroy();
    }
  });
}

function hitObstacle() {
  game.scene.pause();
  alert("Game Over!");
  location.reload();
}
