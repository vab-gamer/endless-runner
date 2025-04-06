const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: { preload, create, update },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let player, cursors, obstacles, scoreText, score = 0;
let gameOver = false;
let jumpSound, hitSound, restartText;

const game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "https://labs.phaser.io/assets/skies/sky4.png");
  this.load.image("ground", "https://labs.phaser.io/assets/sprites/platform.png");
  this.load.spritesheet("player", "https://labs.phaser.io/assets/sprites/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image("obstacle", "https://labs.phaser.io/assets/sprites/crate.png");

  this.load.audio("jump", "https://labs.phaser.io/assets/audio/SoundEffects/jump.wav");
  this.load.audio("hit", "https://labs.phaser.io/assets/audio/SoundEffects/hit.mp3");
}

function create() {
  this.add.image(config.width / 2, config.height / 2, "sky").setDisplaySize(config.width, config.height);

  const ground = this.physics.add.staticGroup();
  ground.create(config.width / 2, config.height - 20, "ground")
        .setScale(2)
        .refreshBody()
        .setDisplaySize(config.width, 40);

  player = this.physics.add.sprite(100, config.height - 100, "player");
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "run",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "idle",
    frames: [{ key: "player", frame: 4 }],
    frameRate: 10
  });

  player.play("run");

  cursors = this.input.keyboard.createCursorKeys();
  jumpSound = this.sound.add("jump");
  hitSound = this.sound.add("hit");

  obstacles = this.physics.add.group();

  this.physics.add.collider(player, ground);
  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, obstacles, hitObstacle, null, this);

  score = 0;
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "24px",
    fill: "#000"
  });

  this.time.addEvent({
    delay: 1500,
    callback: () => {
      if (!gameOver) {
        const obstacle = obstacles.create(config.width, config.height - 60, "obstacle");
        obstacle.setVelocityX(-300);
        obstacle.setImmovable(true);
        obstacle.body.allowGravity = false;
      }
    },
    loop: true
  });

  restartText = this.add.text(config.width / 2, config.height / 2, "Game Over\nPress R or Tap Restart", {
    fontSize: "32px",
    fill: "#ff0000",
    align: "center"
  }).setOrigin(0.5).setVisible(false);

  this.input.keyboard.on("keydown-R", () => {
    if (gameOver) restartGame.call(this);
  });

  document.getElementById("jumpBtn").addEventListener("touchstart", () => {
    if (!gameOver && player.body.touching.down) {
      player.setVelocityY(-500);
      jumpSound.play();
    }
  });

  document.getElementById("restartBtn").addEventListener("touchstart", () => {
    if (gameOver) restartGame.call(this);
  });
}

function update() {
  if (gameOver) return;

  if ((cursors.space.isDown || cursors.up.isDown) && player.body.touching.down) {
    player.setVelocityY(-500);
    jumpSound.play();
  }

  if (player.body.velocity.y !== 0) {
    player.play("idle", true);
  } else {
    player.play("run", true);
  }

  score += 1;
  scoreText.setText("Score: " + Math.floor(score / 10));
}

function hitObstacle(player, obstacle) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.play("idle");
  hitSound.play();
  gameOver = true;
  scoreText.setText("Game Over! Score: " + Math.floor(score / 10));
  restartText.setVisible(true);
  document.getElementById("restartBtn").style.display = "block";
}

function restartGame() {
  gameOver = false;
  score = 0;
  document.getElementById("restartBtn").style.display = "none";
  this.scene.restart();
}